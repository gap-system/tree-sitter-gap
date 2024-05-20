#!/usr/bin/env bash

find_and_flatten() {
  # Recursively find all files matching filename regex and copy them to a flat directory
  # $1 input directories
  # $2 filename regex
  # $3 output directory
  find $1 -type f -regextype sed -regex $2 -exec sh -c 'new=$1/$(echo "{}" | tr "/" "-" | tr " " "_" | sed "s/\.-//"); cp "{}" "$new"' echo $3 \;
}

usage="usage: $(basename "$0") [-h] [-v version_string] work_dir

A (relatively) simple script for extracting GAP code from the GAP source and packages.

positional arguments:
work_dir             Working directory to be used (relative to current path).

options:
  -h                   Show this help text.
  -v                   Version of GAP to use. If omitted, the current development version will be used.
  -o                   Output prefix. Defaults to \"corpus\".
"

version=latest
output=corpus

while getopts ':hv:o:' option; do
  case "$option" in
    h) echo "$usage"
       exit
       ;;
    v) version=$OPTARG
       ;;
    o) output=$OPTARG
       ;;
    :) printf "missing argument for -%s\n" "$OPTARG" >&2
       echo "$usage" >&2
       exit 1
       ;;
    \?) printf "illegal option: -%s\n" "$OPTARG" >&2
       echo "$usage" >&2
       exit 1
       ;;
  esac
done
shift $((OPTIND - 1))
if [ -z "$1" ]; then
    printf "missing argument for work_dir\n" >&2
    echo "$usage" >&2
    exit 1
fi

work_dir=$1
# If version is specified as e.g. 4.13.0, append leading v so that git tags
# would work.
if [ "$version" != "latest" ] && [ "${version:0:1}" != "v" ]; then
  version="v"$version
fi
# Make sure path is relative
if [ "${work_dir:0:2}" != "./" ]; then
  work_dir=./$work_dir
fi

echo "Creating work directory $work_dir . . ."
mkdir -p $work_dir

echo "Extracting GAP $version corpus to $work_dir/${output}_gap.tar.gz . . . "
if [ ! -d $work_dir/gap ]; then \
  echo "Cloning GAP into $work_dir/gap . . ."
	git clone --depth=1 https://github.com/gap-system/gap $work_dir/gap; \
fi
if [ "$version" != "latest" ]; then
  echo "Fetching $version tag . . ."
  git -C $work_dir/gap fetch origin --depth=1 tag $version --no-tags
  echo "Checkout $version tag . . ."
  git -C $work_dir/gap -c advice.detachedHead=false checkout tags/$version
else
  echo "Fetching $version . . ."
  git -C $work_dir/gap fetch origin --depth=1 master
  echo "Checkout $version . . ."
  git -C $work_dir/gap -c advice.detachedHead=false checkout master
fi;
if [ -d $work_dir/${output}_gap ]; then
  rm -rf $work_dir/${output}_gap
fi
mkdir -p $work_dir/${output}_gap
echo "Finding and flattening all .g and .tst files . . ."
find_and_flatten "$work_dir/gap/grp $work_dir/gap/lib $work_dir/gap/tst" ".*\.\(gd\|gi\|g\|tst\)" "$work_dir/${output}_gap"
echo "Running fixup script . . ."
find "$work_dir/${output}_gap" -type f -exec ./etc/extract_g.py {} \;
echo "Removing all .tst files . . ."
find "$work_dir/${output}_gap" -name *.tst -type f -delete
echo "Compressing to $work_dir/${output}_gap.tar.gz . . ."
tar -czf $work_dir/${output}_gap.tar.gz -C $work_dir/${output}_gap .
echo "Removing $work_dir/${output}_gap . . ."
rm -rf $work_dir/${output}_gap

echo "Extracting GAP $version package corpus to $work_dir/${output}_pkg.tar.gz . . . "
if [ ! -d $work_dir/pkg_$version ]; then \
  echo "Downloading and extracting GAP packages into $work_dir/pkg_$version . . ."
  curl -L https://github.com/gap-system/PackageDistro/releases/download/$version/packages.tar.gz > $work_dir/packages.tar.gz
  mkdir -p $work_dir/pkg_$version
  tar -xzf $work_dir/packages.tar.gz -C $work_dir/pkg_$version
  rm $work_dir/packages.tar.gz
fi
if [ -d $work_dir/${output}_pkg ]; then
  rm -rf $work_dir/${output}_pkg
fi
mkdir -p $work_dir/${output}_pkg
echo "Finding and flattening all .g and .tst files . . ."
find_and_flatten "$work_dir/pkg_$version" ".*\.\(gd\|gi\|g\|tst\)" "$work_dir/${output}_pkg"
echo "Running fixup script . . ."
find "$work_dir/${output}_pkg" -type f -exec ./etc/extract_g.py {} \;
echo "Removing all .tst files . . ."
find "$work_dir/${output}_pkg" -name *.tst -type f -delete
echo "Compressing to $work_dir/${output}_pkg.tar.gz . . ."
tar -czf $work_dir/${output}_pkg.tar.gz -C $work_dir/${output}_pkg .
echo "Removing $work_dir/${output}_pkg . . ."
rm -rf $work_dir/${output}_pkg

echo "Corpus extraction successful . . ."
