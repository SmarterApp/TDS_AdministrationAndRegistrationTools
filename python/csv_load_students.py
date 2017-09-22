#!/usr/local/bin/python3

import csv
import datetime
import collections
import getopt
import json
import sys
import time
import unicodedata

import requests

DEFAULT_NUM_STUDENTS = 10000000  # 10 million ought to be enough for anybody.
DEFAULT_FILENAME = 'students.csv'
DEFAULT_DELIMITER = '^'
DEFAULT_FILE_ENCODING = 'cp1252'
DATE_FORMAT_YYYY_MM_DD = '%Y-%m-%d'

SLEEP_INTERVAL = 0.25  # how long to sleep while waiting on the file for data
WAIT_CYCLES_BEFORE_QUIT = 20  # how many SLEEP_INTERVALS to wait with no data before quitting
CHUNK_SIZE = 10000

GRADEMAP = {
    # MAPPED VALUES
    'US': 'PS',  # TODO: temporary - what is US?
    'UE': 'UG',  # TODO: temporary - what is UE?
    'KN': 'KG',  # KN -> KG (kindergarten)
    # IDENTITIES
    'IT': 'IT',  # UNKNOWN, NOT IN DROPDOWN (BUT ART ACCEPTED)
    'PR': 'PR',  # PRESCHOOL
    'PK': 'PK',  # PRE-K
    'TK': 'TK',  # TRANSITIONAL KG
    'KG': 'KG',  # KINDERGARTEN
    '01': '01',
    '02': '02',
    '03': '03',
    '04': '04',
    '05': '05',
    '06': '06',
    '07': '07',
    '08': '08',
    '09': '09',
    '10': '10',
    '11': '11',
    '12': '12',
    '13': '13',
    'PS': 'PS',  # POST SECONDARY
    'UG': 'UG',  # UNGRADED
}
gradelevels = collections.defaultdict(int)


def main(argv):
    # do everything except post the data to the Student API (for testing)
    dry_run = False
    num_students = DEFAULT_NUM_STUDENTS
    filename = DEFAULT_FILENAME
    encoding = DEFAULT_FILE_ENCODING
    offset = 0
    delimiter = DEFAULT_DELIMITER

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

    load_student_data(filename, encoding, delimiter, num_students, offset, dry_run)

    end_time = datetime.datetime.now()
    deltasecs = (end_time - start_time).total_seconds()
    print("\nFinished at %s\n\tElapsed %s\n\tStudents/sec %0.4f\n" % (end_time, deltasecs, num_students / deltasecs))


def read_lines(filename, encoding, offset):
    need_to_seek = offset != 0
    with open(filename, 'r', encoding=encoding) as file:
        waited = 0
        while True:
            where = file.tell()
            line = file.readline()
            if not line:
                if waited >= WAIT_CYCLES_BEFORE_QUIT:
                    print("\n\nTimed out waiting for data. Quitting.")
                    break
                if waited == 0:
                    print('\nWaiting for data.', end='', flush=True)
                else:
                    print('.', end='', flush=True)
                time.sleep(SLEEP_INTERVAL)
                file.seek(where)
                waited += 1
            else:
                waited = 0  # reset wait count - we got some data!
                # always output the header row first, even when offset provided!
                yield (line, file.tell())
                if need_to_seek:
                    file.seek(offset)
                    need_to_seek = False


def post_students(total_loaded, students, delimiter, bearer_token, dry_run):
    print("\nPosting %d students..." % (len(students) - 1))
    student_dtos = create_student_dtos(students, delimiter)
    if not dry_run:
        post_student_data(student_dtos, bearer_token)
    total_loaded += len(students) - 1
    print("Completed %s %d students!\n" % (
        "pretending to post" if dry_run else "posting", total_loaded))
    return total_loaded


def load_student_data(filename, encoding, delimiter, num_students, offset, dry_run):
    bearer_token = get_bearer_token()

    print("\nLoading %d full chunks, %d remainder" % divmod(num_students, CHUNK_SIZE))
    total_loaded = 0
    students = []
    header_row = False

    for (line, where) in read_lines(filename, encoding, offset):

        # First line is ALWAYS header row. Stash and prepend for every chunk.
        if not header_row:
            header_row = line
            students.append(header_row)
            continue

        # How many students to post in this chunk.
        students_to_load = min(CHUNK_SIZE, num_students - total_loaded)

        # No more students to load? We're done, even though there's data left.
        if students_to_load <= 0:
            break

        students.append(line)

        # If we've got enough students, post 'em!
        if len(students) - 1 >= students_to_load:
            total_loaded = post_students(total_loaded, students, delimiter, bearer_token, dry_run)
            students = [header_row]  # Reset students for next chunk

        # If we're done, don't read file again, just exit.
        if total_loaded >= num_students:
            break

    # Post any remaining block of students from an aborted read.
    if total_loaded < num_students and len(students) > 1:
        print("Posting final block of %d students" % (len(students) - 1))
        total_loaded = post_students(total_loaded, students, delimiter, bearer_token, dry_run)

    print("%d students read, file at byte offset %d." % (total_loaded, where))

    global gradelevels
    if gradelevels:
        print("grade levels encountered: %s" % gradelevels)


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
    if gradeLevelWhenAssessed not in GRADEMAP:
        # Record unexpected gradelevels for later display.
        gradelevels[gradeLevelWhenAssessed] += 1
    # Map known gradelevel values to expected.
    gradeLevelWhenAssessed = GRADEMAP.get(gradeLevelWhenAssessed, 'UG')

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


def get_bearer_token():
    endpoint = "https://sso-deployment.sbtds.org/auth/oauth2/access_token?realm=/sbac"
    headers = {"Content-Type": "application/x-www-form-urlencoded"}

    payload = {
        "client_id": "pm",
        "client_secret": "sbac12345",
        "grant_type": "password",
        "password": "password",
        "username": "prime.user@example.com"
    }

    response = requests.post(endpoint, headers=headers, data=payload)
    content = json.loads(response.content)

    if response.status_code == 200:
        bearer_token = content["access_token"]
        print("Bearer token retrieved: %s" % bearer_token)
        return bearer_token
    else:
        raise RuntimeError("Error retrieving SBAC access token")


def post_student_data(students, bearer_token):
    # endpoint = "https://art-capacity-test.sbtds.org/rest/external/student/CA/batch"
    endpoint = "https://localhost:8443/rest/external/student/CA/batch"
    headers = {"Content-Type": "application/json", "Authorization": "Bearer %s" % bearer_token}
    response = requests.post(endpoint, headers=headers, data=json.dumps(students), verify=False)
    if response.status_code == 202:
        location = response.headers["Location"]
        print("Batch status URL: %s" % location)
        return location
    else:
        print("Student API batch call failed with code: %d, %s: %s" % (
            response.status_code, response.reason, response.content))
        sys.exit(1)


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
    print("Help/usage details:")
    print("  -f, --file               : file to read students from (defaults to students.csv)")
    print("  -e, --encoding           : encoding to use when reading file (defaults to cp1252 (windows))")
    print("  -d, --delimiter          : delimiter to use for CSV format (defaults to '^' (carat))")
    print("  -o, --offset             : where to start reading in the file, in bytes (defaults to 0 (beginning))")
    print("  -n, --number             : the max number of students to upload (defaults to 10,000,000)")
    print("  -h, --help               : this help screen")


main(sys.argv[1:])
