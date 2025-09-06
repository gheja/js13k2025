#!/bin/bash

last_checksum=""

ls -1 | grep -E '_original\.zip$' | sort | while read a; do
	# consider the checksum and the filename only
	checksum=`unzip -lv "$a" | tail -n +4 | head -n -2 | sed -r 's/^.{48}(.*$)/\1/g' | md5sum - | awk '{ print $1; }'`
	
	if [ "$last_checksum" == "$checksum" ]; then
		rm -v "$a"
	fi
	
	last_checksum="$checksum"
done
