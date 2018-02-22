# requirements in requirements.txt, plus requires pymongo
import datetime
import getopt
import json
import random
import string
import sys

from pymongo import MongoClient
import requests

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
MONGO_PARAMS = "mongodb://art:foo@localhost:27017/art"
CHUNK_SIZE = 10000


requests.packages.urllib3.disable_warnings(
    requests.packages.urllib3.exceptions.InsecureRequestWarning)


class Student:
    def __init__(self, connection, institutions, grade_levels, language_codes, birthdate, entrydate):
        self.set_institutions(connection, institutions)
        self.set_grade_levels(grade_levels)
        self.set_language_codes(language_codes)
        self.birthdate = birthdate
        self.entrydate = entrydate

    def set_institutions(self, connection, institution_ids):
        try:
            client = MongoClient(connection)
            db = client.art

            # get the matching institutions objects
            if len(institution_ids) != 0:
                self.institutions = list(db.institutionEntity.find({"entityId": {"$in": institution_ids}}))
            else:
                self.institutions = list(db.institutionEntity.find({}))
        except:
            print("Unable to connect to ART mongodb to obtain institution/entity information.")
            print("A seed file will still be generated, but will not be importable in ART.")
            self.institutions = []

    def set_grade_levels(self, grade_levels):
        # default to grades 3-12 if none provided
        if len(grade_levels) == 0:
            grade_levels = range(3, 12)
        # clean up grade levels to make sure that they are 2 digits
        self.grade_levels = ["{0:0>2}".format(grade_level) for grade_level in grade_levels]

    def set_language_codes(self, language_codes):
        # default to 3 random lowercase 3-letter codes
        # self.language_codes = [''.join(random.choice(string.ascii_lowercase) for _ in range(3)) for _ in range(3)]
        # default to english
        if len(language_codes) == 0:
            self.language_codes = ['eng']
        else:
            # remove any blank codes
            self.language_codes = [code for code in language_codes if len(code) > 0]

    def create_random_dtos(self, num_students):
        return [self.create_random_dto() for _ in range(0, num_students)]

    def create_random_dto(self):
        day_separator = 1501
        obj_id = id_generator()
        institution_object = random.choice(self.institutions)
        grade_level = random.choice(self.grade_levels)
        language_code = random.choice(self.language_codes)
        birthdate = self.birthdate if self.birthdate is not None else datetime.date.fromordinal(
            datetime.date.today().toordinal() - 1500 - random.randint(day_separator, 3000)).strftime("%F")
        race = [False, False, False, False, False, False]
        if random_boolean():
            race[random.randint(0, 5)] = True  # 50/50 chance you get a race set

        return {
            "ssid": 'ASTDNT' + obj_id,
            "stateAbbreviation": "CA",
            "institutionIdentifier": institution_object['entityId'],
            "districtIdentifier": institution_object['parentEntityId'],
            "firstName": 'Name' + obj_id + id_generator(24),
            "lastName": 'LastName' + obj_id + id_generator(85),
            "middleName": 'MiddleName' + obj_id + id_generator(18),
            "birthDate": birthdate,
            "externalSsid": 'STDNT' + obj_id,
            "gradeLevelWhenAssessed": grade_level,
            "sex": "Female" if random.randint(0, 1) == 0 else "Male",
            "hispanicOrLatino": race[0],
            "americanIndianOrAlaskaNative": race[1],
            "asian": race[2],
            "blackOrAfricanAmerican": race[3],
            "white": race[4],
            "nativeHawaiianOrPacificIsland": race[5],
            "twoOrMoreRaces": random_boolean(),
            "iDEAIndicator": random_boolean(),
            "lepStatus": random_boolean(),
            "section504Status": random_boolean(),
            "disadvantageStatus": random_boolean(),
            "languageCode": language_code,
            "migrantStatus": random_boolean(),
            "firstEntryDateIntoUsSchool": self.entrydate,
            "lepEntryDate": None,
            "lepExitDate": None,
            "title3ProgramType": None,
            "primaryDisabilityType": None,
            "elpLevel": 0
        }


