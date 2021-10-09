#!/bin/sh
./local_test.sh 
fswatch -o src/dropship test | xargs -n1 -I{} ./local_test.sh 
