#!/bin/sh
./helpers/local_typecheck.sh 
fswatch -o mo/ test | xargs -n1 -I{} ./helpers/local_typecheck.sh 
