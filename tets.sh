#!/bin/bash

txtrst='\e[0m' # Text Reset
txtred='\e[0;31m' # Red
txtgrn='\e[0;32m' # Green
WORK_TREE='/www/ovpn-stat'

echo "========================================"
while read oldrev newrev ref
do
  case $ref in
    refs/heads/master )

      git --work-tree=$WORK_TREE checkout -f master
      if [ $? -eq 0 ]; then
        echo -e "${txtgrn}DEVELOPER SERVER successfully updated${txtrst}"
      else
        echo -e "${txtred}Failed to checkout DEVELOPER SERVER!${txtrst}"
      fi
    ;;
    * )
    echo "NO UPDATES FOR $oldrev"
    ;;
  esac
done
echo "========================================"