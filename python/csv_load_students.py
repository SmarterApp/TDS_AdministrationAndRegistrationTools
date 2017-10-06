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

import requests

# Pull settings from csv_settings.py.
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


def progress(message):
    print(message)


def main(argv):
    # do everything except post the data to the Student API (for testing)
    dry_run = False
    num_students = settings.NUM_STUDENTS
    filename = settings.FILENAME
    encoding = settings.FILE_ENCODING
    offset = 0
    delimiter = settings.DELIMITER

    try:
        opts, _ = getopt.getopt(argv, "hyn:f:e:d:o:", [
            "help", "dryrun", "number=", "file=", "encoding=", "delimiter=", "offset="])
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
        elif opt in ("-n", "--number"):
            num_students = int(arg)
        elif opt in ("-f", "--file"):
            filename = arg
        elif opt in ("-e", "--encoding"):
            encoding = arg
        elif opt in ("-o", "--offset"):
            offset = int(arg)
            print("Starting at byte offset %d" % offset)
        elif opt in ("-d", "--delimiter"):
            delimiter = arg

    print("Reading file '%s', encoding '%s', delimiter '%s'" % (filename, encoding, delimiter))
    print("Max number of students to load: %d" % num_students)

    start_time = datetime.datetime.now()
    print("\nStarting at %s" % start_time)

    endpoint = settings.ART_ENDPOINT
    username = settings.AUTH_PAYLOAD.get('username', None)
    password = settings.AUTH_PAYLOAD.get('password', None)
    load_student_data(
        filename, encoding, delimiter, num_students, offset, dry_run, endpoint, username, password, progress)

    end_time = datetime.datetime.now()
    deltasecs = (end_time - start_time).total_seconds()
    print("\nFinished at %s\n\tElapsed %s\n\tStudents/sec %0.4f\n" % (end_time, deltasecs, num_students / deltasecs))


def read_lines(filename, encoding, offset, progress):
    need_to_seek = offset != 0
    with open(filename, 'r', encoding=encoding) as file:
        waited = 0
        while True:
            where = file.tell()
            line = file.readline()
            if not line:
                if waited >= settings.WAIT_CYCLES_BEFORE_QUIT:
                    progress("Timed out waiting for data. Quitting.")
                    break
                if waited == 0:
                    progress('Waiting for data...')
                time.sleep(settings.SLEEP_INTERVAL)
                file.seek(where)
                waited += 1
            else:
                waited = 0  # reset wait count - we got some data!
                # always output the header row first, even when offset provided!
                yield (line, file.tell())
                if need_to_seek:
                    file.seek(offset)
                    need_to_seek = False


def post_students(endpoint, total_loaded, students, delimiter, bearer_token, dry_run, progress):
    student_dtos = create_student_dtos(students, delimiter)
    if not dry_run:
        location = post_student_data(endpoint, student_dtos, bearer_token)
        progress("Batch status URL: %s" % location)
    total_loaded += len(students) - 1
    progress("Completed %s %d students!" % (
        "pretending to post" if dry_run else "posting", total_loaded))
    return total_loaded


def load_student_data(filename, encoding, delimiter, num_students,
                      offset, dry_run, endpoint, username, password, progress):

    bearer_token = get_bearer_token(username, password)
    progress("Bearer token retrieved: %s" % bearer_token)

    progress("Loading %d full chunks, %d remainder" % divmod(num_students, settings.CHUNK_SIZE))
    total_loaded = 0
    students = []
    header_row = False

    for (line, where) in read_lines(filename, encoding, offset, progress):

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
            progress("Posting %d students, offset %d..." % (len(students) - 1, where))
            total_loaded = post_students(endpoint, total_loaded, students, delimiter, bearer_token, dry_run, progress)
            students = [header_row]  # Reset students for next chunk

        # If we're done, don't read file again, just exit.
        if total_loaded >= num_students:
            break

    # Post any remaining block of students from an aborted read.
    if total_loaded < num_students and len(students) > 1:
        progress("Posting final block of %d students, offset %d" % (len(students) - 1, where))
        total_loaded = post_students(endpoint, total_loaded, students, delimiter, bearer_token, dry_run, progress)

    progress("%d students read, file at byte offset %d." % (total_loaded, where))

    global gradelevels
    if gradelevels:
        progress("grade levels encountered: %s" % gradelevels)


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
    print("Loads students from CSV file into ART via REST API.")
    print("Please put your settings in settings_secret.py. Defaults are in settings_default.py.")
    print("Help/usage details:")
    print("  -y, --dryrun             : do a dry run - does everything but actually POST to ART")
    print("  -f, --file               : file to read students from")
    print("  -e, --encoding           : encoding to use when reading file")
    print("  -d, --delimiter          : delimiter to use for CSV format")
    print("  -o, --offset             : where to start reading in the file, in bytes (defaults to byte 0)")
    print("  -n, --number             : the max number of students to upload")
    print("  -h, --help               : this help screen")


if __name__ == "__main__":
    main(sys.argv[1:])
