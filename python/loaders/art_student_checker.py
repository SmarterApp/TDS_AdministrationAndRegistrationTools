#!/usr/bin/env python

# Python 3 required. A virtualenv is recommended. Install requirements.txt.

from enum import Enum
import csv
import datetime
import getopt
import sys
import time

import pymongo

import art_student_loader

try:
    import settings_secret as settings
except:
    import settings_default as settings
    print("*** USING DEFAULTS in settings_default.py.")
    print("*** Please copy settings_default.py to settings_secret.py and modify that!")


def get_students_unlinked_districts(studentcollection):
    print("Fetching students without district mongo ID's...")
    no_district_students = {student['entityId']: student for student in studentcollection.find(
        {"stateAbbreviation": settings.STATE_ABBREVIATION, "districtEntityMongoId": {"$exists": False}},
        projection=["entityId", "districtIdentifier", "institutionIdentifier"],
        cursor_type=pymongo.cursor.CursorType.EXHAUST)}
    print("got %d no-district students..." % len(no_district_students))
    print(datetime.datetime.now())
    return no_district_students


def get_students_unlinked_schools(studentcollection):
    print("Fetching students without school mongo ID's...")
    print(datetime.datetime.now())
    no_school_students = {student['entityId']: student for student in studentcollection.find(
        {"stateAbbreviation": settings.STATE_ABBREVIATION, "institutionEntityMongoId": {"$exists": False}},
        projection=["entityId", "districtIdentifier", "institutionIdentifier"],
        cursor_type=pymongo.cursor.CursorType.EXHAUST)}
    print("got %d no-school students..." % len(no_school_students))
    print(datetime.datetime.now())
    return no_school_students


def raise_unless_readable(filename):
    with open(filename, 'r', encoding=settings.FILE_ENCODING) as unused:  # noqa: F841
        pass


class Options:
    def __init__(self):
        self.writemode = False
        self.schoolfile = art_student_loader.datewise_filepath(None, settings.SFTP_SCHOOL_FILE_BASENAME)
        self.studentfile = art_student_loader.datewise_filepath(None, settings.SFTP_FILE_BASENAME)


class Resources:
    def __init__(self, options):
        self.cds_lookup, self.csv_districts, self.csv_schools = art_student_loader.load_schools(options.schoolfile)
        client = pymongo.MongoClient(settings.MONGO_HOST, settings.MONGO_PORT)
        self.db = client[settings.MONGO_DBNAME]
        self.districts = self.db[settings.MONGO_DISTRICTS]
        self.schools = self.db[settings.MONGO_INSTITUTIONS]
        self.students = self.db[settings.MONGO_STUDENTS]
        self.school_cache = {}
        self.district_cache = {}


class AutoNumber(Enum):
    def __new__(cls):
        value = len(cls.__members__) + 1
        obj = object.__new__(cls)
        obj._value_ = value
        return obj


