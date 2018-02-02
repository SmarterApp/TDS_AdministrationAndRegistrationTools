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
        self.cacheHits = 0
        self.cacheMisses = 0

        client = pymongo.MongoClient(settings.HOST, settings.PORT)
        self.db = client[settings.DBNAME]
        self.districts = self.db[settings.DISTRICT_COLLECTION]
        self.schools = self.db[settings.INSTITUTION_COLLECTION]
        self.students = self.db[settings.STUDENT_COLLECTION]

    def fix_districts(self):
        print("\n%d districts, %s schools, %s students in DB:\n\t%s" % (
            self.districts.count(), self.schools.count(), self.students.count(), self.db))

        cali_no_district = self.students.find({
            "stateAbbreviation": "CA",
            "districtEntityMongoId": {"$exists": False}})
        # print("%d cali_no_district found." % cali_no_district.count())

        # cali_no_school = self.students.find({
        #     "stateAbbreviation": "CA",
        #     "institutionEntityMongoId": {"$exists": False}})
        # print("%d cali_no_school found." % cali_no_school.count())

        input("\n***** Press enter to start fixing, CTRL-C to cancel! *****")

        rowidx = 0
        notfixed = 0
        modified = 0
        districtsNotFound = set()

        for student in cali_no_district:

            # Something nice to look at...
            rowidx += 1
            if rowidx % 1000 == 0:
                print("Processing row %d..." % rowidx)

            origDistrictIdentifier = student.get('districtIdentifier', None)
            if not origDistrictIdentifier:
                notfixed += 1
                continue

            fixed = None
            # If district ID is 6 characters long, prepend a 0 and try to link.
            if len(origDistrictIdentifier) == 6:
                fixed = self.link_district(student, "0%s" % origDistrictIdentifier)

            # If missing 7 trailing 0's, add them and try to link.
            if not fixed and not origDistrictIdentifier.endswith("0000000"):
                fixed = self.link_district(student, "%s0000000" % origDistrictIdentifier)

            # If not fixed yet, just try relinking with district ID as-is.
            if not fixed:
                fixed = self.link_district(student, origDistrictIdentifier)

            if not fixed:
                notfixed += 1
                districtsNotFound.add(origDistrictIdentifier)
                continue

            # Student is fixed! Save record.
            try:
                result = self.students.replace_one({'_id': student.get('_id')}, student)
                modified += 1
                if result.matched_count != 1:
                    raise Exception(
                        "Matched %d documents saving student '%s'! Modified while running?" % result.matched_count)
            except pymongo.errors.DuplicateKeyError as e:
                notfixed += 1
                print("Duplicate key found for entity '%s': %s" % (student, e))

        print("Processed %d students." % rowidx)
        print("Fixed %d students." % modified)
        print("Could not fix %d students." % notfixed)
        print("Cached %d districts. %d hits, %d misses." % (len(self.districtCache), self.cacheHits, self.cacheMisses))
        print("Could not find %d districts, as found on students:\n%s\n" % (len(districtsNotFound), districtsNotFound))

    def link_district(self, student, districtIdentifier):
        district = None
        if districtIdentifier in self.districtCache:
            self.cacheHits += 1
            district = self.districtCache.get(districtIdentifier)
        else:
            self.cacheMisses += 1
            district = self.districts.find_one({"entityId": districtIdentifier})
            self.districtCache[districtIdentifier] = district  # Cache the district, good or None.
        if not district:
            return None
        student['districtIdentifier'] = districtIdentifier
        student['districtEntityMongoId'] = str(district['_id'])
        return student


if __name__ == "__main__":
    FixerUpper().fix_districts()
