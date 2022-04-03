#!/bin/sh

cp -r ./mo/lib ./vessel/src/
cp -r ./mo/type ./vessel/src/
cp -r ./mo/base ./vessel/src/

cp package-set.dhall vessel/
cp vessel.dhall vessel/
cd vessel
git add *
git commit -m "publish"
git push 
cd ..
