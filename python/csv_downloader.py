#!/usr/bin/env python

# Python 3 required. A virtualenv is recommended. Install requirements.txt.

import datetime
import getopt
import sys

import paramiko


# Pull settings from csv_settings.py.
try:
    import settings_secret as settings
except:
    import settings_default as settings
    print("*** USING DEFAULTS in settings_default.py.")
    print("*** Please copy settings_default.py to settings_secret.py and modify that!")


BUFSIZE = 512 * 1024


def progress(message, bytes_written=None, bytes_remaining=None):
    if message is not None:
        print(message)
    else:
        print("%d of %d bytes written" % (bytes_written, bytes_remaining))
        # print("%d/%d (%0.1f%%)" % (bytes_so_far, totalbytes, float(bytes_so_far)/totalbytes*100))


def main(argv):
    hostname = settings.SFTP_HOSTNAME
    port = settings.SFTP_PORT
    username = settings.SFTP_USER
    password = settings.SFTP_PASSWORD
    keyfile = settings.SFTP_KEYFILE
    keypass = settings.SFTP_KEYPASS

    # These values can come from command line and will override settings values.
    offset = None
    filename = None
    remotepath = None
    try:
        opts, _ = getopt.getopt(argv, "hf:r:o:", ["help", "filename=", "remotepath=", "offset="])
    except getopt.GetoptError:
        usage()
        sys.exit(2)

    for opt, arg in opts:
        if opt in ("-h", "--help"):
            usage()
            sys.exit()
        elif opt in ("-f", "--filename"):
            filename = arg
            print("\nUsing filename '%s'" % filename)
        elif opt in ("-r", "--remotepath"):
            remotepath = arg
            print("\nUsing remotepath '%s'" % remotepath)
        elif opt in ("-o", "--offset"):
            offset = int(arg)
            print("\nStarting at byte offset %d" % offset)

    remotepath = remotepath if remotepath else settings.SFTP_FILEPATH
    filename = filename if filename else settings.FILENAME

    start_time = datetime.datetime.now()
    print("\nStarting at %s\n" % start_time)

    download_student_csv(hostname, port, username, password, keyfile, keypass, remotepath, filename, offset, progress)

    end_time = datetime.datetime.now()
    deltasecs = (end_time - start_time).total_seconds()
    print("\nFinished at %s\n\tElapsed %s\n" % (end_time, deltasecs))


# Progress is method taking (bytes_so_far, totalbytes)
def download_student_csv(hostname, port, username, password, keyfile, keypass, remotepath, filename, offset, progress):

    progress("\nDownloading file %s from %s@%s" % (remotepath, username, hostname))
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
                    return

                # Remote file OK, now open local file and seek to requested offset.
                with open(filename, 'ab+') as localfile:
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
                            return
                        if attribs.st_size == offset:
                            progress("File complete (local and remote sizes match - contents not checked).")
                            return
                        elif attribs.st_size < offset:
                            progress("File size is %d but requested offset is %d. "
                                     "Cowardly refusing to seek past end of file." % (attribs.st_size, offset))
                            return
                        remotefile.seek(offset)

                    # All systems go! Commence with the downloading.
                    bytes_remaining = attribs.st_size - offset
                    progress('Downloading %s%d bytes of %s, total size %d.' % (
                        "remaining " if offset else "", bytes_remaining, filename, attribs.st_size))
                    remotefile.prefetch()
                    written = 0
                    while True:
                        data = remotefile.read(BUFSIZE)
                        if not data:
                            break
                        localfile.write(data)
                        written += len(data)
                        progress(None, written, bytes_remaining)
                    progress('Download finished.')


def usage():
    print("Downloads today's student CSV dump from CALPADS sFTP server.")
    print("Please put your settings in settings_secret.py. Defaults are in settings_default.py.")
    print("Help/usage details:")
    print("  -f, --filename           : local filename to write into")
    print("  -r, --remotepath         : remote filepath to download (example: './Students/CA_students_20171005.zip')")
    print("  -o, --offset             : where to start reading / writing in the files, in bytes\n"
          "                             (will resume at end of any pre-existing file or at beginning of a new file)")
    print("  -h, --help               : this help screen")


if __name__ == "__main__":
    main(sys.argv[1:])
