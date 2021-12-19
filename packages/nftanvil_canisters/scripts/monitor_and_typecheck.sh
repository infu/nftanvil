#!/bin/sh
./scripts/local_typecheck.sh 
fswatch -o mo/ test | xargs -n1 -I{} ./scripts/local_typecheck.sh 
