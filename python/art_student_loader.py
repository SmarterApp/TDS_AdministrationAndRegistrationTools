#!/usr/bin/env python

# Python 3 required. A virtualenv is recommended. Install requirements.txt.

import csv
import datetime
import collections
import getopt
import json
import sys
import time
import unicodedata

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
    num_students = settings.NUM_STUDENTS

    try:
        opts, _ = getopt.getopt(argv, "hyf:r:o:e:d:n:", [
            "help", "dryrun", "localfile=", "remotepath=", "offset=", "encoding=", "delimiter=", "number=", ])
    except getopt.GetoptError:
        usage()
        sys.exit(2)

    for opt, arg in opts:
        if opt in ("-h", "--help"):
            usage()
            sys.exit()
        elif opt in ("-y", "--dryrun"):
            dry_run = True
            print("\n\t*** DRY RUN MODE! NOTHING WILL BE POSTED! ***\n\n")
        elif opt in ("-f", "--localfile"):
            localfile = arg
            print("\nUsing localfile '%s'" % localfile)
        elif opt in ("-r", "--remotepath"):
            remotepath = arg
            print("\nUsing remotepath '%s'" % remotepath)
        elif opt in ("-o", "--offset"):
            offset = int(arg)
            print("\nStarting download at byte offset %d" % offset)
        elif opt in ("-e", "--encoding"):
            encoding = arg
        elif opt in ("-d", "--delimiter"):
            delimiter = arg
        elif opt in ("-n", "--number"):
            num_students = int(arg)

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

    success = download_student_csv(
        hostname, port, username, password, keyfile, keypass, remotepath, localfile, offset, progress)

    end_time = datetime.datetime.now()
    deltasecs = (end_time - start_time).total_seconds()
    print("\ndownload %s at %s, Elapsed %s" % ("completed" if success else "failed", end_time, deltasecs))

    if success:
        upload_start_time = datetime.datetime.now()
        print("\nUpload starting at %s" % upload_start_time)
        print("Uploading from file '%s', encoding '%s', delimiter '%s'" % (localfile, encoding, delimiter))
        print("Max number of students to load: %d" % num_students)

        endpoint = settings.ART_ENDPOINT
        username = settings.AUTH_PAYLOAD.get('username', None)
        password = settings.AUTH_PAYLOAD.get('password', None)

        students_loaded = load_student_data(
            localfile, encoding, delimiter, num_students, dry_run, endpoint, username, password, progress)

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

    progress("\nDownloading file '%s' from '%s@%s'" % (remotepath, username, hostname))
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
                    else:
                        offset = localfile.tell()  # start downloading here
                        if offset > 0:
                            progress("Auto resuming existing download.")

                    # If offset is specified, make sure remote can support it and remote file is big enough.
                    if offset > 0:
                        progress("    Using byte offset %d" % offset)
                        if not remotefile.seekable():
                            progress("Server does not support seek(). This disables offset/resume feature. Exiting.")
                            return False
                        if attribs.st_size == offset:
                            progress("File complete (local and remote sizes match - contents not checked).")
                            return True
                        elif attribs.st_size < offset:
                            progress("File size is %d but requested offset is %d. "
                                     "Cowardly refusing to seek past end of file." % (attribs.st_size, offset))
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


def read_lines(filename, encoding, offset, progress):
    need_to_seek = offset != 0
    with open(filename, 'r', encoding=encoding) as file:
        line = file.readline()  # always read/output header row first, even when offset provided!
        while line:
            yield (line, file.tell())
            if need_to_seek:
                file.seek(offset)
                need_to_seek = False
            line = file.readline()


def post_students(endpoint, total_loaded, students, delimiter, bearer_token, dry_run, progress):
    student_dtos = create_student_dtos(students, delimiter)
    if not dry_run:
        location = post_student_data(endpoint, student_dtos, bearer_token)
        progress("Batch status URL: %s" % location)
    total_loaded += len(students) - 1
    progress("Completed %s %d students!" % (
        "pretending to post" if dry_run else "posting", total_loaded))
    return total_loaded


def load_student_data(filename, encoding, delimiter, num_students, dry_run, endpoint, username, password, progress):

    bearer_token = get_bearer_token(username, password)
    progress("Bearer token retrieved: %s" % bearer_token)

    progress("Loading up to %d full chunks, %d remainder" % divmod(num_students, settings.CHUNK_SIZE))
    total_loaded = 0
    students = []
    header_row = False

    for (line, where) in read_lines(filename, encoding, 0, progress):

        # First line is ALWAYS header row. Stash and prepend for every chunk.
        if not header_row:
            header_row = line
            students.append(header_row)
            continue

        # How many students to post in this chunk.
        students_to_load = min(settings.CHUNK_SIZE, num_students - total_loaded)

        # No more students to load? We're done, even though there's data left.
        if students_to_load <= 0:
            break

        students.append(line)

        # If we've got enough students, post 'em!
        if len(students) - 1 >= students_to_load:
            progress("Posting %d students, at byte %d..." % (len(students) - 1, where))
            total_loaded = post_students(endpoint, total_loaded, students, delimiter, bearer_token, dry_run, progress)
            students = [header_row]  # Reset students for next chunk

        # If we're done, don't read file again, just exit.
        if total_loaded >= num_students:
            break

    # Post any remaining block of students from an aborted read.
    if total_loaded < num_students and len(students) > 1:
        progress("Posting final block of %d students, at byte %d" % (len(students) - 1, where))
        total_loaded = post_students(endpoint, total_loaded, students, delimiter, bearer_token, dry_run, progress)

    progress("%d students read, file at byte %d." % (total_loaded, where))

    global gradelevels
    if gradelevels:
        progress("grade levels encountered: %s" % gradelevels)

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
    print("  -n, --number             : the max number of students to upload before exiting\n")


if __name__ == "__main__":
    main(sys.argv[1:])
