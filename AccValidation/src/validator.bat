GOTO EndComment
This batch file runs the jar file of Accommodation Validator application to validate accommodation against 
schema and custom rules. Upon successful validation it saves the accommodations in mongo database to be used
by Administration and Registration Tools (ART)

The properties in this file need to be modified as per the system it is running in.

The target users of this application are the ART administrators.

This file is used from Windows command line usage: $0 $1 ($0 represents Script file name and $1 represents Config file name)

This script reads a config file named config_file_name that provides the following parameters:
    REM basedir=the base directory for the files and output log
    REM validatorjar=the full name of the validator jar file including the extension
    REM accomconfig=the filename of the ART accommodations XML file
    REM xsd=the filename of the XSD against which the XML will be validated
    REM mongohost=FQDN of the host running Mongo DB
    REM mongouser=Mongo username with write access
    REM mongopwd=password of Mongo user
    REM mongodbname=name of Mongo DB
    REM mongoport=port of Mongo DB

##License
Educational Online Test Delivery System
Copyright (c) 2015 American Institutes for Research
 
Distributed under the AIR Open Source License, Version 1.0
See accompanying file AIR-License-1_0.txt or at 
http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf

:EndComment

@Echo Off
REM Set defaults here
set controller=org.opentestsystem.delivery.AccValidator.handlers.AccController

REM verify config file is there
If Not Exist "%~1" (
   Echo configfile does not exist, quitting.
   goto :eof
)

REM read in config file
for /f %%x in (%1) do (
set %%x
)

REM Validating config file
IF DEFINED validatorjar (Echo validatorjar IS defined) ELSE (Echo validatorjar is NOT defined.
goto :eof)
IF DEFINED accomconfig (Echo accomconfig IS defined) ELSE (Echo accomconfig is NOT defined.
goto :eof)
IF DEFINED xsd (Echo xsd IS defined) ELSE (Echo xsd is NOT defined.
goto :eof)
IF DEFINED mongohost (Echo mongohost IS defined) ELSE (Echo mongohost is NOT defined.
goto :eof)
IF DEFINED mongouser (Echo mongouser IS defined) ELSE (Echo mongouser is NOT defined.
goto :eof)
IF DEFINED mongopwd (Echo mongopwd IS defined) ELSE (Echo mongopwd is NOT defined.
goto :eof)
IF DEFINED mongodbname (Echo mongodbname IS defined) ELSE (Echo mongodbname is NOT defined.
goto :eof)
IF DEFINED mongoport (Echo mongoport IS defined) ELSE (Echo mongoport is NOT defined.
goto :eof)
IF DEFINED basedir (Echo basedir IS defined) ELSE (Echo basedir is NOT defined.
goto :eof)


SET BASE_DIR=%basedir%
java -DconfigFilePath="%BASE_DIR%\%accomconfig%" -DxsdFilePath="%BASE_DIR%\%xsd%" -DlogFilePath="%BASE_DIR%\Logs" -Dmongo.host="%mongohost%" -Dmongo.user="%mongouser%" -Dmongo.pwd="%mongopwd%" -Dmongo.db_name="%mongodbname%" -Dmongo.port="%mongoport%" -classpath "%validatorjar%" %controller%

pause