#!/usr/bin/env python

# Python 3 required. A virtualenv is recommended. Install requirements.txt.

import csv
import datetime
import collections
import getopt
import io
import json
import sys
import unicodedata
import zipfile

import paramiko
import pymongo
import requests


STATE_ENTITY_TYPE = 'STATE'
DISTRICT_ENTITY_TYPE = 'DISTRICT'

COUNTY_CODE = 'County-District Code'
SCHOOL_CODE = 'School Code'
CDS_CODE = 'Auth CDS Code'
COUNTY_NAME = 'County Name'
DISTRICT_NAME = 'District Name'
SCHOOL_NAME = 'School Name'

LOCATION = 'location'
STATUS = 'status'
REASON = 'reason'
CONTENT = 'content'

ENTITY_ID = 'entityId'
ENTITY_NAME = 'entityName'
NAT_ID = 'nationwideIdentifier'
PARENT_EID = 'parentEntityId'
PARENT_ETYPE = 'parentEntityType'
STATE_ABBREV = 'stateAbbreviation'

FILE_TIME = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')

try:
    import settings_secret as settings
except:
    import settings_default as settings
    print("*** USING DEFAULTS in settings_default.py.")
    print("*** Please copy settings_default.py to settings_secret.py and modify that!")


if settings.ART_SSL_CHECKS is False:
    print("WARNING: Disabling insecure SSL request warnings! NOT FOR PROD!")
    requests.packages.urllib3.disable_warnings(
        requests.packages.urllib3.exceptions.InsecureRequestWarning)

gradelevels = collections.defaultdict(int)

client = pymongo.MongoClient(settings.MONGO_HOST, settings.MONGO_PORT)
db = client[settings.MONGO_DBNAME]
district_db = db[settings.MONGO_DISTRICTS]
school_db = db[settings.MONGO_INSTITUTIONS]

# Globals
lastProgressBytes = False
is_terminal = sys.stdout.isatty()


# Default callback method for reporting progress.
def progress(message, completedbytes=None, totalbytes=None):
    global lastProgressBytes, is_terminal
    if message is not None:
        if lastProgressBytes and is_terminal:
            print()  # put a newline to move down from previous carriage return
            lastProgressBytes = False
        print(message)
    else:
        end = '\n'
        if not lastProgressBytes:
            print()
            lastProgressBytes = True
        if is_terminal:
            sys.stdout.write("\r")  # Go back to beginning of line
            end = ''  # Don't put newline on output
        print("Downloading: %d/%d bytes (%0.0f%%)" % (
            completedbytes, totalbytes, 100 * float(completedbytes) / totalbytes), end=end)
        sys.stdout.flush()  # Force output in case no newline.


