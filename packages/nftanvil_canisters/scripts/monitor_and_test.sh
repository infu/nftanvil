#!/bin/sh
./scripts/local_test.sh 
fswatch -o mo/ test | xargs -n1 -I{} ./scripts/local_test.sh 
