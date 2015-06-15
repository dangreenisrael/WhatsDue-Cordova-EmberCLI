#!/usr/bin/env bash

#Build Ember

# Run Ember stuff
cd /Users/Dan/Git\ Repos/WhatsDue\ App/source;
ember build --environment="production";

# Get into Cordova directors
cd /Users/Dan/Git\ Repos/WhatsDue\ App/cordova;

# Run Android
if [ "$1" = "run" ]
then
    cordova run android;
# Build for either
elif ["$1" = "build"]
then
    # Build for android (release)
    if [ "$2" = "android" ]
    then
        cordova build android --release;
    # Build for iOS
    elif ["$2" = "ios"]
    then
        cordova build ios;
    fi
fi