# Application entry point for command line execution mode.
def main(argv):

    hostname = settings.SFTP_HOSTNAME
    port = settings.SFTP_PORT
    username = settings.SFTP_USER
    password = settings.SFTP_PASSWORD
    keyfile = settings.SFTP_KEYFILE
    keypass = settings.SFTP_KEYPASS

    # Downloader command line options
    studentfile = None
    remotepath = None
    offset = 0
    # Uploader command line options
    dry_run = False
    local_only = False
    encoding = settings.FILE_ENCODING
    delimiter = settings.DELIMITER
    csv_start_line = 1
    # 9223372036854775807 ought to be enough for anybody.
    num_students = settings.NUM_STUDENTS if settings.NUM_STUDENTS else sys.maxsize
    schoolfile = None

    try:
        opts, _ = getopt.getopt(argv, "hylf:r:o:e:d:s:n:c:", [
            "help", "dryrun", "localonly", "studentfile=", "remotepath=", "offset=",
            "encoding=", "delimiter=", "csv_start_line", "number=", "schoolfile=", ])
    except getopt.GetoptError:
        usage()
        sys.exit(2)

    for opt, arg in opts:
        if opt in ("-h", "--help"):
            usage()
            sys.exit()
        elif opt in ("-y", "--dryrun"):
            dry_run = True
            print("*** DRY RUN MODE REQUESTED! NOTHING WILL BE POSTED! ***\n\n")
        elif opt in ("-l", "--localonly"):
            local_only = True
            print("*** LOCAL ONLY MODE REQUESTED! NOTHING WILL BE DOWNLOADED! ***\n\n")
        elif opt in ("-f", "--studentfile"):
            studentfile = arg
            print("Command line set studentfile to '%s'" % studentfile)
        elif opt in ("-r", "--remotepath"):
            remotepath = arg
            print("Command line set remotepath to '%s'" % remotepath)
        elif opt in ("-o", "--offset"):
            offset = int(arg)
            print("Command line set byte offset to %d. Will continue download there." % offset)
        elif opt in ("-e", "--encoding"):
            encoding = arg
        elif opt in ("-d", "--delimiter"):
            delimiter = arg
        elif opt in ("-s", "--csv_start_line"):
            csv_start_line = int(arg) if int(arg) >= 1 else 1
            print("Command line set starting csv file line to %d" % csv_start_line)
        elif opt in ("-n", "--number"):
            num_students = int(arg)
            print("Command line limiting uploaded students to %d" % num_students)
        elif opt in ("-c", "--schoolfile"):
            schoolfile = arg
            print("Command line set schoolfile to '%s'" % schoolfile)

    remoteschool = datewise_filepath(settings.SFTP_SCHOOL_FILE_DIR, settings.SFTP_SCHOOL_FILE_BASENAME)
    schoolfile = schoolfile if schoolfile else datewise_filepath(None, settings.SFTP_SCHOOL_FILE_BASENAME)

    remotepath = remotepath if remotepath else datewise_filepath(settings.SFTP_FILE_DIR, settings.SFTP_FILE_BASENAME)
    studentfile = studentfile if studentfile else datewise_filepath(None, settings.SFTP_FILE_BASENAME)

    start_time = datetime.datetime.now()
    print("\nStarting at %s\n" % start_time)

    dl_success = local_only
    if not dl_success:
        dl_success = download_file(
            hostname, port, username, password, keyfile, keypass, remoteschool, schoolfile, 0, progress)

        dl_success &= download_file(
            hostname, port, username, password, keyfile, keypass, remotepath, studentfile, offset, progress)

    end_time = datetime.datetime.now()
    deltasecs = (end_time - start_time).total_seconds()
    print("\ndownload %s at %s, Elapsed %s" % ("completed" if dl_success else "failed", end_time, deltasecs))

    if dl_success:

        bearer_token = get_bearer_token(
            settings.AUTH_PAYLOAD.get('username', None),
            settings.AUTH_PAYLOAD.get('password', None))

        # Process schools file for CDS Lookup.
        cds_lookup, districts, schools = load_schools(schoolfile, encoding, delimiter)

        if not dry_run:
            post_districts(districts, settings.ART_REST_ENDPOINT + "/district", bearer_token)
            post_schools(schools, settings.ART_REST_ENDPOINT + "/institution", bearer_token)

        upload_start_time = datetime.datetime.now()
        print("\nUpload starting at %s" % upload_start_time)
        print("Uploading from file '%s', encoding '%s', delimiter '%s'" % (studentfile, encoding, delimiter))

        students_loaded = load_student_data(studentfile, encoding, delimiter, csv_start_line, num_students, dry_run,
                                            settings.ART_STUDENT_ENDPOINT, bearer_token, cds_lookup, progress)

        end_time = datetime.datetime.now()
        deltasecs = (end_time - upload_start_time).total_seconds()
        print("\nFinished upload at %s, upload elapsed %s, students/sec %0.4f" % (
            end_time, deltasecs, students_loaded / deltasecs))

    deltasecs = (end_time - start_time).total_seconds()
    print("\nTotal Elapsed %s\n" % deltasecs)