class Fixer:

    class FixerEvent(AutoNumber):
        DISTRICTS_ENTITY_CHECKED = ()
        DISTRICTS_MISSING = ()
        NOT_FIXED_STUDENTS_IN_CSV = ()
        NOT_FIXED_STUDENTS_NOT_IN_CSV = ()
        SCHOOLS_ENTITY_CHECKED = ()
        SCHOOLS_MISSING = ()
        STUDENTS_ENTITY_CHECKED = ()
        STUDENTS_LINK_CHECKED = ()
        STUDENTS_MISSING = ()

    class DistrictEvent(AutoNumber):
        CACHED_DISTRICTS = ()
        CACHE_HIT = ()
        CACHE_MISS = ()
        DISTRICTS_FIXED = ()
        DISTRICTS_NOT_FOUND = ()
        DISTRICT_CSV_AND_DB_MISMATCH = ()
        FIXED_LINKED_WITH_CSV_DID = ()
        FIXED_LINKED_WITH_DB_DID = ()
        NOT_FIXED_DISTRICT_NOT_FOUND = ()
        NOT_FIXED_FAILED_TO_SAVE = ()
        STUDENTS_FIXED = ()
        STUDENT_FIXES_ATTEMPTED = ()
        STUDENT_FIXES_FAILED = ()

    class SchoolEvent(AutoNumber):
        CACHED_SCHOOLS = ()
        CACHE_HIT = ()
        CACHE_MISS = ()
        CDS_LOOKUP_ADDS = ()
        FIXED_LINKED_WITH_CSV_IID_CDS_LOOKUP = ()
        FIXED_LINKED_WITH_DB_IID = ()
        FIXED_LINKED_WITH_DB_IID_CDS_LOOKUP = ()
        NOT_FIXED_FAILED_TO_SAVE = ()
        NOT_FIXED_INSTITUTION_NOT_FOUND = ()
        SCHOOLS_FIXED = ()
        SCHOOLS_NOT_FOUND = ()
        STUDENTS_FIXED = ()
        STUDENT_CSV_AND_DB_MISMATCH = ()
        STUDENT_FIXES_ATTEMPTED = ()
        STUDENT_FIXES_FAILED = ()

    def __init__(self, options, resources):
        self.options = options
        self.resources = resources
        self.start_time = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
        self.link_fixer_count = 0
        self.entity_checker_count = 0
        self.events = {}
        self.schools_fixed = set()
        self.schools_not_found = set()
        self.unfixed_students_in_csv = set()
        self.unfixed_students_not_in_csv = set()

        self.districts_not_found = set()
        self.districts_fixed = set()

        print("\nFixer created at %s. %s districts, %s schools, %s students in DB:\n\t%s" % (
            self.start_time, self.resources.districts.count(), self.resources.schools.count(),
            self.resources.students.count(), self.resources.db))

        if options.writemode:
            print("\n\nWRITE MODE ENABLED! THIS WILL REALLY WRITE TO THE DB!!")
            print("\n\n\n*** YOU HAVE 5 SECONDS TO CTRL-C WRITING TO DB '%s:%s'!! ***" % (
                settings.MONGO_HOST, settings.MONGO_PORT))
            time.sleep(6)
        else:
            print("\n*** READ-ONLY CHECKER MODE - NO CHANGES WILL BE MADE ***\n")

    def tally_event(self, event):
        self.events[event] = self.events.get(event, 0) + 1

    def write_event(self, student, event, file):
        self.tally_event(event)
        file.write("%s,%s,%s,%s\n" % (
            student.get('entityId', ''),
            student.get('districtIdentifier', ''),
            student.get('institutionIdentifier', ''),
            event.name,
        ))

    def perform_district_fixes(self, districts_fixed, districts_not_fixed, cali_no_district, csv_student, ssid):
        failure = True
        if ssid in cali_no_district:
            self.tally_event(Fixer.DistrictEvent.STUDENT_FIXES_ATTEMPTED)
            student = cali_no_district.pop(ssid)
            db_did = student.get('districtIdentifier')
            csv_did = art_student_loader.generate_district_identifier(
                csv_student['ResponsibleDistrictIdentifier'])

            scheme = None
            fixed_did = None

            if csv_did != db_did:
                self.tally_event(Fixer.DistrictEvent.DISTRICT_CSV_AND_DB_MISMATCH)
                # try to link with csv district_id.
                scheme = Fixer.DistrictEvent.FIXED_LINKED_WITH_CSV_DID
                fixed_did = csv_did
                failure = self.link_district(student.get('_id'), csv_did)

            # If not fixed, try relinking with unmodified district ID.
            if failure:
                scheme = Fixer.DistrictEvent.FIXED_LINKED_WITH_DB_DID
                fixed_did = db_did
                failure = self.link_district(student.get('_id'), db_did)

            if failure:
                self.tally_event(Fixer.DistrictEvent.STUDENT_FIXES_FAILED)
                self.unfixed_students_in_csv.add(ssid)
                self.districts_not_found.add(student.get('districtIdentifier'))
                self.write_event(student, failure, districts_not_fixed)
            else:
                self.tally_event(Fixer.DistrictEvent.STUDENTS_FIXED)
                self.districts_fixed.add(fixed_did)
                self.write_event(student, scheme, districts_fixed)
        return not failure

    def perform_school_fixes(self, schools_fixed, schools_not_fixed, cali_no_school, csv_student, ssid):
        failure = True
        if ssid in cali_no_school:
            self.tally_event(Fixer.SchoolEvent.STUDENT_FIXES_ATTEMPTED)
            student = cali_no_school.pop(ssid)
            db_iid = student.get('institutionIdentifier')
            csv_iid = art_student_loader.generate_institution_identifier(
                csv_student, self.resources.cds_lookup)

            scheme = None
            fixed_iid = None

            if csv_iid != db_iid:
                self.tally_event(Fixer.SchoolEvent.STUDENT_CSV_AND_DB_MISMATCH)
                # try to link with csv lookup school_id.
                scheme = Fixer.SchoolEvent.FIXED_LINKED_WITH_CSV_IID_CDS_LOOKUP
                fixed_iid = csv_iid
                failure = self.link_school(student.get('_id'), csv_iid)

            # First try to link student's existing school_id.
            if failure and db_iid:
                scheme = Fixer.SchoolEvent.FIXED_LINKED_WITH_DB_IID
                fixed_iid = db_iid
                failure = self.link_school(student.get('_id'), db_iid)

            # If that fails, look up the CDS Code for the school_id and link that.
            if failure and db_iid in self.resources.cds_lookup:
                scheme = Fixer.SchoolEvent.FIXED_LINKED_WITH_DB_IID_CDS_LOOKUP
                fixed_iid = db_iid
                failure = self.link_school(student.get('_id'), self.resources.cds_lookup[db_iid])

            if failure:
                self.tally_event(Fixer.SchoolEvent.STUDENT_FIXES_FAILED)
                self.unfixed_students_in_csv.add(ssid)
                self.schools_not_found.add(db_iid)
                self.write_event(student, failure, schools_not_fixed)
            else:
                self.tally_event(Fixer.SchoolEvent.STUDENTS_FIXED)
                self.schools_fixed.add(fixed_iid)
                self.write_event(student, scheme, schools_fixed)
        return not failure

    def fix_missing_mongo_ids(self):
        print("\nStudent district/student link fixer started at %s." % datetime.datetime.now())

        cali_no_district = get_students_unlinked_districts(self.resources.students)
        districts = {s.get('districtIdentifier', None) for s in cali_no_district.values()}
        print("got %d districts, filling cache..." % len(districts))
        district_mongo_ids = set([self.fetch_district_mongo_id(did) for did in districts])
        print("got %d district_mongo_ids, cache has %d" % (len(district_mongo_ids), len(self.resources.district_cache)))
        print(datetime.datetime.now())

        cali_no_school = get_students_unlinked_schools(self.resources.students)
        schools = set([s.get('institutionIdentifier', None) for s in cali_no_school.values()])
        print("got %d schools, filling cache..." % len(schools))
        # Add all CDS codes found in cds_lookup to school lookup set.
        delta = len(schools)
        schools.update({self.resources.cds_lookup.get(
            school) for school in schools if school in self.resources.cds_lookup})
        self.events[Fixer.SchoolEvent.CDS_LOOKUP_ADDS] = len(schools) - delta
        mongo_ids = {self.fetch_school_mongo_id(id) for id in schools}
        print("got %d school mongo_ids, cache has %d" % (len(mongo_ids), len(self.resources.school_cache)))
        print(datetime.datetime.now())

        with open(
            "out_fixer_students_district_failed_%s.csv" % self.start_time, "w") as districts_not_fixed, open(
                "out_fixer_students_district_fixed_%s.csv" % self.start_time, "w") as districts_fixed, open(
                "out_fixer_students_school_failed_%s.csv" % self.start_time, "w") as schools_not_fixed, open(
                "out_fixer_students_school_fixed_%s.csv" % self.start_time, "w") as schools_fixed:

            for file in [districts_not_fixed, districts_fixed, schools_not_fixed, schools_fixed]:
                file.write("entityId,districtIdentifier,institutionIdentifier,event\n")

            deltaupdates = 0
            updates = 0

            # Load Student CSV
            self.link_fixer_count = 0
            print("Checking student district and school linkages...")
            for csv_student in self.generate_csv_students():
                self.link_fixer_count += 1
                ssid = csv_student['SSID']
                if not (self.link_fixer_count % 10000):
                    print("Processing csv row %d, %d updates, %d delta..." % (
                        self.link_fixer_count, updates, updates - deltaupdates))
                    deltaupdates = updates

                if self.perform_district_fixes(
                        districts_fixed, districts_not_fixed, cali_no_district, csv_student, ssid):
                    updates += 1

                if self.perform_school_fixes(
                        schools_fixed, schools_not_fixed, cali_no_school, csv_student, ssid):
                    updates += 1

        self.unfixed_students_not_in_csv.update(cali_no_school.keys())
        self.unfixed_students_not_in_csv.update(cali_no_district.keys())
        print(datetime.datetime.now())

    def check_entities_match_csv(self):

        print("\nEntity Checker started.\n\nChecking districts at %s." % datetime.datetime.now())
        with open("out_fixer_missing_districts_%s.csv" % self.start_time, "w",
                  encoding=settings.FILE_ENCODING) as missing_districts:
            for district in self.resources.csv_districts:
                # Check for district in DB
                did = art_student_loader.generate_district_identifier(district[art_student_loader.COUNTY_CODE])
                if not self.resources.districts.find_one({"entityId": did}, projection=[]):
                    self.tally_event(Fixer.FixerEvent.DISTRICTS_MISSING)
                    if missing_districts.tell() == 0:
                        print(settings.DELIMITER.join(district.keys()), file=missing_districts)
                    print(settings.DELIMITER.join(district.values()), file=missing_districts)

        print("\nChecking schools at %s." % datetime.datetime.now())
        with open("out_fixer_missing_schools_%s.csv" % self.start_time, "w",
                  encoding=settings.FILE_ENCODING) as missing_schools:
            for school in self.resources.csv_schools:
                # Check for school in DB
                iid = school[art_student_loader.CDS_CODE]
                if not self.resources.schools.find_one({"entityId": iid}, projection=[]):
                    self.tally_event(Fixer.FixerEvent.SCHOOLS_MISSING)
                    if missing_schools.tell() == 0:
                        print(settings.DELIMITER.join(school.keys()), file=missing_schools)
                    print(settings.DELIMITER.join(school.values()), file=missing_schools)

        print("\nChecking students at %s." % datetime.datetime.now())
        with open("out_fixer_missing_students_%s.csv" % self.start_time, "w",
                  encoding=settings.FILE_ENCODING) as missing_students:
            deltaupdates = 0
            updates = 0
            self.entity_checker_count = 0
            for csv_student in self.generate_csv_students():
                self.entity_checker_count += 1
                updates = self.events.get(Fixer.FixerEvent.STUDENTS_MISSING, 0)
                if not (self.entity_checker_count % 1000):
                    print("Processing csv row %d: %d missing students, %d delta..." % (
                        self.entity_checker_count, updates, updates - deltaupdates))
                    deltaupdates = updates
                # Check for student in DB
                if not self.resources.students.find_one({"entityId": csv_student['SSID']}, projection=[]):
                    self.tally_event(Fixer.FixerEvent.STUDENTS_MISSING)
                    if missing_students.tell() == 0:
                        print(settings.DELIMITER.join(csv_student.keys()), file=missing_students)
                    print(settings.DELIMITER.join(csv_student.values()), file=missing_students)

        print("Entity check complete at %s." % datetime.datetime.now())

    def generate_csv_students(self):
        for file in art_student_loader.open_csv_files(self.options.studentfile):
            for csv_student in csv.DictReader(file, delimiter=settings.DELIMITER):
                yield csv_student

    def summarize(self):
        self.events[Fixer.FixerEvent.NOT_FIXED_STUDENTS_IN_CSV] = len(self.unfixed_students_in_csv)
        self.events[Fixer.FixerEvent.NOT_FIXED_STUDENTS_NOT_IN_CSV] = len(self.unfixed_students_not_in_csv)
        self.events[Fixer.FixerEvent.STUDENTS_LINK_CHECKED] = self.link_fixer_count
        self.events[Fixer.FixerEvent.DISTRICTS_ENTITY_CHECKED] = len(self.resources.csv_districts)
        self.events[Fixer.FixerEvent.SCHOOLS_ENTITY_CHECKED] = len(self.resources.csv_schools)
        self.events[Fixer.FixerEvent.STUDENTS_ENTITY_CHECKED] = self.entity_checker_count

        self.events[Fixer.DistrictEvent.CACHED_DISTRICTS] = len(self.resources.district_cache)
        self.events[Fixer.DistrictEvent.DISTRICTS_FIXED] = len(self.districts_fixed)
        self.events[Fixer.DistrictEvent.DISTRICTS_NOT_FOUND] = len(self.districts_not_found)

        self.events[Fixer.SchoolEvent.CACHED_SCHOOLS] = len(self.resources.school_cache)
        self.events[Fixer.SchoolEvent.SCHOOLS_FIXED] = len(self.schools_fixed)
        self.events[Fixer.SchoolEvent.SCHOOLS_NOT_FOUND] = len(self.schools_not_found)

        if not self.options.writemode:
            print("(READ-ONLY CHECKER MODE - NO CHANGES WERE ATTEMPTED)")

        print("Fixer Events:")
        for name, member in Fixer.FixerEvent.__members__.items():
            print("\t%s: %d" % (name, self.events.get(member, 0)))

        print("District Fixer Events:")
        for name, member in Fixer.DistrictEvent.__members__.items():
            print("\t%s: %d" % (name, self.events.get(member, 0)))

        print("School Fixer Events:")
        for name, member in Fixer.SchoolEvent.__members__.items():
            print("\t%s: %d" % (name, self.events.get(member, 0)))

        print("Writing output files...")

        with open("out_fixer_unfixed_students_in_csv_%s.txt" % self.start_time, "w") as f_unfixed_in_csv:
            for student in sorted(self.unfixed_students_in_csv):
                f_unfixed_in_csv.write("%s\n" % student)
        with open("out_fixer_unfixed_students_not_in_csv_%s.txt" % self.start_time, "w") as f_unfixed_not_in_csv:
            for student in sorted(self.unfixed_students_not_in_csv):
                f_unfixed_not_in_csv.write("%s\n" % student)

        with open("out_fixer_districts_not_found_%s.txt" % self.start_time, "w") as f_districts_not_found:
            for district in sorted(self.districts_not_found):
                f_districts_not_found.write("%s\n" % district)
        with open("out_fixer_districts_success_%s.txt" % self.start_time, "w") as f_districts_fixed:
            for district in sorted(self.districts_fixed):
                f_districts_fixed.write("%s\n" % district)

        with open("out_fixer_schools_not_found_%s.txt" % self.start_time, "w") as f_schools_not_found:
            for school in sorted(self.schools_not_found):
                f_schools_not_found.write("%s\n" % school)
        with open("out_fixer_schools_success_%s.txt" % self.start_time, "w") as f_schools_fixed:
            for school in sorted(self.schools_fixed):
                f_schools_fixed.write("%s\n" % school)

    def fetch_school_mongo_id(self, school_identifier):
        if school_identifier in self.resources.school_cache:
            self.tally_event(Fixer.SchoolEvent.CACHE_HIT)
            school_mongo_id = self.resources.school_cache.get(school_identifier)
        else:
            self.tally_event(Fixer.SchoolEvent.CACHE_MISS)
            school = self.resources.schools.find_one({"entityId": school_identifier}, projection=[])

            school_mongo_id = str(school['_id']) if school else None
            self.resources.school_cache[school_identifier] = school_mongo_id  # Cache the school, good or None.
        return school_mongo_id

    def link_school(self, student_id, school_identifier):
        school_mongo_id = self.fetch_school_mongo_id(school_identifier)
        if not school_mongo_id:
            return Fixer.SchoolEvent.NOT_FIXED_INSTITUTION_NOT_FOUND
        # School found! Fix student and save record.
        if self.options.writemode:
            return self.save_school(student_id, school_identifier, school_mongo_id)
        return None

    def save_school(self, student_id, school_id, school_mongo_id):
        if not self.options.writemode:  # Extra WRITEMODE check (for paranoia).
            return None
        try:
            result = self.resources.students.update_one({'_id': student_id}, {'$set': {
                'institutionIdentifier': school_id, 'institutionEntityMongoId': school_mongo_id
            }})
            if result.matched_count != 1:
                print("WARN: Matched %d documents updating student '%s'." % (result.matched_count, student_id))
        except Exception as e:
            print("Mongo update_one() failed. Student '%s'. Exception '%s'. Skipping." % (student_id, e))
            return Fixer.SchoolEvent.NOT_FIXED_FAILED_TO_SAVE
        return None

    def fetch_district_mongo_id(self, district_identifier):
        if district_identifier in self.resources.district_cache:
            self.tally_event(Fixer.DistrictEvent.CACHE_HIT)
            district_mongo_id = self.resources.district_cache.get(district_identifier)
        else:
            self.tally_event(Fixer.DistrictEvent.CACHE_MISS)
            district = self.resources.districts.find_one({"entityId": district_identifier}, projection=[])
            district_mongo_id = str(district['_id']) if district else None
            self.resources.district_cache[district_identifier] = district_mongo_id  # Cache the district, good or None.
        return district_mongo_id

    def link_district(self, student_id, district_identifier):
        district_mongo_id = self.fetch_district_mongo_id(district_identifier)
        if not district_mongo_id:
            return Fixer.DistrictEvent.NOT_FIXED_DISTRICT_NOT_FOUND
        # District found! Fix student and save record.
        if self.options.writemode:
            return self.save_district(student_id, district_identifier, district_mongo_id)
        return None

    def save_district(self, student_id, district_identifier, mongo_identifier):
        if not self.options.writemode:  # Extra WRITEMODE check (for paranoia).
            return None
        try:
            result = self.resources.students.update_one({'_id': student_id}, {'$set': {
                'districtIdentifier': district_identifier,
                'districtEntityMongoId': mongo_identifier
            }})
            if result.matched_count != 1:
                print("WARN: Matched %d documents updating student '%s'." % (result.matched_count, student_id))
        except Exception as e:
            print("Mongo update_one() failed. Student '%s'. Exception '%s'. Skipping." % (student_id, e))
            return Fixer.DistrictEvent.NOT_FIXED_FAILED_TO_SAVE
        return None


