# Don't edit this file - copy to settings_secret.py file and modify that copy.
# The code will read settings_secret.py first and fallback to this file if missing.

# BASIC DEFAULTS AND CONSTANTS
NUM_STUDENTS = 10000000  # 10 million ought to be enough for anybody.
FILENAME = 'students.csv'
ART_ENDPOINT = "https://localhost:8443/rest/external/student/CA/batch"

# SUPER SENSITIVE AUTH INFO (these are fake - put yours in settings_secret.py)
AUTH_ENDPOINT = "https://localhost/auth/oauth2/access_token?realm=/sbac"
AUTH_PAYLOAD = {
    "client_id": "me",
    "client_secret": "secret",
    "grant_type": "password",
    "password": "password",
    "username": "me@example.com"
}

# RUNTIME SETTINGS
DATE_FORMAT_YYYY_MM_DD = '%Y-%m-%d'
CHUNK_SIZE = 10000
SLEEP_INTERVAL = 0.25  # how long to sleep while waiting on the file for data
WAIT_CYCLES_BEFORE_QUIT = 20  # how many SLEEP_INTERVALS to wait with no data before quitting

# SETTINGS for csv_load_students only
DELIMITER = '^'
FILE_ENCODING = 'cp1252'
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
SFTP_HOSTNAME = 'localhost'
SFTP_PORT = 22
SFTP_PASSWORD = '1bigsecret'
SFTP_USER = 'testuser'
SFTP_DIRECTORY = './calpads/'  # start with ./, end with /
SFTP_FILENAME = 'sftp_students.csv'  # filename only. will be local filename also

# settings for pg_load_students only
DB_PARAMS = {'host': 'localhost', 'database': 'postgres', 'user': 'ubuntu', 'password': 'ubuntu'}

# settings for random_load_students only
MONGO_PARAMS = "mongodb://art:foo@localhost:27017/art"
