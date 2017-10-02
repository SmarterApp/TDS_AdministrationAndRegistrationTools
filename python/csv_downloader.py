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
    offset = None

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
            print("\nStarting at byte offset %d" % offset)

    start_time = datetime.datetime.now()
    print("\nStarting at %s\n" % start_time)

    download_student_csv(offset)

    end_time = datetime.datetime.now()
    deltasecs = (end_time - start_time).total_seconds()
    print("\nFinished at %s\n\tElapsed %s\n" % (end_time, deltasecs))


def progress(bytes_so_far, totalbytes):
    print("%d/%d (%0.1f%%)" % (bytes_so_far, totalbytes, float(bytes_so_far)/totalbytes*100))


def download_student_csv(offset):

    hostname = settings.SFTP_HOSTNAME
    port = settings.SFTP_PORT
    password = settings.SFTP_PASSWORD
    username = settings.SFTP_USER
    directory = settings.SFTP_DIRECTORY
    filename = settings.SFTP_FILENAME

    # Open local file and seek to requested offset.
    with open(filename, 'ab+') as localfile:
        if offset:
            localfile.seek(offset)
        else:
            offset = localfile.tell() # start downloading here
            if offset:
                print("Auto resuming existing download.")

        print("\nDownloading file %s%s from %s@%s" % (directory, filename, username, hostname))
        if offset:
            print("    Byte offset %d" % offset)
        if port != 22:
            print("    Port %d" % port)

        with paramiko.Transport((hostname, port)) as transport:
            transport.connect(username=username, password=password)
            with paramiko.SFTPClient.from_transport(transport) as sftp:
                print("\nConnected.")
                with sftp.open('%s%s' % (directory, filename), bufsize=1) as remotefile:
                    if offset and not remotefile.seekable():
                        print("Server does not support seek(), which disables the offset feature. Exiting.")
                        return

                    attribs = remotefile.stat()
                    if attribs.st_size <= offset:
                        print("File size is %d, you requested offset of %d. Cowardly refusing to read past end of file." % (
                            attribs.st_size, offset))
                        return

                    if offset:
                        remotefile.seek(offset)

                    print('Starting download.')
                    remotefile.prefetch()
                    written = offset

                    while True:
                        data = remotefile.read(512 * 1024)
                        if not data:
                            break
                        localfile.write(data)
                        written += len(data)
                        print("writing %d/%d bytes" % (written, attribs.st_size))
                    print('Download finished.')


def usage():
    print("Help/usage details:")
    print("  -o, --offset             : where to start reading / writing in the files, in bytes\n"
          "                             (defaults to resuming at end of existing file or beginning of new file)")
    print("  -h, --help               : this help screen")


main(sys.argv[1:])
