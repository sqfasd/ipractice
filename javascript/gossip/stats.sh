#!/bin/bash

if [ $# -ne 2 ]; then
  echo "$0 <label> <round>"
  exit 1
fi
label=$1
round="round$2"
#cat log |grep $label |awk '{print $2}'|awk -F "->" -v round=$round '{if(NF == step) print$0}'|awk -F "->" '{print$3}'|sort|uniq |wc -l
cat log |grep $label |grep $round | awk '{print$3}'|sort|uniq|wc -l