def main(argv):
    bearer_token = get_bearer_token()
    num_students = NUM_STUDENTS
    institution_ids = []
    grade_levels = []
    language_codes = []
    birthdate = None
    entrydate = None
    connection = MONGO_PARAMS
    seed = None

    try:
        opts, args = getopt.getopt(argv, "hn:i:g:l:b:d:c:s:",
                                   ["help", "number=", "institutions=", "grades=", "langs=", "birthdate="
                                    "entrydate=", "connection=", "seed="])
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
        elif opt in ("-i", "--institutions"):
            print("Institutions = " + arg)
            institution_ids = arg.split(',')
        elif opt in ("-c", "--connection"):
            print("Connection string = " + arg)
            connection = arg
        elif opt in ("-g", "--grades"):
            print("Grades = " + arg)
            grade_levels = arg.split(',')
        elif opt in ("-l", "--langs"):
            print("Language Codes = " + arg)
            language_codes = arg.split(',')
        elif opt in ("-b", "--birthdate"):
            print("birthdate = " + arg)
            birthdate = arg
        elif opt in ("-d", "--entrydate"):
            print("entrydate = " + arg)
            entrydate = arg
        elif opt in ("-s", "--seed"):
            print("Seed = " + arg)
            seed = int(arg)

    random.seed(seed)  # None, the default, gets you a default random seed

    student = Student(connection, institution_ids, grade_levels, language_codes, birthdate, entrydate)

    # let's break up the creation of students into chunks to keep from killing
    # the API endpoint, which was never designed to handle 1,000,000 student inserts
    # at a time
    chunks, remainder = divmod(num_students, CHUNK_SIZE)
    print("\nGenerating %d chunks, %d remainder" % (chunks, remainder))

    print("\nStarting at: %s" % datetime.datetime.now())

    for chunk in range(0, chunks):
        print("\nGenerating and posting %d students..." % CHUNK_SIZE)
        generate_and_post_student_data(CHUNK_SIZE, student, bearer_token)

    if remainder > 0:
        print("\nGenerating and posting %d students..." % remainder)
        generate_and_post_student_data(remainder, student, bearer_token)


def generate_and_post_student_data(num_students, student, bearer_token):
    data = student.create_random_dtos(num_students)
    # write_data_file(data)
    post_student_batch_data(bearer_token, data)


def write_data_file(data):
    print("Creating jsonStudents.txt at current directory")
    with open('jsonStudents.txt', 'w') as outfile:
        json.dump(data, outfile)


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


def post_student_batch_data(bearer_token, data):
    endpoint = ART_STUDENT_ENDPOINT
    headers = {"Content-Type": "application/json", "Authorization": "Bearer %s" % bearer_token}
    response = requests.post(endpoint, headers=headers, data=json.dumps(data), verify=False)
    if response.status_code == 202:
        location = response.headers["Location"]
        print("Batch status URL: %s" % location)
        return location
    else:
        print("Student API batch call failed with code: %d" % response.status_code)
        return None


def id_generator(size=7, chars=string.ascii_uppercase + string.digits):
    return ''.join(random.choice(chars) for _ in range(size))


def random_boolean_or_none():
    return random.choice((None, True, False))


def random_boolean():
    return random.choice((True, False))


def usage():
    print("Help/usage details:")
    print("  -c, --connection 	: mongo connection string (defaults to mongodb://localhost:27017/)")
    print("  -n, --number     	: the number of students to create")
    print("  -i, --institutions : comma separated list of institution entityIds to use (from the institutionEntity")
    print("                         collection). if none provided it will use all available")
    print("  -g, --grades      	: comma separated list of grade levels to choose from. default to 3-12")
    print("  -h, --help       	: this help screen")


main(sys.argv[1:])
