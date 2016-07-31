#!/bin/bash

if [ $# -ne 1 ]; then
  echo "$0 <total>"
  exit 1
fi
total=$1
n=$2
for sq in `seq 1 $total`
do
  ((sq=$sq-1))
  node server.js $sq $total&
done
wait
