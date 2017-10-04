#!/usr/local/bin/python3

import tkinter as tk

# Pull settings from csv_settings.py.
try:
    import settings_secret as settings
except:
    import settings_default as settings


class App:

    def __init__(self, master):

        self.setup_main_frame(master)
        self.setup_sftp_frame(master)
        self.setup_art_frame(master)

    def setup_main_frame(self, master):

        main_frame = tk.LabelFrame(master, text="Main", padx=10, pady=5)
        main_frame.grid(row=0, sticky=tk.W+tk.E, padx=10, pady=10)

        tk.Label(main_frame, text="Local filename").grid(row=10, sticky=tk.W)
        self.localfile = tk.StringVar()
        self.localfile.set(settings.FILENAME)
        tk.Entry(main_frame, textvariable=self.localfile).grid(row=10, column=1, sticky=tk.W+tk.E)

        tk.Button(main_frame, text="Check File Details", command=self.check_file).grid(row=20, sticky=tk.W)
        self.check_file_label = tk.Label(main_frame, relief=tk.GROOVE, text="<-- press to get file details", anchor=tk.W)
        self.check_file_label.grid(row=20, column=1, sticky=tk.W+tk.E)

        tk.Label(main_frame, text="").grid(row=24, sticky=tk.W)
        tk.Label(main_frame, text="Downloader Output").grid(row=25, sticky=tk.W)
        self.downloader_output = tk.Listbox(main_frame, width=100, height=15)
        self.downloader_output.grid(row=30, column=0, columnspan=2)
        self.scrollY = tk.Scrollbar(main_frame, orient=tk.VERTICAL, command=self.downloader_output.yview)
        self.scrollY.grid(row=30, column=2, sticky=tk.N+tk.S)
        self.scrollX = tk.Scrollbar(main_frame, orient=tk.HORIZONTAL, command=self.downloader_output.xview)
        self.scrollX.grid(row=40, column=0, columnspan=2, sticky=tk.E+tk.W)
        self.downloader_output['xscrollcommand'] = self.scrollX.set
        self.downloader_output['yscrollcommand'] = self.scrollY.set
        def clear_downloader_output():
            self.downloader_output.delete(0,self.downloader_output.size())
        tk.Button(main_frame, text="Clear", command=clear_downloader_output).grid(row=25, column=1, sticky=tk.E)

        tk.Label(main_frame, text="").grid(row=44, sticky=tk.W)
        tk.Label(main_frame, text="Exporter Output").grid(row=45, sticky=tk.W)
        self.exporter_output = tk.Listbox(main_frame, width=100, height=15)
        self.exporter_output.grid(row=50, column=0, columnspan=2)
        self.scrollY = tk.Scrollbar(main_frame, orient=tk.VERTICAL, command=self.exporter_output.yview)
        self.scrollY.grid(row=50, column=2, sticky=tk.N+tk.S)
        self.scrollX = tk.Scrollbar(main_frame, orient=tk.HORIZONTAL, command=self.exporter_output.xview)
        self.scrollX.grid(row=60, column=0, columnspan=2, sticky=tk.E+tk.W)
        self.exporter_output['xscrollcommand'] = self.scrollX.set
        self.exporter_output['yscrollcommand'] = self.scrollY.set
        def clear_exporter_output():
            self.exporter_output.delete(0,self.exporter_output.size())
        tk.Button(main_frame, text="Clear", command=clear_exporter_output).grid(row=45, column=1, sticky=tk.E)

        for x in range(50):
            self.downloader_output.insert(tk.END, [x*a for a in range(100)])
            self.exporter_output.insert(tk.END, [x*a for a in range(100)])

    def setup_sftp_frame(self, master):

        sftp_frame = tk.LabelFrame(master, text="sFTP Settings", padx=10, pady=5)
        sftp_frame.grid(row=1, sticky=tk.W+tk.E, padx=10, pady=10)

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

        tk.Button(sftp_frame, text="Test sFTP Connection", command=self.test_sftp_connection).grid(row=4)
        self.sftp_test_label = tk.Label(
            sftp_frame, relief=tk.GROOVE, text="<-- press to check for file on sFTP host", anchor=tk.W)
        self.sftp_test_label.grid(row=4, column=1, sticky=tk.W+tk.E)

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

        tk.Button(art_frame, text="Test ART Connection", command=self.test_art_connection).grid(row=10)
        self.art_test_label = tk.Label(
            art_frame, relief=tk.GROOVE, text="<-- press to check ART REST API connection", anchor=tk.W)
        self.art_test_label.grid(row=10, column=1, sticky=tk.W+tk.E)

    def check_file(self):
        self.check_file_label["text"] = "Checking local file... (TODO)"

    def test_sftp_connection(self):
        self.sftp_test_label["text"] = "Looking for remote file... (TODO)"

    def test_art_connection(self):
        self.art_test_label["text"] = "Checking ART REST endpoint... (TODO)"


root = tk.Tk()

app = App(root)

root.mainloop()
