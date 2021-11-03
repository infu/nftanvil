#!/bin/sh
./scripts/local_test.sh 
fswatch -o src/ic test | xargs -n1 -I{} ./scripts/local_test.sh 
