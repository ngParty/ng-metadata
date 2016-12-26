#!/usr/bin/env bash

function jsonval {
  temp=`echo $json | sed 's/\\\\\//\//g' | sed 's/[{}]//g' | awk -v k="text" '{n=split($0,a,","); for (i=1; i<=n; i++) print a[i]}' | sed 's/\"\:\"/\|/g' | sed 's/[\,]/ /g' | sed 's/\"//g' | grep -w $prop| cut -d":" -f2| sed -e 's/^ *//g' -e 's/ *$//g'`
  echo ${temp##*|}
}
json=`cat package.json`
prop='version';
version=`jsonval`;

echo "ng-metadata version: ${version} new version publish process START!"
git add package.json && git commit -m "chore(release): bump version to ${version}" && \
npm run changelog && \
git add CHANGELOG.md && git commit -m "docs(changelog): update changelog to ${version}" && \
git push && \
git tag ${version} && git push --tags && \
npm publish && \
echo "ng-metadata version: ${version} published SUCCESS!"