# progress is a callback taking (message, completedbytes, totalbytes). Called frequently to display progress.
def download_file(hostname, port, username, password, keyfile, keypass, remotepath, studentfile, offset, progress):

    progress("Downloading file '%s' from '%s@%s'" % (remotepath, username, hostname))
    progress("              to './%s'" % studentfile)
    if port != 22:
        progress("    Port %d" % port)

    # First, do a sanity check on remote file and connection details.
    pkey = paramiko.rsakey.RSAKey.from_private_key_file(keyfile, keypass) if keyfile else None
    with paramiko.Transport((hostname, port)) as transport:
        transport.connect(username=username, password=password, pkey=pkey)
        with paramiko.SFTPClient.from_transport(transport) as sftp:
            progress("\nConnected.")
            with sftp.open(remotepath, bufsize=1) as remotefile:
                attribs = remotefile.stat()
                if not attribs.st_size:
                    progress("Missing or empty remote file. Exiting.")
                    return False

                # Remote file OK, now open local file and seek to requested offset.
                with open(studentfile, 'ab+') as file:
                    if offset:
                        file.seek(offset)
                        file.truncate()  # New data goes here. Get rid of old.
                        progress("Truncated file and resuming at requested byte offset %d." % offset)
                    else:
                        offset = file.tell()  # start downloading here
                        if offset > 0 and attribs.st_size != offset:
                            progress("Auto resuming existing file. Appending at byte %d." % offset)

                    # If offset is in effect, make sure remote can support it and remote file is big enough.
                    if offset > 0:
                        if attribs.st_size == offset:
                            progress("WARNING: File looks complete (local and remote sizes match). Skipping download.")
                            return True
                        elif attribs.st_size < offset:
                            progress("ERROR: File size is %d but requested offset is %d." % (attribs.st_size, offset))
                            progress("Cowardly refusing to seek past end of file.")
                            return False
                        if not remotefile.seekable():
                            progress("ERROR: Server does not support seek(). Requested offset impossible. Exiting.")
                            return False
                        remotefile.seek(offset)

                    # All systems go! Commence with the downloading.
                    bytes_remaining = attribs.st_size - offset
                    progress('Downloading %s%d bytes of %s, total size %d.' % (
                        "remaining " if offset else "", bytes_remaining, studentfile, attribs.st_size))
                    remotefile.prefetch()
                    written = 0
                    while True:
                        data = remotefile.read(settings.BUFFER_SIZE)
                        if not data:
                            break
                        file.write(data)
                        written += len(data)
                        progress(None, written, bytes_remaining)
                    progress('Download finished.')
                    return True


def read_lines(filename, encoding, csv_start_line=1):
    current_line = 0
    try:
        for file in open_csv_files(filename, encoding):
            current_line = 1  # we start reading at line 1, the header row
            line = file.readline()
            while line:
                # always read/output header row, even when skipping lines.
                if current_line >= csv_start_line or current_line == 1:
                    yield (line, current_line)
                line = file.readline()
                current_line += 1
    except Exception as e:
        print("ERROR: Exception raised reading line %d!" % current_line)
        raise e


def post_students(endpoint, total_loaded, students, delimiter, bearer_token, cds_lookup, dry_run, progress):
    student_dtos = create_student_dtos(students, delimiter, cds_lookup)
    if not dry_run:
        location = post_student_data(endpoint, student_dtos, bearer_token)
        progress("Batch status URL: %s" % location)
    total_loaded += len(students) - 1
    progress("Completed %s %d students!" % (
        "pretending to post" if dry_run else "posting", total_loaded))
    return total_loaded


def is_district(school):
    return school[COUNTY_CODE] and school[COUNTY_CODE] == school[SCHOOL_CODE]


