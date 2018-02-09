#!/usr/bin/env python

# Python 3 required. A virtualenv is recommended. Install requirements.txt.

from enum import Enum
import datetime

import pymongo

try:
    import settings_secret as settings
except:
    import settings_default as settings
    print("*** USING DEFAULTS in settings_default.py.")
    print("*** Please copy settings_default.py to settings_secret.py and modify that!")


class AutoNumber(Enum):
    def __new__(cls):
        value = len(cls.__members__) + 1
        obj = object.__new__(cls)
        obj._value_ = value
        return obj


class SchoolFixer:

    class Event(AutoNumber):
        CACHE_HIT = ()
        CACHE_MISS = ()
        FIXED = ()
        NOT_FIXED_FAILED_TO_SAVE = ()
        NOT_FIXED_INSTITUTION_NOT_FOUND = ()
        NOT_FIXED_NO_INSTITUTION_ID = ()

    def __init__(self):
        self.start_time = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
        self.rowidx = 0
        self.school_cache = {}
        self.events = {}

        client = pymongo.MongoClient(settings.HOST, settings.PORT)
        self.db = client[settings.DBNAME]
        self.schools = self.db[settings.INSTITUTION_COLLECTION]
        self.students = self.db[settings.STUDENT_COLLECTION]

    def tally_event(self, event):
        self.events[event] = self.events.get(event, 0) + 1

    def fail(self, student, event):
        self.tally_event(event)
        self.students_not_fixed.write("%s,%s,%s,%s\n" % (
            student.get('entityId', ''),
            student.get('districtIdentifier', ''),
            student.get('institutionIdentifier', ''),
            event.name,
        ))

    def success(self, student, event):
        self.tally_event(event)

    def fix(self):
        print("\nStarted at %s. %s schools, %s students in DB:\n\t%s" % (
            self.start_time, self.schools.count(), self.students.count(), self.db))

        input("\n***** Press enter to start fixing, CTRL-C to cancel! *****")

        print("Fetching students...")
        print(datetime.datetime.now())
        cali_no_school = list(self.students.find(
            {"stateAbbreviation": "CA", "institutionEntityMongoId": {"$exists": False}},
            projection=["institutionIdentifier"],
            cursor_type=pymongo.cursor.CursorType.EXHAUST))
        print("got %d no-school students..." % len(cali_no_school))
        print(datetime.datetime.now())

        schools = set([s.get('institutionIdentifier', None) for s in cali_no_school])
        print("got %d schools, filling cache..." % len(schools))
        print(datetime.datetime.now())

        mongo_ids = set([self.fetch_school_mongo_id(id) for id in schools])
        print("got %d mongo_ids, cache has %d" % (len(mongo_ids), len(self.school_cache)))
        print(datetime.datetime.now())

        self.students_not_fixed = open("students_school_not_fixed_%s.csv" % self.start_time, "w")
        self.students_not_fixed.write("entityId,institutionIdentifier,institutionIdentifier,failure\n")

        self.schools_not_found = set()
        self.schools_fixed = set()

        deltaupdates = 0
        updates = 0
        try:
            for student in cali_no_school:
                # Some nice progress to look at...
                self.rowidx += 1
                if self.rowidx % 1000 == 0:
                    print("Processing row %d, %d updates, %d delta..." % (
                        self.rowidx, updates, updates - deltaupdates))
                    deltaupdates = updates

                school_id = student.get('institutionIdentifier', None)
                if not school_id:
                    self.fail(student, SchoolFixer.Event.NOT_FIXED_NO_INSTITUTION_ID)
                    continue

                failure = self.link(student.get('_id'), school_id)
                if failure:
                    self.schools_not_found.add(school_id)
                    self.fail(student, failure)
                else:
                    updates += 1
                    self.schools_fixed.add(school_id)
                    self.success(student, SchoolFixer.Event.FIXED)
        except KeyboardInterrupt:
            print("Got keyboard interrupt. Exiting school fixer.")

        self.students_not_fixed.close()
        print(datetime.datetime.now())

    def summarize(self):
        print("\nSchool Fixer processed %d students." % self.rowidx)
        print("Cached %d schools." % (len(self.school_cache)))
        print("Events:")
        for name, member in SchoolFixer.Event.__members__.items():
            print("\t%s: %d" % (name, self.events.get(member, 0)))

        print("Could not find %d schools. Writing..." % len(self.schools_not_found))
        with open("schools_not_found_%s.out" % self.start_time, "w") as f_schools_not_found:
            for school in sorted(self.schools_not_found):
                f_schools_not_found.write("%s\n" % school)

        print("Fixed %d schools. Writing..." % len(self.schools_fixed))
        with open("schools_fixed_%s.out" % self.start_time, "w") as f_schools_fixed:
            for school in sorted(self.schools_fixed):
                f_schools_fixed.write("%s\n" % school)

    def fetch_school_mongo_id(self, school_identifier):
        if school_identifier in self.school_cache:
            self.tally_event(SchoolFixer.Event.CACHE_HIT)
            school_mongo_id = self.school_cache.get(school_identifier)
        else:
            self.tally_event(SchoolFixer.Event.CACHE_MISS)
            school = self.schools.find_one({"entityId": school_identifier}, projection=[])
            school_mongo_id = str(school['_id']) if school else None
            self.school_cache[school_identifier] = school_mongo_id  # Cache the school, good or None.
        return school_mongo_id

    def link(self, student_id, school_identifier):
        school_mongo_id = self.fetch_school_mongo_id(school_identifier)
        if not school_mongo_id:
            return SchoolFixer.Event.NOT_FIXED_INSTITUTION_NOT_FOUND
        # School found! Fix student and save record.
        return self.save(student_id, school_mongo_id)

    def save(self, student_id, school_mongo_id):
        try:
            result = self.students.update_one({'_id': student_id}, {'$set': {
                'institutionEntityMongoId': school_mongo_id
            }})
            if result.matched_count != 1:
                print("WARN: Matched %d documents updating student '%s'." % (result.matched_count, student_id))
        except Exception as e:
            print("Mongo update_one() failed. Student '%s'. Exception '%s'. Skipping." % (student_id, e))
            return SchoolFixer.Event.NOT_FIXED_FAILED_TO_SAVE
        return None


