#!/usr/local/bin/python3

import datetime
import getopt
import sys

import paramiko


# Pull settings from csv_settings.py.
try:
    import settings_secret as settings
    print("Using settings in settings_secret.py (good job!).")
except:
    import settings_default as settings
    print("*** settings.py not found! USING DEFAULTS in settings_default.py.")
    print("*** Please copy settings_default.py to settings_secret.py and modify that!")


def main(argv):
    offset = 0

    try:
        opts, _ = getopt.getopt(argv, "ho:", ["help", "offset="])
    except getopt.GetoptError:
        usage()
        sys.exit(2)

    for opt, arg in opts:
        if opt in ("-h", "--help"):
            usage()
            sys.exit()
        elif opt in ("-o", "--offset"):
            offset = int(arg)
            print("Starting at byte offset %d" % offset)

    start_time = datetime.datetime.now()
    print("\nStarting at %s" % start_time)

    download_student_csv(offset)

    end_time = datetime.datetime.now()
    deltasecs = (end_time - start_time).total_seconds()
    print("\nFinished at %s\n\tElapsed %s\n" % (end_time, deltasecs))


def progress(bytes_so_far, totalbytes):
    print("%d/%d (%0.1f%%)" % (bytes_so_far, totalbytes, float(bytes_so_far)/totalbytes*100))


def download_student_csv(offset=0):

    hostname = settings.SFTP_HOSTNAME
    port = settings.SFTP_PORT
    password = settings.SFTP_PASSWORD
    username = settings.SFTP_USER
    directory = settings.SFTP_DIRECTORY
    filename = settings.SFTP_FILENAME

    print("Downloading file %s@%s:%d/%s%s from byte %d" % (
        username, hostname, port, directory, filename, offset))

    with paramiko.Transport((hostname, port)) as transport:
        transport.connect(username=username, password=password)
        with paramiko.SFTPClient.from_transport(transport) as sftp:
            print("Connected.")
            sftp.get('%s%s' % (directory, filename), filename, progress)
    print('Download finished.')


def usage():
    print("Help/usage details:")
    print("  -o, --offset             : where to start reading in the file, in bytes (defaults to 0 (beginning))")
    print("  -h, --help               : this help screen")


main(sys.argv[1:])
