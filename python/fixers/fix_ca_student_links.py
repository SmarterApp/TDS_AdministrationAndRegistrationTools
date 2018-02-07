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
        self.district_cache = {}
        self.district_events = {}

        client = pymongo.MongoClient(settings.HOST, settings.PORT)
        self.db = client[settings.DBNAME]
        self.districts = self.db[settings.DISTRICT_COLLECTION]
        self.schools = self.db[settings.INSTITUTION_COLLECTION]
        self.students = self.db[settings.STUDENT_COLLECTION]

    def tally_event(self, event):
        self.district_events[event] = self.district_events.get(event, 0) + 1

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
        start_time = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
        print("\nStarted at %s. %d districts, %s schools, %s students in DB:\n\t%s" % (
            start_time, self.districts.count(), self.schools.count(), self.students.count(), self.db))

        cali_no_district = self.students.find({
            "stateAbbreviation": "CA",
            "districtEntityMongoId": {"$exists": False}})
        # print("%d cali_no_district found." % cali_no_district.count())

        # cali_no_school = self.students.find({
        #     "stateAbbreviation": "CA",
        #     "institutionEntityMongoId": {"$exists": False}})
        # print("%d cali_no_school found." % cali_no_school.count())

        input("\n***** Press enter to start fixing, CTRL-C to cancel! *****")

        self.students_not_fixed = open("students_not_fixed_%s.csv" % start_time, "w")
        self.students_not_fixed.write("entityId,districtIdentifier,institutionIdentifier,failure\n")

        rowidx = 0
        self.districts_not_found = set()
        self.districts_fixed = set()

        try:
            for student in cali_no_district:
                # Some nice progress to look at...
                rowidx += 1
                if rowidx % 1000 == 0:
                    print("Processing row %d..." % rowidx)

                district_id = student.get('districtIdentifier', None)
                if not district_id:
                    self.fail(student, DistrictFixer.Event.NOT_FIXED_NO_DISTRICT_ID)
                    continue

                failure = None
                scheme = DistrictFixer.Event.FIXED_APPEND_ZEROES
                # If district ID is 6 characters long, prepend a 0.
                if len(district_id) == 6:
                    district_id = "0" + district_id
                    scheme = DistrictFixer.Event.FIXED_PREPEND_APPEND_ZEROES

                # If missing 7 trailing 0's, add zeroes and link.
                if not district_id.endswith("0000000"):
                    failure = self.link(student, "%s0000000" % district_id)

                # If not fixed yet, try relinking with unmodified district ID.
                if failure:
                    scheme = DistrictFixer.Event.FIXED_LINKED_AS_IS
                    failure = self.link(student, student.get('districtIdentifier'))

                if failure:
                    self.districts_not_found.add(student.get('districtIdentifier'))
                    self.fail(student, failure)
                else:
                    self.districts_fixed.add(student.get('districtIdentifier'))
                    self.success(student, scheme)
        except KeyboardInterrupt:
            print("Got keyboard interrupt. Exiting.")

        self.students_not_fixed.close()

        print("Processed %d students." % rowidx)
        print("Cached %d districts." % (len(self.district_cache)))
        print("Events:")
        for name, member in DistrictFixer.Event.__members__.items():
            print("\t%s: %d" % (name, self.district_events.get(member, 0)))

        print("Could not find %d districts. Writing..." % len(self.districts_not_found))
        with open("districts_not_found_%s" % start_time, "w") as f_districts_not_found:
            for district in sorted(self.districts_not_found):
                f_districts_not_found.write("%s\n" % district)

        print("Fixed %d districts. Writing..." % len(self.districts_fixed))
        with open("districts_fixed_%s" % start_time, "w") as f_districts_fixed:
            for district in sorted(self.districts_fixed):
                f_districts_fixed.write("%s\n" % district)

    def fetch(self, district_identifier):
        if district_identifier in self.district_cache:
            self.tally_event(DistrictFixer.Event.CACHE_HIT)
            district = self.district_cache.get(district_identifier)
        else:
            self.tally_event(DistrictFixer.Event.CACHE_MISS)
            district = self.districts.find_one({"entityId": district_identifier})
            self.district_cache[district_identifier] = district  # Cache the district, good or None.
        return district

    def link(self, student, district_identifier):
        district = self.fetch(district_identifier)
        if not district:
            return DistrictFixer.Event.NOT_FIXED_DISTRICT_NOT_FOUND
        # District found! Fix student and save record.
        student['districtIdentifier'] = district_identifier
        student['districtEntityMongoId'] = str(district['_id'])
        return self.save(student)

    def save(self, student):
        try:
            result = self.students.replace_one({'_id': student.get('_id')}, student)
            if result.matched_count != 1:
                print("WARN: Matched %d documents saving student '%s'." % (result.matched_count, student))
        except Exception as e:
            print("Mongo replace_one() failed. Student '%s'. Exception '%s'. Skipping." % (student, e))
            return DistrictFixer.Event.NOT_FIXED_FAILED_TO_SAVE
        return None


if __name__ == "__main__":
    DistrictFixer().fix()
