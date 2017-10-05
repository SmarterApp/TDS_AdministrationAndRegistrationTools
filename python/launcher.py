#!/usr/bin/env python3

import datetime
import locale
import os
import queue
import threading
import time
import tkinter as tk
import traceback

from csv_downloader import download_student_csv
from csv_load_students import load_student_data


# Pull settings from csv_settings.py.
try:
    import settings_secret as settings
except:
    import settings_default as settings
    print("*** USING DEFAULTS in settings_default.py.")
    print("*** Please copy settings_default.py to settings_secret.py and modify that!")

locale.setlocale(locale.LC_ALL, 'en_US')

STATE_IDLE = "IDLE"
STATE_RUNNING = "RUNNING"


class MTListbox(tk.Listbox):
    def __init__(self, master, **options):
        tk.Listbox.__init__(self, master, **options)
        self.queue = queue.Queue()
        self.update_me()

    def write(self, line):
        self.queue.put(line)

    def clear(self):
        self.queue.put(None)

    def update_me(self):
        try:
            while True:
                line = self.queue.get_nowait()
                if line is None:
                    self.delete(0, tk.END)
                else:
                    self.insert(tk.END, str(line))
                self.see(tk.END)
                self.update_idletasks()
        except queue.Empty:
            pass
        self.after(100, self.update_me)


