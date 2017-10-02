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


BUFSIZE = 512 * 1024


def main(argv):
    offset = None
    filename = None

    try:
        opts, _ = getopt.getopt(argv, "hf:o:", ["help", "filename=", "offset="])
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
        elif opt in ("-o", "--offset"):
            offset = int(arg)
            print("\nStarting at byte offset %d" % offset)

    start_time = datetime.datetime.now()
    print("\nStarting at %s\n" % start_time)

    download_student_csv(filename, offset)

    end_time = datetime.datetime.now()
    deltasecs = (end_time - start_time).total_seconds()
    print("\nFinished at %s\n\tElapsed %s\n" % (end_time, deltasecs))


def progress(bytes_so_far, totalbytes):
    print("%d/%d (%0.1f%%)" % (bytes_so_far, totalbytes, float(bytes_so_far)/totalbytes*100))


def download_student_csv(filename, offset):

    hostname = settings.SFTP_HOSTNAME
    port = settings.SFTP_PORT
    password = settings.SFTP_PASSWORD
    username = settings.SFTP_USER
    directory = settings.SFTP_DIRECTORY
    filename = filename if filename else settings.SFTP_FILENAME

    print("\nDownloading file %s%s from %s@%s" % (directory, filename, username, hostname))
    if port != 22:
        print("    Port %d" % port)

    # First, do a sanity check on remote file.
    with paramiko.Transport((hostname, port)) as transport:
        transport.connect(username=username, password=password)
        with paramiko.SFTPClient.from_transport(transport) as sftp:
            print("\nConnected.")
            with sftp.open('%s%s' % (directory, filename), bufsize=1) as remotefile:
                attribs = remotefile.stat()
                if not attribs.st_size:
                    print("Missing or empty remote file. Exiting.")
                    return

                # Remote file OK, now open local file and seek to requested offset.
                with open(filename, 'ab+') as localfile:
                    if offset:
                        localfile.seek(offset)
                        localfile.truncate()  # New data goes here. Get rid of old.
                    else:
                        offset = localfile.tell() # start downloading here
                        if offset > 0:
                            print("Auto resuming existing download.")

                    # If offset is specified, make sure remote can support it and remote file is big enough.
                    if offset > 0:
                        print("    Using byte offset %d" % offset)
                        if not remotefile.seekable():
                            print("Server does not support seek(), which disables the offset/resume feature. Exiting.")
                            return
                        if attribs.st_size == offset:
                            print("File appears to be complete (local and remote sizes match - contents not checked).")
                            return
                        elif attribs.st_size < offset:
                            print("File size is %d but requested offset is %d. "
                                  "Cowardly refusing to seek past end of file." % (attribs.st_size, offset))
                            return
                        remotefile.seek(offset)

                    # All systems go! Commence with the downloading.
                    bytes_remaining = attribs.st_size - offset
                    print('Downloading %s%d bytes of %s, total size %d.' % (
                        "remaining " if offset else "", bytes_remaining, filename, attribs.st_size))
                    remotefile.prefetch()
                    written = 0
                    while True:
                        data = remotefile.read(BUFSIZE)
                        if not data:
                            break
                        localfile.write(data)
                        written += len(data)
                        print("%d of %d bytes written" % (written, bytes_remaining))
                    print('Download finished.')


def usage():
    print("Help/usage details:")
    print("  -o, --offset             : where to start reading / writing in the files, in bytes\n"
          "                             (defaults to resuming at end of existing file or beginning of new file)")
    print("  -h, --help               : this help screen")


main(sys.argv[1:])