def load_student_data(filename, encoding, delimiter, csv_start_line, num_students,
                      dry_run, endpoint, bearer_token, cds_lookup, progress):

    num_students = int(num_students) if num_students else sys.maxsize
    csv_start_line = csv_start_line if csv_start_line else 1
    total_loaded = 0
    students = []
    header_row = False

    for (line, where) in read_lines(filename, encoding, csv_start_line):

        # First line is ALWAYS header row. Stash and prepend for every chunk.
        if where == 1:
            header_row = line
            students.append(header_row)
            continue

        # How many students to post in this chunk.
        students_to_load = min(settings.CHUNK_SIZE, num_students - total_loaded)

        # No more students to load? We're done, even though there's data left.
        if students_to_load <= 0:
            break

        students.append(line)

        # If we've got a full chunk of students, post 'em!
        if len(students) - 1 >= students_to_load:
            progress("Posting %d students, ending at line %d..." % (len(students) - 1, where))
            total_loaded = post_students(
                endpoint, total_loaded, students, delimiter, bearer_token, cds_lookup, dry_run, progress)
            students = [header_row]  # Reset for new chunk

        # We uploaded what the user wanted. Exit read loop.
        if total_loaded >= num_students:
            break

    # Post the final block from final read.
    students = students[0:(num_students - total_loaded + 1)]  # Chop off any extras the user doesn't want.
    if len(students) > 1:
        progress("Posting final block of %d students, ending with line %d" % (len(students) - 1, where))
        total_loaded = post_students(
            endpoint, total_loaded, students, delimiter, bearer_token, cds_lookup, dry_run, progress)

    progress("%d total students uploaded. Ended at line %d." % (total_loaded, where))

    global gradelevels
    if gradelevels:
        progress("WARNING: Unexpected grade level values encountered: %s" % gradelevels)

    return total_loaded


def post_districts(districts, url, bearer_token):
    print("Posting districts (%d in file)..." % len(districts))
    with open("out_loader_districts_success_%s.csv" % FILE_TIME, "w", newline='') as f_success, open(
            "out_loader_districts_failed_%s.csv" % FILE_TIME, "w", newline='') as f_failed:
        fieldnames = [ENTITY_ID, ENTITY_NAME, NAT_ID, PARENT_EID, PARENT_ETYPE,
                      STATE_ABBREV]
        csv_success = csv.DictWriter(f_success, fieldnames + [LOCATION])
        csv_success.writeheader()
        csv_failed = csv.DictWriter(f_failed, fieldnames + [STATUS, REASON, CONTENT])
        csv_failed.writeheader()
        stats = {'processed': 0, 'skipped': 0, 'inserted': 0, 'failed_insert': 0, 'updated': 0, 'failed_update': 0}
        try:
            for district in districts:
                stats['processed'] += 1
                entity_id = generate_district_identifier(district[COUNTY_CODE])
                entity_name = xstr(district[DISTRICT_NAME])[:60]
                district_dto = {
                    ENTITY_ID: entity_id,
                    ENTITY_NAME: entity_name,
                    NAT_ID: entity_id,
                    PARENT_EID: settings.STATE_ABBREVIATION,
                    PARENT_ETYPE: STATE_ENTITY_TYPE,
                    STATE_ABBREV: settings.STATE_ABBREVIATION,
                }
                # Update it if it's already in the DB, else insert.
                found_district = district_db.find_one({"entityId": entity_id}, projection=['entityName'])
                if found_district:
                    if found_district.get('entityName') != entity_name:
                        try:
                            district_db.update_one({'_id': found_district.get('_id')}, {'$set': {
                                'entityName': entity_name
                            }})
                            stats['updated'] += 1
                            district_dto[LOCATION] = "updated from '%s'" % found_district.get('entityName')
                            csv_success.writerow(district_dto)
                        except Exception as e:
                            stats['failed_update'] += 1
                            district_dto[STATUS] = 'UPDATE FAILED'
                            district_dto[REASON] = 'Mongo update_one raised'
                            district_dto[CONTENT] = "Exception %s" % e
                            csv_failed.writerow(district_dto)
                    else:
                        stats['skipped'] += 1
                else:
                    headers = {"Content-Type": "application/json", "Authorization": "Bearer %s" % bearer_token}
                    response = requests.post(
                        url, headers=headers, data=json.dumps(district_dto), verify=settings.ART_SSL_CHECKS)
                    if response.status_code == 201:
                        stats['inserted'] += 1
                        district_dto[LOCATION] = response.headers["Location"]
                        csv_success.writerow(district_dto)
                    else:
                        stats['failed_insert'] += 1
                        district_dto[STATUS] = response.status_code
                        district_dto[REASON] = response.reason
                        district_dto[CONTENT] = str(json.loads(response.content))
                        csv_failed.writerow(district_dto)
        except KeyboardInterrupt:
            print("Got keyboard interrupt. Exiting district load.")
    print("post_districts complete at %s.\nstats: %s" % (datetime.datetime.now(), stats))


