GOTO EndComment
This batch file runs the jar file of Accommodation Validator application to validate accommodation against 
schema and custom rules. Upon successful validation it saves the accommodations in mongo database to be used
by Administration and Registration Tools (ART)

The properties in this file need to be modified as per the system it is running in.

The target users of this application are the ART administrators.

This file is used from Windows command line or just by right clicking on the file and selecting 'Run as administrator'

##License
Educational Online Test Delivery System
Copyright (c) 2015 American Institutes for Research
 
Distributed under the AIR Open Source License, Version 1.0
See accompanying file AIR-License-1_0.txt or at 
http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf

:EndComment

SET BASE_DIR="C:/Users/mskhan/Desktop/2015.07.08.TaskOrder10DesignOutputs"
java -DconfigFilePath="%BASE_DIR%/AccessibilityConfig.v3.xml" -DxsdFilePath="%BASE_DIR%/AccessibilityConfig.v2.xsd" -DlogFilePath="%BASE_DIR%/Logs" -Dmongo.host="" -Dmongo.user="" -Dmongo.pwd="" -Dmongo.db_name="localhost" -Dmongo.port="" -classpath "AccommodationValidator-0.0.1.jar" org.opentestsystem.delivery.AccValidator.handlers.AccController

pause