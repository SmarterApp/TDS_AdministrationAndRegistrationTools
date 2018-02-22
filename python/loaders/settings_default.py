# Don't edit this file - copy to settings_secret.py file and modify that copy.
# The code will read settings_secret.py first and fallback to this file if missing.

# MONGO DB SERVER SETTINGS
MONGO_HOST = "localhost"  # "art-db-amptest.smarterbalanced.org"
MONGO_PORT = 27017
MONGO_DBNAME = "testreg"
MONGO_DISTRICTS = "districtEntity"
MONGO_INSTITUTIONS = "institutionEntity"
MONGO_STUDENTS = "student"

# BASIC DEFAULTS AND CONSTANTS
# Settings for SFTP site (for csv download)
SFTP_FILE_DIR = './Students/'  # start with ./ and end with /
SFTP_FILE_BASENAME = 'CA_students_'  # base part of filename, no file or extension.
SFTP_SCHOOL_FILE_DIR = './Schools/'  # start with ./ and end with /
SFTP_SCHOOL_FILE_BASENAME = 'CA_schools_'  # base part of school filename.
SFTP_FILE_DATEFORMAT = '%Y%m%d'  # Set to append date to filename. ex: '%Y%m%d'.
SFTP_FILE_EXT = 'zip'  # Set to append to filepath after date is added.
SFTP_HOSTNAME = 'localhost'  # sftp hostname or IP to connect to.
SFTP_PORT = 22  # Port to use for sftp. Default is 22.
SFTP_USER = 'testuser'  # Username on sftp server.
SFTP_PASSWORD = '1BigSecret!'  # Set to use password auth, else None.
SFTP_KEYFILE = None  # Set to absolute path of keyfile, else None.
SFTP_KEYPASS = None  # Set to encrypted key's password, else None.

# csv format settings
DELIMITER = '^'
FILE_ENCODING = 'latin1'  # which is also iso-8859-1 (don't use cp1252!)

# EVERYTHING BELOW ONLY APPLIES TO LOADER
NUM_STUDENTS = None
STATE_ABBREVIATION = 'CA'

# ART REST SERVER SETTINGS
ART_REST_ENDPOINT = "https://localhost:8443/rest"
ART_STUDENT_ENDPOINT = ART_REST_ENDPOINT + "/external/student/CA/batch"
ART_SSL_CHECKS = True  # Disable for dev servers with bad SSL. Make it True FOR PROD!

# SUPER SENSITIVE AUTH INFO (these are fake - put yours in settings_secret.py)
AUTH_ENDPOINT = "https://localhost/auth/oauth2/access_token?realm=/sbac"
AUTH_PAYLOAD = {
    "client_id": "me",
    "client_secret": "secret",
    "grant_type": "password",
    "password": "password",
    "username": "me@example.com"
}

# PERFORMANCE SETTINGS
CHUNK_SIZE = 10000
BUFFER_SIZE = 512 * 1024

GRADEMAP = {
    # MAPPED VALUES
    'US': 'UG',  # US goes to 'ungraded'
    'UE': 'UG',  # UE goes to 'ungraded'
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
