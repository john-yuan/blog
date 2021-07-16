#!/bin/bash

readonly CURRENT_DIR=$(cd $(dirname $0) && pwd)

cd $CURRENT_DIR/..

sudo docker-compose up

http-server _site
