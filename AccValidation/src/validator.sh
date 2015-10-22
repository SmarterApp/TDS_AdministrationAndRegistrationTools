#!/bin/bash
#
# PURPOSE
# This script runs the jar file of Accommodation Validator application to validate ART accommodation against 
# schema and custom rules. Upon successful validation it saves the accommodations in mongo database to be used
# by Administration and Registration Tools (ART)
#
# METHODOLOGY
# This script first sets the base directory for the files being used (Accessibility XML and XSD, as well as the logs)
#
# TARGET USERS
# This script is for use by ART Administrators only
#
# USAGE
# validator.sh [-c=config_file_name -b=basedir ...]
# See usage {} function for a description of available parameters
# This script reads a config file named config_file_name that provides the following parameters:
# basedir=(the base directory for the files and output log)
# accomconfig=(the filename of the ART accommodations XML file)
# xsd=(the filename of the XSD against which the XML will be validated)
# mongohost=(FQDN of the host running Mongo DB)
# mongouser=(Mongo username with write access)
# mongopwd=(password of Mongo user)
# mongodbname=(name of Mongo DB)
# mongoport=(port of Mongo DB)
# 
# LICENSE
# Distributed under the AIR Open Source License, Version 1.0
# See accompanying file AIR-License-1_0.txt or at
# http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
# Copyright (c) 2015 American Institutes for Research
#

function usage {
    echo
    echo "ART ACCOMMODATION VALIDATOR SCRIPT USAGE: "
    echo " This script validates accommodations from an XML file against schema and custom rules"
    echo " USAGE: $0 param1=value1 param2=value2 ..."
    echo " where available params are as follows: "
    echo " -c=|--configfile  = Config file name           (DEFAULT: validator.conf)"
    echo " -b=|--basedir     = Base directory             (DEFAULT: [current directory])"
    echo " -h|--help         = Show usage information for this script"
    echo "This script reads a config file named config_file_name that provides the following parameters:"
    echo "  basedir=(the base directory for the files and output log)"
    echo "  accomconfig=(the filename of the ART accommodations XML file)"
    echo "  xsd=(the filename of the XSD against which the XML will be validated)"
    echo "  mongohost=(FQDN of the host running Mongo DB)"
    echo "  mongouser=(Mongo username with write access)"
    echo "  mongopwd=(password of Mongo user)"
    echo "  mongodbname=(name of Mongo DB)"
    echo "  mongoport=(port of Mongo DB)"
    echo
}

# Set defaults here
configfile=validator.conf
basedir="."
jarfile=AccommodationValidator-0.0.1.jar
controller=org.opentestsystem.delivery.AccValidator.handlers.AccController

# parse command line
for i in "$@"
do
    case $i in
	-h|--help)
	    usage
	    exit 0
	    ;;
	-c=*|--configfile=*)
	configfile="${i#*=}"
	;;
	-b=*|--basedir=*)
	basedir="${i#*=}"
	;;
    esac
done

# verify config file is there
if [ -e "$basedir/$configfile" ] ; then
    echo "File $basedir/$configfile found. Validating..."
else 
    echo "** ERROR: File $basedir/$configfile NOT found.";
    usage
    exit 1
fi

# read in config file and validate
error=0

while IFS="=" read -r key value; do
    case "$key" in
	# ignore lines beginning with comments
	'#'*) ;;
	"basedir") 
	    if [ -d $basedir/$value ] ; then
		basedir="$value"
	    else
		echo "** ERROR: directory $value not found."
		error=1
	    fi 
	    ;;
	"accomconfig")
	    if [ -e $basedir/$value ] ; then
		accomconfig="$value"
	    else
		echo "** ERROR: Accommodations config file $basedir/$value not found."
		error=1
	    fi
	    ;;
	"xsd")
	    if [ -e $basedir/$value ] ; then
		xsd="$value" 
	    else
		echo "** ERROR: XSD file $basedir/$value not found."
		error=1
	    fi
	    ;;
	"mongohost")  
	    if test "x$value" != "x" ; then
		mongohost="$value" 
	    else
		echo "** ERROR: mongo hostname is blank."
		error=1
	    fi
	    ;;
	"mongouser")
	    if test "x$value" != "x" ; then
		mongouser="$value" 
	    else
		echo "** ERROR: mongo username is blank."
		error=1
	    fi
	    ;;
	"mongopwd")    
	    if test "x$value" != "x" ; then
		mongopwd="$value" 
	    else
		echo "** ERROR: mongo password is blank."
		error=1
	    fi
	    ;;
	"mongodbname") 
	    if test "x$value" != "x" ; then
		mongodbname="$value"
	    else
		echo "** ERROR: mongo DB name is blank."
		error=1
	    fi
	    ;;
	"mongoport")
	    if test "x$value" != "x" ; then
		mongoport="$value"
	    else
		echo "** ERROR: mongo port is blank."
		error=1
	    fi
	    ;;
	*) echo "Invalid key [$key] found in $basedir/$configfile"
	    error=1
	    ;;
    esac
done < "$basedir/$configfile"

if [ $error == 1 ] ; then
    usage
    exit
else 
    echo "done"
fi

# testing only
cat <<EOF
Command to be executed: 
java -DconfigFilePath="$basedir/$accomconfig" -DxsdFilePath="$basedir/$xsd" -DlogFilePath="$basedir/logs" -Dmongo.host="$mongohost" -Dmongo.user="$mongouser" -Dmongo.pwd="$mongopwd" -Dmongo.db_name="$mongodbname" -Dmongo.port="$mongoport" -cp "$jarfile" $controller

EOF

java -DconfigFilePath="$basedir/$accomconfig" -DxsdFilePath="$basedir/$xsd" -DlogFilePath="$basedir/logs" -Dmongo.host="$mongohost" -Dmongo.user="$mongouser" -Dmongo.pwd="$mongopwd" -Dmongo.db_name="$mongodbname" -Dmongo.port="$mongoport" -cp "$jarfile" $controller