class DistrictFixer:

    class Event(AutoNumber):
        CACHE_HIT = ()
        CACHE_MISS = ()
        FIXED_APPEND_ZEROES = ()
        FIXED_LINKED_AS_IS = ()
        FIXED_PREPEND_APPEND_ZEROES = ()
        NOT_FIXED_DISTRICT_NOT_FOUND = ()
        NOT_FIXED_FAILED_TO_SAVE = ()
        NOT_FIXED_NO_DISTRICT_ID = ()

    def __init__(self):
        self.start_time = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
        self.rowidx = 0
        self.district_cache = {}
        self.events = {}

        client = pymongo.MongoClient(settings.HOST, settings.PORT)
        self.db = client[settings.DBNAME]
        self.districts = self.db[settings.DISTRICT_COLLECTION]
        self.students = self.db[settings.STUDENT_COLLECTION]

    def tally_event(self, event):
        self.events[event] = self.events.get(event, 0) + 1

    def fail(self, student, event):
        self.tally_event(event)
        self.students_not_fixed.write("%s,%s,%s,%s\n" % (
            student.get('entityId', ''),
            student.get('districtIdentifier', ''),
            student.get('institutionIdentifier', ''),
            event.name,
        ))

    def success(self, student, event):
        self.tally_event(event)

    def fix(self):
        print("\nDistrict Fix Started at %s. %d districts, %s students in DB:\n\t%s" % (
            self.start_time, self.districts.count(), self.students.count(), self.db))

        print("Fetching students...")
        print(datetime.datetime.now())
        cali_no_district = list(self.students.find(
            {"stateAbbreviation": "CA", "districtEntityMongoId": {"$exists": False}},
            projection=["districtIdentifier"],
            cursor_type=pymongo.cursor.CursorType.EXHAUST))
        print("got %d no-district students..." % len(cali_no_district))
        print(datetime.datetime.now())

        districts = set([s.get('districtIdentifier', None) for s in cali_no_district])
        print("got %d districts, filling cache..." % len(districts))
        print(datetime.datetime.now())

        district_mongo_ids = set([self.fetch_district_mongo_id(did) for did in districts])
        print("got %d district_mongo_ids, cache has %d" % (len(district_mongo_ids), len(self.district_cache)))
        print(datetime.datetime.now())

        self.students_not_fixed = open("students_district_not_fixed_%s.csv" % self.start_time, "w")
        self.students_not_fixed.write("entityId,districtIdentifier,institutionIdentifier,failure\n")

        self.districts_not_found = set()
        self.districts_fixed = set()

        deltaupdates = 0
        updates = 0
        try:
            for student in cali_no_district:
                # Some nice progress to look at...
                self.rowidx += 1
                if self.rowidx % 1000 == 0:
                    print("Processing row %d, %d updates, %d delta..." % (
                        self.rowidx, updates, updates - deltaupdates))
                    deltaupdates = updates

                district_id = student.get('districtIdentifier', None)
                if not district_id:
                    self.fail(student, DistrictFixer.Event.NOT_FIXED_NO_DISTRICT_ID)
                    continue

                failure = True
                scheme = DistrictFixer.Event.FIXED_APPEND_ZEROES
                # If district ID is 6 characters long, prepend a 0.
                if len(district_id) == 6:
                    district_id = "0" + district_id
                    scheme = DistrictFixer.Event.FIXED_PREPEND_APPEND_ZEROES

                # If missing 7 trailing 0's, add zeroes and link.
                if not district_id.endswith("0000000"):
                    failure = self.link(student.get('_id'), "%s0000000" % district_id)

                # If not fixed yet, try relinking with unmodified district ID.
                if failure:
                    scheme = DistrictFixer.Event.FIXED_LINKED_AS_IS
                    failure = self.link(student.get('_id'), student.get('districtIdentifier'))

                if failure:
                    self.districts_not_found.add(student.get('districtIdentifier'))
                    self.fail(student, failure)
                else:
                    updates += 1
                    self.districts_fixed.add(student.get('districtIdentifier'))
                    self.success(student, scheme)
        except KeyboardInterrupt:
            print("Got keyboard interrupt. Exiting.")

        self.students_not_fixed.close()
        print(datetime.datetime.now())

    def summarize(self):
        print("\nDistrict Fixer processed %d students." % self.rowidx)
        print("Cached %d districts." % (len(self.district_cache)))
        print("Events:")
        for name, member in DistrictFixer.Event.__members__.items():
            print("\t%s: %d" % (name, self.events.get(member, 0)))

        print("Could not find %d districts. Writing..." % len(self.districts_not_found))
        with open("districts_not_found_%s.out" % self.start_time, "w") as f_districts_not_found:
            for district in sorted(self.districts_not_found):
                f_districts_not_found.write("%s\n" % district)

        print("Fixed %d districts. Writing..." % len(self.districts_fixed))
        with open("districts_fixed_%s.out" % self.start_time, "w") as f_districts_fixed:
            for district in sorted(self.districts_fixed):
                f_districts_fixed.write("%s\n" % district)

    def fetch_district_mongo_id(self, district_identifier):
        if district_identifier in self.district_cache:
            self.tally_event(DistrictFixer.Event.CACHE_HIT)
            district_mongo_id = self.district_cache.get(district_identifier)
        else:
            self.tally_event(DistrictFixer.Event.CACHE_MISS)
            district = self.districts.find_one({"entityId": district_identifier}, projection=[])
            district_mongo_id = str(district['_id']) if district else None
            self.district_cache[district_identifier] = district_mongo_id  # Cache the district, good or None.
        return district_mongo_id

    def link(self, student_id, district_identifier):
        district_mongo_id = self.fetch_district_mongo_id(district_identifier)
        if not district_mongo_id:
            return DistrictFixer.Event.NOT_FIXED_DISTRICT_NOT_FOUND
        # District found! Fix student and save record.
        return self.save(student_id, district_identifier, district_mongo_id)

    def save(self, student_id, district_identifier, mongo_identifier):
        try:
            result = self.students.update_one({'_id': student_id}, {'$set': {
                'districtIdentifier': district_identifier,
                'districtEntityMongoId': mongo_identifier
            }})
            if result.matched_count != 1:
                print("WARN: Matched %d documents updating student '%s'." % (result.matched_count, student_id))
        except Exception as e:
            print("Mongo update_one() failed. Student '%s'. Exception '%s'. Skipping." % (student_id, e))
            return DistrictFixer.Event.NOT_FIXED_FAILED_TO_SAVE
        return None


if __name__ == "__main__":
    sfixer = SchoolFixer()
    dfixer = DistrictFixer()

    sfixer.fix()
    dfixer.fix()

    sfixer.summarize()
    dfixer.summarize()