def post_schools(schools, url, bearer_token):
    print("Posting schools (%d in file)..." % len(schools))
    with open("out_loader_schools_success_%s.csv" % FILE_TIME, "w", newline='') as f_success, open(
            "out_loader_schools_failed_%s.csv" % FILE_TIME, "w", newline='') as f_failed:
        fieldnames = [ENTITY_ID, ENTITY_NAME, NAT_ID, PARENT_EID, PARENT_ETYPE,
                      STATE_ABBREV, STATUS]
        csv_success = csv.DictWriter(f_success, fieldnames)
        csv_success.writeheader()
        csv_failed = csv.DictWriter(f_failed, fieldnames + [REASON, CONTENT])
        csv_failed.writeheader()
        stats = {'processed': 0, 'skipped': 0, 'inserted': 0, 'failed_insert': 0, 'updated': 0, 'failed_update': 0}
        try:
            for school in schools:
                stats['processed'] += 1
                entity_id = xstr(school[CDS_CODE])
                parent_id = generate_district_identifier(school[COUNTY_CODE])
                school_name = xstr(school[SCHOOL_NAME])[:60]
                institution_dto = {
                    ENTITY_ID: entity_id,
                    ENTITY_NAME: school_name,
                    NAT_ID: entity_id,
                    PARENT_EID: parent_id,
                    PARENT_ETYPE: DISTRICT_ENTITY_TYPE,
                    STATE_ABBREV: settings.STATE_ABBREVIATION,
                }
                # Update it if it's already in the DB, else insert.
                found_school = school_db.find_one({"entityId": entity_id}, projection=['parentEntityId', 'entityName'])
                if found_school:
                    skipped = True
                    if found_school.get('entityName') != school_name:
                        skipped = False
                        try:
                            school_db.update_one({'_id': found_school.get('_id')}, {'$set': {
                                'entityName': school_name
                            }})
                            stats['updated'] += 1
                            institution_dto[STATUS] = "updated from '%s'" % found_school.get('entityName')
                            csv_success.writerow(institution_dto)
                        except Exception as e:
                            stats['failed_update'] += 1
                            institution_dto[STATUS] = 'UPDATE FAILED'
                            institution_dto[REASON] = 'Mongo update_one raised'
                            institution_dto[CONTENT] = "Exception %s" % e
                            csv_failed.writerow(institution_dto)
                    if found_school.get('parentEntityId') != parent_id:
                        skipped = False
                        institution_dto[STATUS] = 'HUMAN_NEEDED'
                        institution_dto[REASON] = 'PARENT_CHANGED'
                        institution_dto[CONTENT] = "Parent ID in DB: %s to CSV: %s" % (
                            found_school.get('parentEntityId'), parent_id)
                        stats['failed_update'] += 1
                        csv_failed.writerow(institution_dto)
                    if skipped:
                        stats['skipped'] += 1
                else:
                    headers = {"Content-Type": "application/json", "Authorization": "Bearer %s" % bearer_token}
                    response = requests.post(
                        url, headers=headers, data=json.dumps(institution_dto), verify=settings.ART_SSL_CHECKS)
                    if response.status_code == 201:
                        stats['inserted'] += 1
                        csv_success.writerow(institution_dto)
                    else:
                        stats['failed_insert'] += 1
                        institution_dto[STATUS] = response.status_code
                        institution_dto[REASON] = response.reason
                        institution_dto[CONTENT] = str(json.loads(response.content))
                        csv_failed.writerow(institution_dto)
        except KeyboardInterrupt:
            print("Got keyboard interrupt. Exiting district load.")
    print("post_schools complete at %s.\nstats: %s" % (datetime.datetime.now(), stats))


# takes a list of csv lines and parses into a DTO. row 1 must be a csv header row.
def create_student_dtos(students, delimiter, cds_lookup):
    return [create_student_dto(student, cds_lookup) for student in csv.DictReader(students, delimiter=delimiter)]


