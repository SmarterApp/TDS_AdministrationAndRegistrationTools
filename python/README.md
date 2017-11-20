# ART Student Loader Utilities
## Instruction Manual

### Description
The ART student loader utility is a Python scripts designed to automatically load the millions of students from the nightly CALPADS dump file into ART's REST API. The main utility includes an executable python script and a settings file, which is copied and modified for your local setup. There is also an optional GUI. The utilities are primarily designed to be run unattended by cron on a daily schedule.

#### art_student_loader.py
This is the main executable script. Run with -h or --help for a usage summary. This script performs the following main functions:

1. Download the nightly dump file from the CALPADS sFTP server.
  - Will auto-resume an aborted download where it left off, if found.
  - Will automatically download this morning's dump file from the server using an established naming convention.
2. Extract the CSV data from the zip format used into a separate file, as defined in the zip file
3. Upload the student data from the CSV file into ART via the ART REST API.
  - Can be instructed to start at any offset in the data file in case a previous run was aborted.
  - Can also be given a max number of students to upload instead of uploading the entire file.

#### launcher.py
This optional python script provides a GUI that can automate the loader.
This allows the user to see and change the important settings used by the loader before clicking GO. This will start the loading process and display the output as it goes. It's mainly designed for one-off execution, testing, and troubleshooting. It's especially useful to test connectivity without accidentally uploading anything (you can alternatively use the dry-run option of the command-line loader).

#### settings_default.py
This file is distributed with the utilities and contain default settings used by all the tools.
It's mainly designed to be a template you will copy to settings_secret.py before modifying. If settings_secret.py is missing this file will be read, but a warning will be printed as you probably won't connect to the right servers!
The settings file is documented via internal comments. See the file for information about the options.

#### settings_secret.py
This file is a settings override file the user will create and modify, then prevent unauthorized users from reading via permissions, etc. Copy settings_default.py to this file and modify to taste.
This file should contain all the sensitive passwords and URL's, etc, the utilities read to connect to ART and the sFTP server where the sensitive data is stored. Due to its nature, this file is not distributed with the utilities and is not in source control.

### Usage
```
$ ./art_student_loader.py -h
Download, extract, and upload today's student dump from CALPADS sFTP server into ART.
  If a zip file is fetched, the first file inside will be extracted then uploaded to ART.

Most settings are configured via settings files, NOT via this command line!
  To modify those settings, copy settings_default.py to settings_secret.py and edit the copy.

Help/usage details:
  -h, --help               : this help screen
  -f, --localfile          : local filename to write into. defaults to 'today's filename'
  Downloader Options:
  -r, --remotepath         : remote filepath to download
                             (defaults to today's file, eg: './Students/CA_students_20171005.zip')
  -o, --offset             : byte in the file to start downloading
                             (will resume download at the end of any matching file found)
  Uploader Options:
  -y, --dryrun             : do a dry run - does everything except actually POST to ART
  -e, --encoding           : encoding to use when processing CSV file
  -d, --delimiter          : delimiter to use when processing CSV file
  -s, --csv_start_line     : line in the csv file to start uploading
  -n, --number             : the (max) number of students to upload
```
### Examples
The script is designed to be run with no arguments, with all settings coming from settings_secret.py. For example, to download the students and upload them into ART using the settings file, just run it as follows:
> $ ./art_student_loader.py

Or to grab a file from a specified server directory and put it in my_local_file.csv, then upload the students inside:
> $ ./art_student_loader.py -f my_local_file.csv -r ./Requests/special_dump.csv

Or to resume extra.csv at the one millionth byte in the file (potentially truncating it), then dry-run loading 200 students starting at the 2,000,000th line:
> $ ./art_student_loader.py -f extra.csv -o 1000000 -s 2000000 -n 20 -y

##### Usage notes
For performance, the loader uploads students in blocks of 10,000. When each block of students is uploaded, ART queues the request into a batch that will be processed later. ART then provides a URL that can be used to check the status of that batch.  This apprears for each chunk in the output as follows:

> Batch status URL: https://art-capacity-test.sbtds.org/rest/external/student/batch/59dbefb8e4b03b51be92cbf9

If no offset is provided, the script will try to be smart:

*   If no local file is found, it will download the whole file.
*   If a local file is found and it's smaller than the remote file, it will RESUME the download.
*   If the remote file is smaller than the local file, it will display an error saying this and exit.
*   If the remote file is the same size as the local file, it will think it's done and continue.

If you provide an offset that is smaller than the local file, the script will truncate the local file at the provided offset and then resume downloading it at that spot.

