# requirements in requirements.txt, plus requires psycopg2 module
import datetime
import getopt
import json
import psycopg2
import random
import requests
import string
import sys

# from datetime import datetime
from psycopg2 import extras

DRY_RUN = True
NUM_STUDENTS = None
ART_REST_ENDPOINT = "https://localhost:8443/rest"
ART_STUDENT_ENDPOINT = ART_REST_ENDPOINT + "/external/student/CA/batch"
AUTH_ENDPOINT = "https://localhost/auth/oauth2/access_token?realm=/sbac"
AUTH_PAYLOAD = {
    "client_id": "me",
    "client_secret": "secret",
    "grant_type": "password",
    "password": "password",
    "username": "me@example.com"
}
CHUNK_SIZE = 10000
DB_PARAMS = {'host': 'localhost', 'database': 'postgres', 'user': 'ubuntu', 'password': 'ubuntu'}
DATE_FORMAT_YYYY_MM_DD = '%Y-%m-%d'  # Date format expected in the CSV files.

offset = 0
randpercent = 0.0
randcount = 0


def main(argv):
    global randpercent
    global offset
    # number of students to create
    num_students = NUM_STUDENTS

    try:
        opts, args = getopt.getopt(argv, "hn:o:r:", ["help", "number=", "offset=", "randpercent="])
    except getopt.GetoptError:
        usage()
        sys.exit(2)

    for opt, arg in opts:
        if opt in ("-h", "--help"):
            usage()
            sys.exit()
        elif opt in ("-n", "--number"):
            print("Number of students = " + arg)
            num_students = int(arg)
        elif opt in ("-o", "--offset"):
            print("Offset (large values can be slow!) = " + arg)
            offset = int(arg)
        elif opt in ("-r", "--randpercent"):
            print("RandomMutationPercent = " + arg)
            randpercent = float(arg)

    start_time = datetime.datetime.now()
    print("\nStarting at: %s" % start_time)

    load_student_data(num_students)

    end_time = datetime.datetime.now()
    deltasecs = (end_time - start_time).total_seconds()
    print("\nStarting at: %s" % start_time)
    print("\nFinished at: %s\n\tElapsed %s\n\tStudents/sec %0.4f\n\tMutated/sec  %0.4f\n" % (
        end_time, deltasecs, num_students / deltasecs, randcount / deltasecs))
    print("Randomized %d of %d students (got %0.2f%% wanted %0.2f%%)." % (
        randcount, num_students, 100.0 * randcount / num_students, randpercent))


def connect_db(db_params):
    try:
        conn = psycopg2.connect(**db_params)
        return conn
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
        sys.exit(1)


def load_student_data(num_students):
    # let's break up the creation of students into chunks to keep from killing
    # the API endpoint, which was never designed to handle 1,000,000 student inserts
    # at a time
    bearer_token = get_bearer_token()

    print("\nLoading %d full chunks, %d remainder" % divmod(num_students, CHUNK_SIZE))
    total_loaded = 0

    db_params = DB_PARAMS
    db_conn = connect_db(db_params)
    cursor = db_conn.cursor(name="server_side_cursor", cursor_factory=extras.RealDictCursor)
    cursor.arraysize = CHUNK_SIZE
    cursor.itersize = CHUNK_SIZE

    # cursor.execute('SELECT * FROM "public"."tmp_students" ORDER BY "SSID" OFFSET %d' % offset)
    cursor.execute('SELECT * FROM "public"."CA_students" ORDER BY "SSID" OFFSET %d' % offset)

    while True:
        remaining = num_students - total_loaded
        print("Loading %d students (%d remaining)..." % (min(CHUNK_SIZE, remaining), remaining))
        students = cursor.fetchmany(min(CHUNK_SIZE, num_students - total_loaded))
        if not students:
            break
        print("\nPosting %d students..." % len(students))
        post_student_data(students, bearer_token)
        total_loaded += len(students)
        print("Completed posting %d students!\n" % total_loaded)
        if total_loaded >= num_students:
            break
    print("Fetched no more")


def id_generator(size=7, chars=string.ascii_uppercase + string.digits):
    return ''.join(random.choice(chars) for _ in range(size))


def random_boolean():
    return random.choice(True, False)


# mutate a dto some percent of the time
def randomize_dto(student_dto):
    global randcount
    # import pdb; pdb.set_trace()
    if random.random() * 100 <= randpercent:
        first = "First" + id_generator()
        # print "Randomizing %s from %s to %s!" % (
        #    student_dto['ssid'], student_dto['firstName'], first)
        student_dto['firstName'] = first
        randcount += 1