# Unused but in CSV: ConfirmationCode, Filipino, ResidentialAddress (multiple fields),
# ParentHighestEducationLevel, EnglishLanguageAcquisitionStatus,
# "Special Education District of Accountability", EnrollmentEffectiveDate,
# LastOrSurnameAlias, FirstNameAlias, MiddleNameAlias
def create_student_dto(student, cds_lookup):

    # Report on any unknown gradelevels.
    global gradelevels
    gradeLevelWhenAssessed = xstr(student['GradeLevelWhenAssessed'])
    if gradeLevelWhenAssessed not in settings.GRADEMAP:
        # Record unexpected gradelevels for later display.
        gradelevels[gradeLevelWhenAssessed] += 1
        # Map known gradelevel values to expected.
        gradeLevelWhenAssessed = settings.GRADEMAP.get(gradeLevelWhenAssessed, 'UG')

    return {
        "ssid": student['SSID'],
        "firstName": xstr(student['FirstName']),
        "middleName": xstr(student['MiddleName']),
        "lastName": xstr(student['LastOrSurname']),
        "sex": xstr(student['Sex']),
        "birthDate": xstr(student['DateofBirth']),
        "externalSsid": xstr(student['SmarterStudentID']),
        "institutionIdentifier": generate_institution_identifier(student, cds_lookup),
        "districtIdentifier": generate_district_identifier(student['ResponsibleDistrictIdentifier']),
        "gradeLevelWhenAssessed": gradeLevelWhenAssessed,
        "hispanicOrLatino": string_to_boolean(student['HispanicOrLatinoEthnicity']),
        "americanIndianOrAlaskaNative": string_to_boolean(student['AmericanIndianOrAlaskaNative']),
        "asian": string_to_boolean(student['Asian']),
        "blackOrAfricanAmerican": string_to_boolean(student['BlackOrAfricanAmerican']),
        "white": string_to_boolean(student['White']),
        "nativeHawaiianOrPacificIsland": string_to_boolean(student['NativeHawaiianOrOtherPacificIslander']),
        "twoOrMoreRaces": string_to_boolean(student['DemographicRaceTwoOrMoreRaces']),
        "firstEntryDateIntoUsSchool": xstr(student['FirstEntryDateIntoUSSchool']),
        "iDEAIndicator": string_to_boolean(student['IDEAIndicator']),
        "lepStatus": string_to_boolean(student['LEPStatus']),
        "lepEntryDate": xstr(student['LimitedEnglishProficiencyEntryDate']),
        "lepExitDate": xstr(student['LEPExitDate']),
        "elpLevel": xstr(student['EnglishLanguageProficiencyLevel']),
        "section504Status": string_to_boolean(student['Section504Status']),
        "disadvantageStatus": string_to_boolean(student['EconomicDisadvantageStatus']),
        "languageCode": xstr(student['LanguageCode']),
        "migrantStatus": string_to_boolean(student['MigrantStatus']),
        "title3ProgramType": None,
        "primaryDisabilityType": xstr(student['PrimaryDisabilityType']),
        "stateAbbreviation": xstr(student['StateAbbreviation']),
    }


def get_bearer_token(username, password):
    endpoint = settings.AUTH_ENDPOINT
    payload = settings.AUTH_PAYLOAD
    if username:
        payload['username'] = username
    if password:
        payload['password'] = password
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    response = requests.post(endpoint, headers=headers, data=payload)
    content = json.loads(response.content.decode("utf-8"))
    if response.status_code == 200:
        return content["access_token"]
    else:
        raise RuntimeError("Error retrieving access token from '%s'" % endpoint)


def post_student_data(endpoint, students, bearer_token):
    headers = {"Content-Type": "application/json", "Authorization": "Bearer %s" % bearer_token}
    response = requests.post(endpoint, headers=headers, data=json.dumps(students), verify=settings.ART_SSL_CHECKS)
    if response.status_code == 202:
        return response.headers["Location"]
    else:
        raise RuntimeError("Student API batch call failed with code: %d, %s: %s" % (
            response.status_code, response.reason, response.content))


def normalize_caseless(text):
    return unicodedata.normalize("NFKD", text.casefold())


def caseless_equal(left, right):
    return normalize_caseless(left) == normalize_caseless(right)


def string_to_boolean(str):
    if caseless_equal(xstr(str), 'yes'):
        return True
    else:
        return False


