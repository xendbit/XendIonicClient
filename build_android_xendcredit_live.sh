#!/bin/bash
mv *.apk backup/
RC="`cat rc.txt`"
MAJOR_VERSION="`cat major_version.txt`"
MINOR_VERSION="`cat minor_version.txt`"
BASE_DIR=$(pwd)

INCREMENT_VERSION="$1"

if [[ $INCREMENT_VERSION == "yes" ]]
then
  RC=$((RC + 1))
fi

#MAJOR_VERSION=$((MAJOR_VERSION + 1))
#MINOR_VERSION=$((MINOR_VERSION + 1))
VERSION="v$MAJOR_VERSION.$MINOR_VERSION-rc$RC"

cd $BASE_DIR
echo "$VERSION"
echo "$RC" > rc.txt
echo "$MINOR_VERSION" > minor_version.txt
echo "$MAJOR_VERSION" > major_version.txt

CONSTANTS_FILE="constants.ts"
BAK_FILE="$CONSTANTS_FILE.bak"
WORKING_FILE="$CONSTANTS_FILE.work"

cd $BASE_DIR/src/pages/utils/
#back up constants.ts
cp $CONSTANTS_FILE $BAK_FILE
#make a working copy as well
#tail -n +1 prints the whole file
#tail -n +2 prints all file expect the first line
#tail -n +3 prints all file expect the first 2 lines

tail -n +13 $CONSTANTS_FILE > $WORKING_FILE
#add the server base url and the first line of file
echo 'import { keystore } from "eth-lightwallet";
import { StorageService } from "./storageservice";
import { Console } from "./console";
import { Headers } from "@angular/http";
import { networks, Network } from "bitcoinjs-lib";
import { LocalProps } from "./localprops";
import { CoinsSender } from "./coinssender";

export class Constants {
static TOMCAT_URL = "https://lb.xendbit.com";' > /tmp/temp
echo "static APP_VERSION = \"$VERSION\";" >> /tmp/temp
echo "static ENABLE_GUEST = false;" >> /tmp/temp
#echo "static NOTIFICATION_SOCKET_URL = \"ws://192.250.236.180:8080/notify/websocket\";" >> /tmp/temp

cat /tmp/temp | cat - $WORKING_FILE > temp && mv temp $WORKING_FILE
mv $WORKING_FILE $CONSTANTS_FILE
cd $BASE_DIR

export CORDOVA_ANDROID_GRADLE_DISTRIBUTION_URL=https://services.gradle.org/distributions/gradle-6.1.1-all.zip
ionic cordova build android --release --verbose -- -- --minSdkVersion=22 --targetSdkVersion=29
cd $BASE_DIR/platforms/android
./gradlew clean
./gradlew assemble
cd $BASE_DIR
jarsigner -storepass @bsolute -tsa http://timestamp.digicert.com -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore XendBit.keystore $BASE_DIR/platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk XendBit

/Users/aardvocate/Library/Android/sdk/build-tools/24.0.2/zipalign -v 4  $BASE_DIR/platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk XendBit.apk

mv XendBit.apk XendCredit.$VERSION.apk
cp XendCredit.$VERSION.apk ~/Dropbox/XendCredit/prod/
#reverse the process above

cd $BASE_DIR/src/pages/utils/
mv $BAK_FILE $CONSTANTS_FILE

cd $BASE_DIR

echo "Done"
