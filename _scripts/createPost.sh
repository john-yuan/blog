#!/bin/bash

readonly CURRENT_DIR=$(cd $(dirname $0) && pwd)
readonly ROOT_DIR=$(cd $CURRENT_DIR/.. && pwd)
readonly POSTS_DIR="${ROOT_DIR}/_posts"

if [ "$1" == "" ]
then
    echo "Please enter the file name"
    echo "Usage: ${0} <filename>"
    exit 1
fi

readonly DATE=$(date "+%Y-%m-%d")
readonly FILENAME="${DATE}-${1}.md"

cd $POSTS_DIR
touch $FILENAME

if [ "$(cat $FILENAME)" == "" ]
then
    echo "---" >> $FILENAME
    echo "layout: post" >> $FILENAME
    echo "title:" >> $FILENAME
    echo "category:" >> $FILENAME
    echo "tags:" >> $FILENAME
    echo "---" >> $FILENAME
    echo "" >> $FILENAME
    echo "<!--more-->" >> $FILENAME
    echo
    echo "File created: _posts/$FILENAME"
    echo
else
    echo
    echo "_posts/$FILENAME is not empty, exit without touching it"
    echo
fi
