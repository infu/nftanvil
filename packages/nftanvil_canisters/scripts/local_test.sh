#!/bin/sh

for file in test/*
do
 `vessel bin`/moc --check `vessel sources` "$file" 2>> tmp.err.log >> tmp.output.log
done
clear

cat tmp.output.log
cat tmp.err.log
rm -f tmp.output.log
rm -f tmp.err.log
