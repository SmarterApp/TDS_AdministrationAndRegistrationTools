#!/bin/bash

BASE_DIR=`dirname $0`

echo "Running grunt build"
echo "-------------------------------------------------------------------"
echo "base dir="+$BASE_DIR
export PATH="$PATH:/usr/local/bin"

#npm install  grunt
#npm install  grunt-contrib-concat
#npm install  grunt-contrib-clean

echo "Done installing local node modules"
cd $BASE_DIR
grunt --force