def main(argv):
    options = Options()
    try:
        opts, _ = getopt.getopt(argv, "hwf:c:", ["help", "writemode", "studentfile=", "schoolfile=", ])
    except getopt.GetoptError:
        usage()
        sys.exit(2)

    for opt, arg in opts:
        if opt in ("-h", "--help"):
            usage()
            sys.exit()
        elif opt in ("-w", "--writemode"):
            options.writemode = True
        elif opt in ("-f", "--studentfile"):
            options.studentfile = arg
            print("Command line set studentfile to '%s'" % options.studentfile)
        elif opt in ("-c", "--schoolfile"):
            options.schoolfile = arg
            print("Command line set schoolfile to '%s'" % options.schoolfile)

    # Make sure school and student files are readable before doing anything.
    raise_unless_readable(options.schoolfile)
    raise_unless_readable(options.studentfile)

    fixer = Fixer(options, Resources(options))

    try:
        fixer.fix_missing_mongo_ids()
    except KeyboardInterrupt:
        print("Got keyboard interrupt. Skipping rest of lines for student/district mongo ID fixes.")

    try:
        fixer.check_entities_match_csv()
    except KeyboardInterrupt:
        print("Got keyboard interrupt. Skipping.")

    fixer.summarize()


def usage():
    print("Walk the student/school CALPADS feeds and report any entities missing in ART DB.")
    print("\nCan optionally fix missing links from students to schools and districts.")
    print("(runs in read-only checker mode unless the -w option is provided)")
    print("\nThis utility doesn't download anything - it relies on the loader for that.")
    print("By default it looks for files art_student_loader.py would have just downloaded.")
    print("Like the loader, if a zip file is specified, all files inside will be read.")
    print("\nThis utility uses art_student_loader.py's configuration files. See README.md.")
    print("\nHelp/usage details:")
    print("  -h, --help        : this help screen")
    print("  -c, --schoolfile  : school file (defaults to CA_schools_YYYYMMDD.zip)")
    print("  -f, --studentfile : student file (defaults to CA_students_YYYYMMDD.zip)")
    print("  -w, --writemode   : WRITE MODE - WRITES FIXES TO CONFIGURED ART DB!!")


if __name__ == "__main__":
    main(sys.argv[1:])