class App:

    def __init__(self, master):
        self.downloader_thread = None
        self.exporter_thread = None
        self.setup_main_frame(master)
        self.setup_sftp_frame(master)
        self.setup_art_frame(master)

    def set_downloader_status(self, message):
        self.downloader_status.clear()
        self.downloader_status.write(message)

    def set_exporter_status(self, message):
        self.exporter_status.clear()
        self.exporter_status.write(message)

    def downloader_progress(self, message, bytes_written=None, bytes_remaining=None):
        if message is not None:
            self.downloader_output.write(message)
        else:
            self.set_downloader_status("DOWNLOADING: %d of %d bytes written" % (bytes_written, bytes_remaining))

    def exporter_progress(self, message):
        self.exporter_output.write(message)

    def check_file(self):
        try:
            st = os.stat(self.localfile.get())
            writable = os.access(self.localfile.get(), os.W_OK)
            self.check_file_label['text'] = "File '%s' found, size %s bytes. %s" % (
                self.localfile.get(), locale.format('%d', st.st_size, grouping=True),
                "Writable." if writable else "FILE IS NOT WRITABLE!!")
        except FileNotFoundError:
            self.check_file_label['text'] = "File '%s' not found. It will be created." % self.localfile.get()
        except:
            self.check_file_label['text'] = "Can't access file '%s'! Permission problem?" % self.localfile.get()

    def test_art_connection(self):
        self.art_test_label["text"] = "Checking ART REST endpoint... (TODO)"

    def test_sftp_connection(self):
        self.sftp_test_label["text"] = "Looking for remote file... (TODO)"

    def go(self):
        if self.downloader_thread and self.downloader_thread.is_alive():
            self.downloader_output.write("Downloader thread running - can't start!")
            return
        if self.exporter_thread and self.exporter_thread.is_alive():
            self.exporter_output.write("Exporter thread running - can't start!")
            return

        self.exporter_thread = threading.Thread(target=self.export_callable, name="exporter", daemon=True)
        self.exporter_thread.start()

        self.downloader_thread = threading.Thread(target=self.download_callable, name="downloader", daemon=True)
        self.downloader_thread.start()

    def download_callable(self):
        self.set_downloader_status(STATE_RUNNING)
        self.downloader_output.clear()

        self.downloader_output.write("STARTING DOWNLOAD at %s" % datetime.datetime.now())
        try:
            download_student_csv(
                self.sftp_host.get(),
                settings.SFTP_PORT,
                self.sftp_user.get(),
                self.sftp_password.get(),
                None,  # TODO: Keyfile support.
                self.sftp_file.get(),
                self.localfile.get(),
                None,
                self.downloader_progress)
        except Exception as e:
            self.downloader_output.write("Encountered exception: %s" % e)
            traceback.print_exc()

        self.downloader_output.write("END DOWNLOAD at %s\n\n" % datetime.datetime.now())
        self.set_downloader_status(STATE_IDLE)

    def export_callable(self):
        time.sleep(1)
        self.set_exporter_status(STATE_RUNNING)
        self.exporter_output.clear()

        self.exporter_output.write("STARTING EXPORT at %s" % datetime.datetime.now())
        try:
            load_student_data(
                self.localfile.get(),
                settings.FILE_ENCODING,
                settings.DELIMITER,
                settings.NUM_STUDENTS,
                0,
                False,
                self.art_endpoint.get(),
                self.art_user.get(),
                self.art_password.get(),
                self.exporter_progress)
        except Exception as e:
            self.exporter_output.write("Encountered exception: %s" % e)
            traceback.print_exc()

        self.exporter_output.write("END EXPORT at %s\n\n" % datetime.datetime.now())
        self.set_exporter_status(STATE_IDLE)

    def setup_main_frame(self, master):

        main_frame = tk.LabelFrame(master, text="Main", padx=10, pady=5)
        main_frame.grid(row=0, sticky=tk.W+tk.E, padx=10, pady=5)

        tk.Label(main_frame, text="Local filename").grid(row=10, sticky=tk.W)
        self.localfile = tk.StringVar()
        self.localfile.set(settings.FILENAME)
        tk.Entry(main_frame, textvariable=self.localfile).grid(row=10, column=1, sticky=tk.W+tk.E)

        tk.Button(main_frame, text="Check File Details", command=self.check_file).grid(row=20, sticky=tk.W)
        self.check_file_label = tk.Label(main_frame, relief=tk.GROOVE, text="<-- press to check file", anchor=tk.W)
        self.check_file_label.grid(row=20, column=1, sticky=tk.W+tk.E)

        tk.Label(main_frame, text="").grid(row=21, sticky=tk.W)
        tk.Button(main_frame, text="GO!", command=self.go).grid(row=22, sticky=tk.W)

        tk.Label(main_frame, text="").grid(row=24, sticky=tk.W)

        tk.Label(main_frame, text="Downloader Status").grid(row=25, sticky=tk.W)
        self.downloader_status = MTListbox(main_frame, width=40, height=1)
        self.downloader_status.grid(row=25, column=1, sticky=tk.E+tk.W)
        self.set_downloader_status(STATE_IDLE)

        tk.Label(main_frame, text="Downloader Output").grid(row=29, sticky=tk.W)
        self.downloader_output = MTListbox(main_frame, width=80, height=10, selectmode=tk.EXTENDED)
        self.downloader_output.grid(row=30, column=0, columnspan=2)
        self.scrollY = tk.Scrollbar(main_frame, orient=tk.VERTICAL, command=self.downloader_output.yview)
        self.scrollY.grid(row=30, column=2, sticky=tk.N+tk.S)
        self.scrollX = tk.Scrollbar(main_frame, orient=tk.HORIZONTAL, command=self.downloader_output.xview)
        self.scrollX.grid(row=40, column=0, columnspan=2, sticky=tk.E+tk.W)
        self.downloader_output['xscrollcommand'] = self.scrollX.set
        self.downloader_output['yscrollcommand'] = self.scrollY.set
        tk.Button(main_frame, text="Clear", command=self.downloader_output.clear).grid(row=29, column=1, sticky=tk.E)

        tk.Label(main_frame, text="").grid(row=45, sticky=tk.W)

        tk.Label(main_frame, text="Exporter Status").grid(row=48, sticky=tk.W)
        self.exporter_status = MTListbox(main_frame, width=40, height=1)
        self.exporter_status.grid(row=48, column=1, sticky=tk.E+tk.W)
        self.set_exporter_status(STATE_IDLE)

        tk.Label(main_frame, text="Exporter Output").grid(row=49, sticky=tk.W)
        self.exporter_output = MTListbox(main_frame, width=80, height=10, selectmode=tk.EXTENDED)
        self.exporter_output.grid(row=50, column=0, columnspan=2)
        self.scrollY = tk.Scrollbar(main_frame, orient=tk.VERTICAL, command=self.exporter_output.yview)
        self.scrollY.grid(row=50, column=2, sticky=tk.N+tk.S)
        self.scrollX = tk.Scrollbar(main_frame, orient=tk.HORIZONTAL, command=self.exporter_output.xview)
        self.scrollX.grid(row=60, column=0, columnspan=2, sticky=tk.E+tk.W)
        self.exporter_output['xscrollcommand'] = self.scrollX.set
        self.exporter_output['yscrollcommand'] = self.scrollY.set
        tk.Button(main_frame, text="Clear", command=self.exporter_output.clear).grid(row=49, column=1, sticky=tk.E)

    def setup_sftp_frame(self, master):

        sftp_frame = tk.LabelFrame(master, text="sFTP Settings", padx=10, pady=5)
        sftp_frame.grid(row=1, sticky=tk.W+tk.E, padx=10, pady=5)

        tk.Label(sftp_frame, text="File Path").grid(row=0, sticky=tk.W)
        self.sftp_file = tk.StringVar()
        self.sftp_file.set(settings.SFTP_FILEPATH)
        tk.Entry(sftp_frame, textvariable=self.sftp_file).grid(row=0, column=1, sticky=tk.W+tk.E)

        tk.Label(sftp_frame, text="Hostname").grid(row=1, sticky=tk.W)
        self.sftp_host = tk.StringVar()
        self.sftp_host.set(settings.SFTP_HOSTNAME)
        tk.Entry(sftp_frame, textvariable=self.sftp_host).grid(row=1, column=1, sticky=tk.W+tk.E)

        tk.Label(sftp_frame, text="Username").grid(row=2, sticky=tk.W)
        self.sftp_user = tk.StringVar()
        self.sftp_user.set(settings.SFTP_USER)
        tk.Entry(sftp_frame, textvariable=self.sftp_user).grid(row=2, column=1, sticky=tk.W+tk.E)

        tk.Label(sftp_frame, text="Password").grid(row=3, sticky=tk.W)
        self.sftp_password = tk.StringVar()
        self.sftp_password.set(settings.SFTP_PASSWORD)
        tk.Entry(sftp_frame, textvariable=self.sftp_password, show='*').grid(row=3, column=1, sticky=tk.W+tk.E)

        # tk.Button(sftp_frame, text="Test sFTP Connection", command=self.test_sftp_connection).grid(row=4)
        # self.sftp_test_label = tk.Label(
        #     sftp_frame, relief=tk.GROOVE, text="<-- press to check for file on sFTP host", anchor=tk.W)
        # self.sftp_test_label.grid(row=4, column=1, sticky=tk.W+tk.E)

    def setup_art_frame(self, master):

        art_frame = tk.LabelFrame(master, text="ART REST API Settings", padx=10, pady=5)
        art_frame.grid(row=2, sticky=tk.W+tk.E, padx=10, pady=10)

        tk.Label(art_frame, text="Endpoint").grid(row=7, sticky=tk.W)
        self.art_endpoint = tk.StringVar()
        self.art_endpoint.set(settings.ART_ENDPOINT)
        tk.Entry(art_frame, textvariable=self.art_endpoint).grid(row=7, column=1, sticky=tk.W+tk.E)

        tk.Label(art_frame, text="Username").grid(row=8, sticky=tk.W)
        self.art_user = tk.StringVar()
        self.art_user.set(settings.AUTH_PAYLOAD.get('username', ''))
        tk.Entry(art_frame, textvariable=self.art_user).grid(row=8, column=1, sticky=tk.W+tk.E)

        tk.Label(art_frame, text="Password").grid(row=9, sticky=tk.W)
        self.art_password = tk.StringVar()
        self.art_password.set(settings.AUTH_PAYLOAD.get('password', ''))
        tk.Entry(art_frame, textvariable=self.art_password, show='*').grid(row=9, column=1, sticky=tk.W+tk.E)

        # tk.Button(art_frame, text="Test ART Connection", command=self.test_art_connection).grid(row=10)
        # self.art_test_label = tk.Label(
        #     art_frame, relief=tk.GROOVE, text="<-- press to check ART REST API connection", anchor=tk.W)
        # self.art_test_label.grid(row=10, column=1, sticky=tk.W+tk.E)


root = tk.Tk()

app = App(root)

root.mainloop()
