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
import requests


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


# This is a callback method for reporting progress. Gets replaced by launcher GUI.
def progress(message, bytes_written=None, bytes_remaining=None):
    if message is not None:
        print(message)
    else:
        print("%d of %d bytes written" % (bytes_written, bytes_remaining))
        # print("%d/%d (%0.1f%%)" % (bytes_so_far, totalbytes, float(bytes_so_far)/totalbytes*100))


# Application entry point for command line execution mode.
def main(argv):

    hostname = settings.SFTP_HOSTNAME
    port = settings.SFTP_PORT
    username = settings.SFTP_USER
    password = settings.SFTP_PASSWORD
    keyfile = settings.SFTP_KEYFILE
    keypass = settings.SFTP_KEYPASS

    # Downloader command line options
    localfile = None
    remotepath = None
    offset = 0
    # Uploader command line options
    dry_run = False
    encoding = settings.FILE_ENCODING
    delimiter = settings.DELIMITER
    csv_start_line = 1
    # 9223372036854775807 ought to be enough for anybody.
    num_students = settings.NUM_STUDENTS if settings.NUM_STUDENTS else sys.maxsize

    try:
        opts, _ = getopt.getopt(argv, "hyf:r:o:e:d:s:n:", [
            "help", "dryrun", "localfile=", "remotepath=", "offset=",
            "encoding=", "delimiter=", "csv_start_line", "number=", ])
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
        elif opt in ("-f", "--localfile"):
            localfile = arg
            print("Command line set localfile to '%s'" % localfile)
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

    remotepath = remotepath if remotepath else datewise_filepath(
        settings.SFTP_FILE_DIR,
        settings.SFTP_FILE_BASENAME,
        settings.SFTP_FILE_DATEFORMAT,
        settings.SFTP_FILE_EXT)
    localfile = localfile if localfile else datewise_filepath(
        None,
        settings.SFTP_FILE_BASENAME,
        settings.SFTP_FILE_DATEFORMAT,
        settings.SFTP_FILE_EXT)

    start_time = datetime.datetime.now()
    print("\nStarting at %s\n" % start_time)

    dl_success = download_student_csv(
        hostname, port, username, password, keyfile, keypass, remotepath, localfile, offset, progress)

    end_time = datetime.datetime.now()
    deltasecs = (end_time - start_time).total_seconds()
    print("\ndownload %s at %s, Elapsed %s" % ("completed" if dl_success else "failed", end_time, deltasecs))

    if dl_success:
        upload_start_time = datetime.datetime.now()
        print("\nUpload starting at %s" % upload_start_time)
        print("Uploading from file '%s', encoding '%s', delimiter '%s'" % (localfile, encoding, delimiter))

        endpoint = settings.ART_ENDPOINT
        username = settings.AUTH_PAYLOAD.get('username', None)
        password = settings.AUTH_PAYLOAD.get('password', None)

        students_loaded = load_student_data(localfile, encoding, delimiter, csv_start_line, num_students,
                                            dry_run, endpoint, username, password, progress)

        end_time = datetime.datetime.now()
        deltasecs = (end_time - upload_start_time).total_seconds()
        print("\nFinished upload at %s, upload elapsed %s, students/sec %0.4f" % (
            end_time, deltasecs, students_loaded / deltasecs))

    deltasecs = (end_time - start_time).total_seconds()
    print("\nTotal Elapsed %s\n" % deltasecs)


# Safely appends file_path + today().strftime(file_date_format) + file_ext.
def datewise_filepath(dir, basename, date_format, ext):
    path = str(dir) if dir else ''
    path += str(basename) if basename else ''
    path += datetime.datetime.today().strftime(date_format) if date_format else ''
    path += ('.' + str(ext)) if ext else ''
    return path


# progress is a callback taking (message, bytes_written, bytes_remaining). Called frequently to display progress.
def download_student_csv(hostname, port, username, password, keyfile, keypass, remotepath, localfile, offset, progress):

    progress("Downloading file '%s' from '%s@%s'" % (remotepath, username, hostname))
    progress("              to './%s'" % localfile)
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
                with open(localfile, 'ab+') as localfile:
                    if offset:
                        localfile.seek(offset)
                        localfile.truncate()  # New data goes here. Get rid of old.
                        progress("Truncated file and resuming at requested byte offset %d." % offset)
                    else:
                        offset = localfile.tell()  # start downloading here
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
                        "remaining " if offset else "", bytes_remaining, localfile, attribs.st_size))
                    remotefile.prefetch()
                    written = 0
                    while True:
                        data = remotefile.read(settings.BUFFER_SIZE)
                        if not data:
                            break
                        localfile.write(data)
                        written += len(data)
                        progress(None, written, bytes_remaining)
                    progress('Download finished.')
                    return True


