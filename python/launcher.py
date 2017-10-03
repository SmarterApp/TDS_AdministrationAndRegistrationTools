import tkinter as tk

# Pull settings from csv_settings.py.
try:
    import settings_secret as settings
except:
    import settings_default as settings


class App:

    def __init__(self, master):

        self.setup_go_frame(master)
        self.setup_sftp_frame(master)
        self.setup_art_frame(master)

    def setup_go_frame(self, master):

        go_frame = tk.LabelFrame(master, text="", padx=20, pady=10)
        go_frame.grid(row=0, columnspan=2, sticky=tk.W+tk.E, padx=20, pady=10)

        tk.Label(go_frame, text="Local filename").grid(row=2, sticky=tk.W)
        self.localfile = tk.StringVar()
        self.localfile.set(settings.FILENAME)
        tk.Entry(go_frame, textvariable=self.localfile).grid(row=2, column=1, sticky=tk.W+tk.E)

        tk.Button(go_frame, text="Check File Details", command=self.check_file).grid(row=10)
        self.check_file_label = tk.Label(go_frame, relief=tk.GROOVE, text="<-- press to get file details", anchor=tk.W)
        self.check_file_label.grid(row=10, column=1, sticky=tk.W+tk.E)

    def setup_sftp_frame(self, master):

        sftp_frame = tk.LabelFrame(master, text="sFTP Settings", padx=20, pady=10)
        sftp_frame.grid(row=1, columnspan=2, sticky=tk.W+tk.E, padx=20, pady=10)

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

        art_frame = tk.LabelFrame(master, text="ART REST API Settings", padx=20, pady=10)
        art_frame.grid(row=2, columnspan=2, sticky=tk.W+tk.E, padx=20, pady=10)

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
