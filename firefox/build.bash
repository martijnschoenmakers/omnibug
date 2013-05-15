#!/bin/bash

#
# Build extension .xpi
#

APP=omnibug
XPIFILE=${APP}.xpi

#find . -name "*.jar" -exec rm {} \;
find . -name "*.xpi" -exec rm {} \;

echo "Creating xpi"
chrome_files=`find chrome -type f|grep -v \.svn`
defaults_files=`find defaults -type f|grep -v \.svn`

zip "$XPIFILE" $chrome_files $defaults_files install.rdf chrome.manifest
echo ""

echo -n "Created file: "
ls "$XPIFILE"
