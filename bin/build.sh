#!/bin/bash

PROJECT_ROOT=$(cd "$(dirname "$0")/../"; pwd);


cd $PROJECT_ROOT;

if [ -d "./build" ]; then
	rm -rf "./build";
fi;

mkdir "./build";

cat \
	"./source/_config.js" \
	"./source/_console.js" \
	"./source/git-work-help.js" \
	"./source/git-work-show.js" \
	"./source/git-work-sync.js" \
	"./source/_init.js" \
	> "./build/git-work.js"

chmod +x ./build/git-work.js;