# strip string and convert None to ''
def xstr(s):
    return '' if not s else str(s).strip()


def usage():
    print("Download, extract, and upload today's school and student dump files from sFTP server.")
    print("  If a zip file is found, all files inside will be read.")
    print("\nMost settings are configured via settings files, NOT via the command line.")
    print("  To modify those settings, copy settings_default.py to settings_secret.py and edit the copy.")
    print("\nHelp/usage details:")
    print("  -h, --help               : this help screen")
    print("  -f, --studentfile        : local student file to download then read from (-l to prevent download)")
    print("  -c, --schoolfile         : local school file to download then read from (-l prevents download)")
    print("  Downloader Options:")
    print("  -r, --remotepath         : remote student filepath to download\n"
          "                             (defaults to today's file, eg: './Students/CA_students_20171005.zip')")
    print("  -o, --offset             : byte in the remote student file to start downloading\n"
          "                             (will resume download at the end of any matching file found)")
    print("  Uploader Options:")
    print("  -y, --dryrun             : do a dry run - download and parse data but do not make any changes")
    print("  -l, --localonly          : don't download anything - just use local files")
    print("  -e, --encoding           : encoding to use when processing CSV files")
    print("  -d, --delimiter          : delimiter to use when processing CSV files")
    print("  -s, --csv_start_line     : line in the student csv file to start uploading")
    print("  -n, --number             : the (max) number of students to upload\n")


# 'Exported' methods below (used by other scripts)

def open_csv_files(filename, encoding=settings.FILE_ENCODING):
    # If filename is a zip file, open first file in the zip. Otherwise open file as a CSV.
    if zipfile.is_zipfile(filename):
        with zipfile.ZipFile(filename, 'r') as zip_file:
            for csv_filename in zip_file.namelist():
                with zip_file.open(csv_filename) as csv_file:
                    yield io.TextIOWrapper(csv_file, encoding=encoding)
    else:
        with open(filename, 'r', encoding=encoding) as csv_file:
            yield csv_file


def load_schools(filename, encoding=settings.FILE_ENCODING, delimiter=settings.DELIMITER):
    rows_processed = 0
    cds_lookup = {}
    districts = []
    schools = []

    print("Processing schools file at %s..." % datetime.datetime.now())

    for school in csv.DictReader(
            [line[0] for line in read_lines(filename, encoding)], delimiter=delimiter):
        rows_processed += 1
        cds_lookup["%s%s" % (school[COUNTY_CODE], school[SCHOOL_CODE])] = school[CDS_CODE]
        schools.append(school)
        if is_district(school):
            districts.append(school)

    print("Finished schools file at %s..." % datetime.datetime.now())
    print("Processed %d rows, %d schools, %d districts, %d cds_lookup." % (
        rows_processed, len(schools), len(districts), len(cds_lookup)))

    return cds_lookup, districts, schools


# Create a 14-digit district ID with seven 0's on end, left padded with 0's.
def generate_district_identifier(district_code):
    # append seven 0's to the end of the district_code as institution placeholder
    district_id = xstr(district_code) + '0000000'
    # left pad with 0's until it's 14 characters long
    return '0' * max(14 - len(district_id), 0) + district_id


# Look up CDS Code from data in CA_students.csv file.
def generate_institution_identifier(student, cds_lookup):
    cds = cds_lookup.get(xstr(student['ResponsibleDistrictIdentifier']) + xstr(student['ResponsibleSchoolIdentifier']))
    if not cds:
        print("Did not find CDS for student %s!", student)
    return cds


# Safely appends file_path + today().strftime(file_date_format) + file_ext.
def datewise_filepath(dir, basename, date_format=settings.SFTP_FILE_DATEFORMAT, ext=settings.SFTP_FILE_EXT):
    path = str(dir) if dir else ''
    path += str(basename) if basename else ''
    path += datetime.datetime.today().strftime(date_format) if date_format else ''
    # path += (datetime.datetime.today() - datetime.timedelta(days=1)).strftime(date_format) if date_format else ''
    path += ('.' + str(ext)) if ext else ''
    return path


if __name__ == "__main__":
    main(sys.argv[1:])