def open_csv_files(filename, encoding):
    # If filename is a zip file, open first file in the zip. Otherwise open file as a CSV.
    if zipfile.is_zipfile(filename):
        with zipfile.ZipFile(filename, 'r') as zip_file:
            for csv_filename in zip_file.namelist():
                with zip_file.open(csv_filename) as csv_file:
                    yield io.TextIOWrapper(csv_file, encoding=encoding)
    else:
        with open(filename, 'r', encoding=encoding) as csv_file:
            yield csv_file


def read_lines(filename, encoding, csv_start_line):
    for file in open_csv_files(filename, encoding):
        current_line = 1  # we start reading at line 1, the header row
        line = file.readline()
        while line:
            # always read/output header row, even when skipping lines.
            if current_line >= csv_start_line or current_line == 1:
                yield (line, current_line)
            line = file.readline()
            current_line += 1


def post_students(endpoint, total_loaded, students, delimiter, bearer_token, dry_run, progress):
    student_dtos = create_student_dtos(students, delimiter)
    if not dry_run:
        location = post_student_data(endpoint, student_dtos, bearer_token)
        progress("Batch status URL: %s" % location)
    total_loaded += len(students) - 1
    progress("Completed %s %d students!" % (
        "pretending to post" if dry_run else "posting", total_loaded))
    return total_loaded


def load_student_data(
        filename, encoding, delimiter, csv_start_line, num_students, dry_run, endpoint, username, password, progress):

    num_students = int(num_students) if num_students else sys.maxsize
    encoding = encoding if encoding else settings.FILE_ENCODING
    delimiter = delimiter if delimiter else settings.DELIMITER
    csv_start_line = csv_start_line if csv_start_line else 1
    total_loaded = 0
    students = []
    header_row = False
    bearer_token = get_bearer_token(username, password)

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
            total_loaded = post_students(endpoint, total_loaded, students, delimiter, bearer_token, dry_run, progress)
            students = [header_row]  # Reset for new chunk

        # We uploaded what the user wanted. Exit read loop.
        if total_loaded >= num_students:
            break

    # Post the final block from final read.
    students = students[0:(num_students - total_loaded + 1)]  # Chop off any extras the user doesn't want.
    if len(students) > 1:
        progress("Posting final block of %d students, ending with line %d" % (len(students) - 1, where))
        total_loaded = post_students(endpoint, total_loaded, students, delimiter, bearer_token, dry_run, progress)

    progress("%d total students uploaded. Ended at line %d." % (total_loaded, where))

    global gradelevels
    if gradelevels:
        progress("WARNING: Unexpected grade level values encountered: %s" % gradelevels)

    return total_loaded


# takes a list of csv lines and parses into a DTO. row 1 must be a csv header row.
def create_student_dtos(students, delimiter):
    return [create_student_dto(student) for student in csv.DictReader(students, delimiter=delimiter)]


# Unused but in CSV: ConfirmationCode, Filipino, ResidentialAddress (multiple fields),
# ParentHighestEducationLevel, EnglishLanguageAcquisitionStatus,
# "Special Education District of Accountability", EnrollmentEffectiveDate,
# LastOrSurnameAlias, FirstNameAlias, MiddleNameAlias
def create_student_dto(student):

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
        "institutionIdentifier": generate_institution_identifier(student),
        "districtIdentifier": xstr(student['ResponsibleDistrictIdentifier']),
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


# Due to duplicate school IDs in the source CALPADS data I mashed the
# district and school IDs together to create unique IDs
def generate_institution_identifier(student):
    return '%s%s' % (xstr(student['ResponsibleDistrictIdentifier']), xstr(student['ResponsibleSchoolIdentifier']))


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
    print("Download, extract, and upload today's student dump from CALPADS sFTP server into ART.")
    print("  If a zip file is fetched, the first file inside will be extracted then uploaded to ART.")
    print("\nMost settings are configured via settings files, NOT via this command line!")
    print("  To modify those settings, copy settings_default.py to settings_secret.py and edit the copy.")
    print("\nHelp/usage details:")
    print("  -h, --help               : this help screen")
    print("  -f, --localfile          : local filename to write into. defaults to 'today's filename'")
    print("  Downloader Options:")
    print("  -r, --remotepath         : remote filepath to download\n"
          "                             (defaults to today's file, eg: './Students/CA_students_20171005.zip')")
    print("  -o, --offset             : byte in the file to start downloading\n"
          "                             (will resume download at the end of any matching file found)")
    print("  Uploader Options:")
    print("  -y, --dryrun             : do a dry run - does everything except actually POST to ART")
    print("  -e, --encoding           : encoding to use when processing CSV file")
    print("  -d, --delimiter          : delimiter to use when processing CSV file")
    print("  -s, --csv_start_line     : line in the csv file to start uploading")
    print("  -n, --number             : the (max) number of students to upload\n")


if __name__ == "__main__":
    main(sys.argv[1:])
