#!/usr/bin/env bash

#Build Ember

# Run Ember stuff
cd /Users/Dan/Dropbox/Website/Current/WhatsDue/WhatsDue-Cordova-EmberCLI/source;
ember build;

# Get into Cordova directors
cd /Users/Dan/Dropbox/Website/Current/WhatsDue/WhatsDue-Cordova-EmberCLI/cordova;

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

