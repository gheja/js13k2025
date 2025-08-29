#!/bin/bash

last_checksum="none"

if [ $TERM == "xterm" ] || [ $TERM == "screen" ]; then
	color_title='\033[1;37;44m'
	color_title_error='\033[1;33;41m'
	color_default='\033[0m'
else
	color_title=''
	color_title_error=''
	color_default=''
fi

prefix="${color_title} >>> ${color_default} "
prefix_error="${color_title_error} >>> [ERROR] ${color_default} "


n=0
while true; do
	n=$((n + 1))
	
	find -printf '%C@ %T@ %i %U %G %m %s %p\n' > ../list_${n}.txt
	# checksum=`find -printf '%A@ %C@ %T@ %i %U %G %m %s %p\n' | md5sum - | awk '{ print $1; }'`
	checksum=`cd src; find -printf '%C@ %T@ %i %U %G %m %s %p\n' | md5sum - | awk '{ print $1; }'`
	
	if [ "$checksum" == "$last_checksum" ]; then
		sleep 1
		continue
	fi
	
	last_checksum="$checksum"
	
	echo -e "${prefix}Files changed, starting build process..."
	
	/bin/bash dev_build.sh
	
	if [ $? == 0 ]; then
		echo -e "${prefix}Build was successful."
		
		rsync -xav --exclude 'node_modules' --exclude '*.zip' /tmp/build/stage1/ /var/www/html/; chmod -R ugo+rX /var/www/html
	else
		echo -e "${prefix_error}Build failed!"
		
		echo "last build failed" > /var/www/html/index.html
	fi
	
	
	echo ""
done