The script will never automatically truncate the local file, but it might append the wrong contents to the end of an old local file if the remote file is larger (as it thinks it's auto-resuming the new file). So use caution with pre-existing local files! The script cannot check that local file contents match the server as no digests are provided by the server.

Generally when in doubt it's safest to delete the local dump file and re-download the whole thing. Downloading the file takes much less time than uploading the students into ART.

When in doubt, it's generally a good idea to do a --dryrun before uploading for real. Nothing will be uploaded to ART, but all authentication will be performed and the file will be downloaded, extracted, and processed.

### Installation and setup

The loader requires Python 3.4 or better. It's been tested against Python 3.4 and 3.6. No other Python versions are supported. The package requirements are in the customary requirements.txt file. Tkinter is also needed to run the optional GUI in launcher.py, which is part of Python 3 on many platforms.

Python environment setup is detailed below for CentOS, Ubuntu, and MacOS. It should run fine on Windows and many other platforms if Python 3.6 and the requirements are properly set up.

#### CentOS 6.9
```
-- become root or use sudo for all `'`#`'` commands, regular user for `'`$`'
-- base setup
# yum -y update
# yum -y install yum-utils
# yum -y groupinstall development
-- set up python 3, using ius packages --
# yum -y install https://centos6.iuscommunity.org/ius-release.rpm
# yum -y install python36u
# yum -y install python36u-pip
# yum -y install python36u-devel
# yum install -y python36u-tkinter  # only if you want to run the GUI in launcher.py
-- set up virtual environment for an isolated python
$ cd <loader-script-directory>
$ mkdir environments
$ python3.6 -m venv art36  # can change art36 to whatever you like
$ source environments/art36/bin/activate  # enter the art36 env. should show a nice env prompt.
-- now all regular python and pip commands will use your art python 3.6 environment
$ python -V  # show python version. can also run pip -V to see that pip is OK
$ pip install -r requirements.txt  # run from within the loader script directory

-- If you prefer epel or Python 3.4, don't install ius-release and adjust the commands accordingly (changing 36u to 34):
# yum install -y epel-release
# yum install -y python34-tkinter ..., etc.
```
You're all set! Make sure to always enter the correct python environment before running the loader scripts, or you may start up the wrong python version or encounter missing packages.

It's been reported that on some CentOS installations it's necessary to manually install these packages (enter your art36 env first):
$ pip install pyopenssl ndg-httpsclient pyasn1 "requests[security]"

#### Ubuntu 14.04

```
Become root or use sudo for all '#' commands, be regular user for '$' commands.
-- base setup
# apt update && apt upgrade
-- set up python 3
# apt install python3
# apt install python3-pip
# apt install build-essential libssl-dev libffi-dev python3-dev  # for paramiko/ssl
# apt install python3-tk  # only if you want to run the GUI in launcher.py
-- set up virtual environment for an isolated python
# apt-get install python3.4-venv
$ cd <loader-script-directory>
$ mkdir environments
$ python3.4 -m venv art34
$ source environments/art34/bin/activate  # enter the art34 env. should show a nice env prompt.
-- now all regular python and pip commands will use your art python 3.4 environment
$ python -V  # show python version. can also run pip -V to see that pip is OK
$ pip install -r requirements.txt
```
You're all set! Make sure to always enter the correct python environment before running the loader scripts, or you may start up the wrong python version or encounter missing packages.

#### MacOS Sierra (OSX 10.12)

```
-- base setup - install Homebrew (https://brew.sh/)
$ /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
-- set up python 3 - brew's python includes tkinter for the GUI
$ brew install python3
-- set up virtual environment for an isolated python
$ cd <loader-script-directory>
$ mkdir environments
$ python3 -m venv art36
$ source environments/art36/bin/activate  # enter the art36 env. should show a nice env prompt.
-- now all regular python and pip commands will use your art python 3.6 environment
$ python -V  # show python version. can also run pip -V to see that pip is OK
$ pip install -r requirements.txt
```
You're all set! Make sure to always enter the correct python environment before running the loader scripts, or you may start up the wrong python version or encounter missing packages.

### Configuration

#### Settings, overrides, and security

The scripts are configured by reading settings files. This way you can run the scripts with no arguments and they'll do what you want every time.

**settings_default.py** is distributed with the scripts in github and contains sensible, but public default settings. To provide your own values, **copy settings_default.py to settings_secret.py** and adjust as desired. The scripts look for settings_secret.py first and will only load the defaults if the secrets are missing (it will also complain if it has to do this, as that's probably not what you want).

If you put any sensitive values in settings_secret.py it's advised to **set the permissions on settings_secret.py so nobody but you can read it**. It also shouldn't be put into source control or emailed around.

#### Authentication

##### sFTP authentication

Depending on how the sFTP site you're loading from is configured, you may need a private key file and potentially a password to unlock that key file, or the sFTP site may only require a username and password. All of these settings are configured in your settings_secret.py file as described above. The values look like this:
```
SFTP_HOSTNAME = "8.8.8.8"  # Your sFTP hostname
SFTP_USER = "ubuntu"       # Your sFTP username
SFTP_PASSWORD = "userpass" # Your sFTP user password, if using password authentication
SFTP_KEYFILE = "/Users/ubuntu/.ssh/art-capacity-test.pem"    # Your sFTP user's ssh private key file
SFTP_KEYPASS = "keypass"   # A password to unlock SFTP_KEYFILE if encrypted, else None if not needed
```

###### SSH key format

The key used for sFTP by the downloader is just a regular ssh key. It should be an RSA private key in PEM format. This same file can be used directly by the ssh command on Linux and OSX. In fact, putting this key in your ~/.ssh folder and trying to log in to the sFTP server with ssh is a great way to test the key before trying it with the script.

Note: A putty key (.ppk) can be converted to the correct format with puttygen. Puttygen comes with PuTTY and is available for Windows and MacOS (via brew). On MacOS this command makes a supported sftp_priv.pem file:

$ puttygen SomePrivatePuttyPPK.txt -O private-openssh -o sftp_priv.pem

### Troubleshooting

#### Runtime issues

ART can get stuck when loading 6M students at once because the loading process is fast and asynchronous, with ART queuing each student into a large queue for future processing. Because of this, the utility's loading process completes long before all the students are removed from the queue, processed, and stored by ART.

Our test setup includes two ART REST servers, each having its own localhost queue. With 6.4M students to import, each machine receives about half, giving 3.2M queued students each. Failure was observed with only 2.4M messages in the 'student' queue. The queue filled up all allocated RAM and entered the 'flow' state, and stopped receiving messages. This caused ART to refuse incoming REST connections, which caused the loader utility to fail with 'connection refused'. Restarting rabbitmq cleared the failure, but also dropped all of the already queued students, requiring the whole process to be repeated.

There are two main ways to avoid this issue - install more rabbitmq servers behind ART to spread the load, or use a huge box and configure rabbitmq to use more memory by increasing rabbitmq's memory watermark settings.

rabbitmq includes memory watermark settings to protect the system against the queue using up all your RAM.
In testing on a large machine with 60GB RAM, this watermark was initially set to 0.4 (about 24GB). This memory filled up with 2.4M students in the queue.

You can tweak the watermark to allow rabbit to use more of your machine's RAM by setting the watermark higher, as follows. Of course, if you set the watermark too high you may cause other issues when erlang sucks up all the memory. You might want to put these settings in the rabbitmq config file to make them permanent:
```
Show rabbitmq memory limits:
$ sudo rabbitmqctl eval 'vm_memory_monitor:get_vm_memory_high_watermark().'
$ sudo rabbitmqctl eval 'vm_memory_monitor:get_memory_limit().'
Set rabbitmq memory limits (can do a ratio or absolute - I used ratio):
$ sudo rabbitmqctl set_vm_memory_high_watermark 0.999999
$ sudo rabbitmqctl set_vm_memory_high_watermark absolute 40000MB
3.2M students in queue caused erlang to show over 17 GB RSS RAM on art-capacity-test.
0.75 is probably a more reasonable number for 3.2M students.
```

#### Performance

The scripts running on a CentOS host in us-east-1 downloaded the csv from a us-west-2c box at about 3 megabytes/sec (slow) and loaded into ART at about 2100 students/sec (that's slow). Running the scripts from the same availability zone is much faster. Fastest yet is to run it on the same box as ART.

The downloader was faster than the loader in all tests.

Remember that uploading only puts the students into rabbitmq, on the 'student' queue. ART then process each student, putting each into mongodb after processing. The latest ART takes less than an hour to drain over 6M duplicate students from the student queue because we recently added code to skip dupes.

If all 6M students are 'new', ART will take many hours to drain the queues, because it reads each student from the student queue, saves it to mongo, then puts it on the events.in queue. ART will then load each student from events.in and run implicit eligibility rules on it, which were recently optimized but are still quite involved. You can see what's in the rabbitmq queues by pointing a browser at your art host, port 15672 (by default).

