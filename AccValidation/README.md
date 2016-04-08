# Welcome to the Accommodation Validator Application #
The purpose of this application is to validate the XML file containing the accommodations which are going to be used in ART and to store it in database upon successful validation.

## License ##
This project is licensed under the [AIR Open Source License v1.0](http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf).

## Setup
In general, building the code and running the AccValidation class is a good first step.  However, there are other steps that need to be performed in order to fully set up the system.

## Properties
To run this application, the following properties are required:

* -D`configFilePath`= {BASE_DIR/ xml file name which will contain the accommodation} [BASE_DIR is the root folder containing all the files]
* -D`xsdFilePath`= {BASE_DIR/schema file name against which the validation will take place} 
* -D`logFilePath`= {BASE_DIR/Log file name} 
* -D`mongo.host`={ART database hostname}
* -D`mongo.user`={ART database username having write access} 
* -D`mongo.pwd`= {ART database password}
* -D`mongo.db_name`= {ART database name} 
* -D`mongo.port`= {ART database port number} 

## Scripts
There is a shell script (`validator.sh`) for Linux and a batch file (`validator.bat`) for Windows, in the main folder. Either of these can be used to run the JAR file of this application. Those files also need the properties mentioned above modified before running. 

## Dependency
There is no dependency on other SBAC modules; this is a stand-alone application.