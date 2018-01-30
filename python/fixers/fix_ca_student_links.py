#!/usr/bin/env python

# Python 3 required. A virtualenv is recommended. Install requirements.txt.

import pymongo

try:
    import settings_secret as settings
except:
    import settings_default as settings
    print("*** USING DEFAULTS in settings_default.py.")
    print("*** Please copy settings_default.py to settings_secret.py and modify that!")


class FixerUpper:

    def __init__(self):
        self.districtCache = {}
        self.districtsNotFound = set()

        client = pymongo.MongoClient(settings.HOST, settings.PORT)
        self.db = client[settings.DBNAME]
        self.districts = self.db[settings.DISTRICT_COLLECTION]
        self.schools = self.db[settings.INSTITUTION_COLLECTION]
        self.students = self.db[settings.STUDENT_COLLECTION]

    def fix_districts(self):
        print("\n%d districts, %s schools, %s students in DB:\n\t%s" % (
            self.districts.count(), self.schools.count(), self.students.count(), self.db))

        californians = self.students.find({"stateAbbreviation": "CA"})
        print("\n%d californians found." % californians.count())

        cali_no_district = self.students.find({"stateAbbreviation": "CA", "districtEntityMongoId": {"$exists": False}})
        print("%d cali_no_district found." % cali_no_district.count())

        cali_no_school = self.students.find({"stateAbbreviation": "CA", "institutionEntityMongoId": {"$exists": False}})
        print("%d cali_no_school found." % cali_no_school.count())

        input("\nPress enter to start munging, CTRL-C to cancel!")

        notfixed = []
        modified = []
        for student in cali_no_district:
            print("processing %s..." % student['entityId'])
            districtIdentifier = student.get('districtIdentifier', None)

            if not districtIdentifier:
                print("\tstudent has no districtIdentifier")
                continue

            fixed = self.link_district(student, districtIdentifier)

            if not fixed and not districtIdentifier.endswith("0000000"):
                districtIdentifier = "%s0000000" % districtIdentifier
                print("\tadded 7 0's to student district ID, now '%s', will relink..." % districtIdentifier)
                fixed = self.link_district(student, districtIdentifier)

            if not fixed:
                print("\t*** Could not fix %s!" % student['entityId'])
                notfixed.append(student)
                continue

            print("\tStudent fixed! saving...")

            # student.pop("delete", None)
            try:
                result = self.students.replace_one({'_id': student.get('_id')}, student)
                modified.append(student)
                if result.matched_count != 1:
                    raise Exception(
                        "Matched %d documents saving student '%s'! Modified while running?" % result.matched_count)
            except pymongo.errors.DuplicateKeyError as e:
                notfixed.append(student)
                print("Duplicate key found for entity '%s': %s" % (student, e))

        print("Fixed %d students." % len(modified))
        print("Could not fix %d students." % len(notfixed))
        print("Could not find %d districts (%s)." % (len(self.districtsNotFound), self.districtsNotFound))
        print("Cached %d districts (%s)." % (len(self.districtCache), self.districtCache))

    def link_district(self, student, districtIdentifier):
        district = None
        if districtIdentifier in self.districtCache:
            print("Cache hit!!!")
            district = self.districtCache.get(districtIdentifier)
        else:
            print("Cache miss...")
            district = self.districts.find_one({"entityId": districtIdentifier})
            self.districtCache[districtIdentifier] = district  # Cache the district, good or None.
        if not district:
            self.districtsNotFound.add(districtIdentifier)
            return None
        student['districtEntityMongoId'] = str(district['_id'])
        return student


if __name__ == "__main__":
    FixerUpper().fix_districts()
