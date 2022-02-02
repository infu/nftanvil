#!/bin/sh
clear;
`vessel bin`/moc --check --hide-warnings `vessel sources 2>>/dev/null` test/typecheck.mo 2>> tmp.err.log >> tmp.output.log

cat tmp.output.log
cat tmp.err.log
rm -f tmp.output.log
rm -f tmp.err.log
