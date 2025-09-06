#!/bin/bash

name="js13k2025"
tmp=`readlink -f "$0"`
dir=`dirname $tmp`
source_dir="${dir}/src"
target_dir="/tmp/build"
# extra_dir="/home/gheja/works_local/extra"
extra_dir="/home/gheja/works_local/js13k2025_build_extra"
final_dir="${dir}"
min_dir="${dir}/tmp/min"
csv="${final_dir}/build_stats.csv"
advzip_iterations="3000"

if [ $TERM == "xterm" ] || [ $TERM == "screen" ]; then
	color_error='\033[1;31m'
	color_success='\033[1;32m'
	color_title='\033[1;38m'
	color_default='\033[0m'
else
	color_error=''
	color_success=''
	color_title=''
	color_default=''
fi

_title()
{
	echo ""
	echo -ne "${color_title}"
	echo "$@"
	echo -ne "${color_default}"
}

_error()
{
	echo -ne "${color_error}"
	echo "$@"
	echo -ne "${color_default}"
}

_success()
{
	echo -ne "${color_success}"
	echo "$@"
	echo -ne "${color_default}"
}

try()
{
	$@
	
	result=$?
	if [ $result != 0 ]; then
		_error "ERROR: \"$@\" failed with exit code $result."
		exit 1
	fi
}

function get_size()
{
	local files="$@"
	
	cat $files | wc -c | awk '{ print $1; }'
}

function get_lines()
{
	local files="$@"
	
	cat $files | wc -l | awk '{ print $1; }'
}


if [ -e "$target_dir" ]; then
	rm -r "$target_dir"
fi

mkdir "$target_dir"

cd "$target_dir"


### stage1 - compilation of typescript to javascript, minimization of javascript and css files

mkdir stage1
mkdir stage1/3rdparty
cd stage1

now=`date +%Y%m%d_%H%M%S`
now2=`date '+%Y-%m-%d %H:%M:%S %:z'`
zip_prefix="${name}_${now}"

_title "Copying files to build directory..."

try rsync -xa --exclude '*.js' --exclude '*.js.map' --exclude '*.zip' "${source_dir}/" ./
try rsync -xa "${source_dir}/3rdparty/" ./3rdparty/
# try rsync -xa "${source_dir}/bonus/" ./bonus/
# try cp "${source_dir}/server/server.min.js" ./
try cp "${source_dir}/externs.js" ./
try cp "${source_dir}/exports.js" ./

zip -r9 ${zip_prefix}_original.zip .

if [ -d "${extra_dir}" ]; then
	try rsync -xa "${extra_dir}/" ./
fi


_title "Checking and installing node packages..."

echo "travis_fold:start:npm"

# if we already have it installed/copied from cache then let's just skip it to make build faster
if [ ! -e 'node_modules/google-closure-compiler' ]; then
	try npm install typescript-closure-compiler google-closure-compiler
fi

echo "travis_fold:end:npm"

export PATH="${target_dir}/stage1/node_modules/.bin:${PATH}"

# note: near.js has a near.min.js version

files_html="index.html"
files_javascript=`cat index.html | grep -E '<script.* src="([^"]+)"' | grep -Eo 'src=\".*\"' | cut -d \" -f 2 | grep -vE '/socket.io|https:|bonus/near\.js' | grep -vE '^(3rdparty|bonus|https:)/'`
# files_javascript_extra=`cat index.html | grep -E '<script.* src="([^"]+)"' | grep -Eo 'src=\".*\"' | cut -d \" -f 2 | grep -vE '/socket.io|https:|bonus/near\.js' | grep -E '^(3rdparty|bonus)/'`
files_typescript=`echo "$files_javascript" | sed -r 's/\.js$/.ts/g'`
files_css=`cat index.html | grep -E '<link type="text/css" rel="stylesheet" href="([^"]+)"' | grep -Eo 'href=\".*\"' | cut -d \" -f 2`

# cat ./src/$i | sed -e '/DEBUG BEGIN/,/\DEBUG END/{d}' | grep -vE '^\"use strict\";$' >> ./build/stage1/merged.js

lines_html=`get_lines $files_html`
lines_typescript=`get_lines $files_typescript`
lines_css=`get_lines $files_css`

size_html=`get_size $files_html`
size_typescript=`get_size $files_typescript`
size_css=`get_size $files_css`


_title "Compiling TypeScript to JavaScript..."

echo "travis_fold:start:tscc"

# for i in $files_typescript; do
# 	sed -r -i 's/^(const IS_PROD_BUILD).*/\1 = true;/g' $i
# done

try tscc $files_typescript

echo "travis_fold:end:tscc"

## copy the *_original.zip to the project dir
cp *.zip ${final_dir}/

exit 0