def create_student_dto(student):
    student_dto = {
        "ssid": student['SSID'],
        "firstName": student['FirstName'],
        "middleName": student['MiddleName'],
        "lastName": student['LastOrSurname'],
        "sex": student['Sex'],
        "birthDate": date_to_yyyy_mm_dd_str(student['DateOfBirth']),
        "externalSsid": student['SmarterStudentID'],
        "institutionIdentifier": generate_institution_identifier(student),
        "districtIdentifier": student['ResponsibleDistrictIdentifier'],
        "gradeLevelWhenAssessed": student['GradeLevelWhenAssessed'],
        "hispanicOrLatino": string_to_boolean(student['HispanicOrLatinoEthnicity']),
        "americanIndianOrAlaskaNative": string_to_boolean(student['AmericanIndianOrAlaskaNative']),
        "asian": string_to_boolean(student['Asian']),
        "blackOrAfricanAmerican": string_to_boolean(student['BlackOrAfricanAmerican']),
        "white": string_to_boolean(student['White']),
        "nativeHawaiianOrPacificIsland": string_to_boolean(student['NativeHawaiianOrOtherPacificIslander']),
        "twoOrMoreRaces": string_to_boolean(student['DemographicRaceTwoOrMoreRaces']),
        "firstEntryDateIntoUsSchool": student['FirstEntryDateIntoUSSchool'],
        "iDEAIndicator": string_to_boolean(student['IDEAIndicator']),
        "lepStatus": string_to_boolean(student['LEPStatus']),
        "lepEntryDate": student['LimitedEnglishProficiencyEntryDate'],
        "lepExitDate": student['LEPExitDate'],
        "elpLevel": student['EnglishLanguageProficiencyLevel'],
        "section504Status": string_to_boolean(student['Section504Status']),
        "disadvantageStatus": string_to_boolean(student['EconomicDisadvantageStatus']),
        "languageCode": xstr(student['LanguageCode']).lower(),
        "migrantStatus": string_to_boolean(student['MigrantStatus']),
        "title3ProgramType": None,
        "primaryDisabilityType": student['PrimaryDisabilityType'],
        "stateAbbreviation": student['StateAbbreviation'],
    }

    randomize_dto(student_dto)
    ensure_valid_dto(student_dto)

    return student_dto


# Due to duplicate school IDs in the source CALPADS data I mashed the
# district and school IDs together to create unique IDs
def generate_institution_identifier(student):
    return '%s%s' % (student['ResponsibleDistrictIdentifier'], student['ResponsibleSchoolIdentifier'])


def ensure_valid_dto(student_dto):
    ensure_race_selected(student_dto)
    ensure_first_date_of_entry_after_date_of_birth(student_dto)


# each student has to have at least one demographic racial selector set
def ensure_race_selected(student_dto):
    race_flags = ['white', 'hispanicOrLatino', 'asian', 'blackOrAfricanAmerican', 'americanIndianOrAlaskaNative',
                  'nativeHawaiianOrPacificIsland', 'twoOrMoreRaces']
    race_selected = False
    for race in race_flags:
        race_selected = student_dto[race] or race_selected
        if race_selected:
            return

    if not race_selected:
        student_dto['white'] = True


# the student's first date of entry into US schools has to be
# after the year of their birth
def ensure_first_date_of_entry_after_date_of_birth(student_dto):
    dob_str = student_dto['birthDate']
    entry_date_str = student_dto['firstEntryDateIntoUsSchool']

    # if we don't have a date of birth the data shouldn't get into
    # ART, so bail out here and let the server-side validation fail
    if not dob_str:
        return

    dob = datetime.datetime.strptime(dob_str, DATE_FORMAT_YYYY_MM_DD)

    if entry_date_str:
        entry_date = datetime.datetime.strptime(entry_date_str, DATE_FORMAT_YYYY_MM_DD)
        if entry_date < dob + datetime.timedelta(days=366):
            entry_date = dob + datetime.timedelta(days=366)

    # set the entry date to the date of birth day and month, one year later
    # if that's not a valid date, make it a day after that, one year later
    if not entry_date_str or (entry_date_str <= dob_str):
        entry_date = dob + datetime.timedelta(days=366)
        # try:
        #     entry_date = entry_date.replace(year = dob.year + 1)
        # except ValueError:
        #     entry_date = dob + (date(dob.year + 1, 1, 1) - date(dob.year, 1, 1))

        # dates cannot be in the future, so check that
        if entry_date > datetime.datetime.today():
            entry_date = datetime.datetime.today()

    entry_date_str = date_to_yyyy_mm_dd_str(entry_date)
    # first_name = student_dto['firstName']
    # last_name = student_dto['lastName']
    # print("** Fixing firstEntryDateIntoUsSchool for %s %s as: DOB %s, entry %s" %
    #       (first_name, last_name, dob_str, entry_date_str))
    student_dto['firstEntryDateIntoUsSchool'] = entry_date_str


def get_bearer_token():
    endpoint = AUTH_ENDPOINT
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    payload = AUTH_PAYLOAD
    response = requests.post(endpoint, headers=headers, data=payload)
    content = json.loads(response.content)
    if response.status_code == 200:
        bearer_token = content["access_token"]
        print("Bearer token retrieved: %s" % bearer_token)
        return bearer_token
    else:
        raise RuntimeError("Error retrieving SBAC access token")


def post_student_data(students, bearer_token):
    endpoint = ART_STUDENT_ENDPOINT
    headers = {"Content-Type": "application/json", "Authorization": "Bearer %s" % bearer_token}

    if not DRY_RUN:
        response = requests.post(endpoint, headers=headers, data=json.dumps(
            [create_student_dto(student) for student in students]))

        if response.status_code == 202:
            location = response.headers["Location"]
            print("Batch status URL: %s" % location)
            return location
        else:
            print("Student API batch call failed with code: %d, %s: %s" % (
                response.status_code, response.reason, response.content))
            sys.exit(1)


def string_to_boolean(str):
    if (str == 'Yes') or (str == 'yes'):
        return True
    else:
        return False


def date_to_yyyy_mm_dd_str(date):
    if date is None:
        return ''
    else:
        return date.strftime(DATE_FORMAT_YYYY_MM_DD)


# handle None when we expect a string
def xstr(s):
    return '' if s is None else str(s)


def usage():
    print("Help/usage details:")
    print("  -n, --number             : the number of students to create")
    print("  -h, --help               : this help screen")


main(sys.argv[1:])
