/***********************************************************************************************
 *
 *   Grit, Copyright 2022 OpenLongTrails.org.
 *
 *   This file is part of OpenLongTrails Grit.
 *
 *   OpenLongTrails Grit is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 *   OpenLongTrails Grit is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License along with OpenLongTrails Grit. If not, see <https://www.gnu.org/licenses/>. 
 *
 ***********************************************************************************************/

import { Button, SafeAreaView, ScrollView } from 'react-native';
import * as Device from 'expo-device';
import * as FileSystem from 'expo-file-system';
import { Storage } from 'aws-amplify';
import { deleteFile, getFileInfo, getFileUri, isTrailDownloaded, loadFile } from './Utils_Files';
import * as globals from './Globals';
import { styles } from './Styles';

export function DevMenuScreen({ route, navigation }) {
  console.log("=== At DevMenuScreen.");

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/*
        }<Button
          title="Spoof CL"
          onPress={handleSpoofCL}
        />
        */}

        <Button
          title="List device files"
          onPress={listFiles}
        />

        <Button
          title="Log Policy Docs"
          onPress={handleLogPolicyDocs}
        />

        <Button
          title="Log appSettings"
          onPress={logAppSettings}
        />

        <Button
          title="List files root dir"
          onPress={listFilesRootDir}
        />

        <Button
          title="Log Logfile"
          onPress={logLogfile}
        />

        <Button
          title="Log Waypoints"
          onPess={handleLogWaypoints}
        />

        <Button
          title="Device"
          onPress={handleDevice}
        />

        <Button
          title="File info"
          onPress={checkFile}
        />

        <Button
          title="delete about.json"
          onPress={delFile}
        />

        <Button
          title="delete PCT"
          onPress={deletePCT}
        />

        <Button
          title="Delete comments.json"
          onPress={handleDeleteCommentsJson}
        />

        <Button
          title="PCT exists"
          onPress={trailExists}
        />

        <Button
          title="Log GpsHistoryFile"
          onPress={logGpsHistoryFile}
        />

        <Button
          title="Delete gpshistory.json"
          onPress={deleteGpsHistoryFile}
        />

        <Button
          title="Log comments"
          onPress={handleLogComments}
        />

        <Button
          title="Log Feedback"
          onPress={handleLogFeedback}
        />

        <Button
          title="Delete Feedback File"
          onPress={handleDeleteFeedbackFile}
        />

        <Button
          title="Delete Logs"
          onPress={handleDeleteLogs}
        />

        <Button
          title="Log Netinfo"
          onPress={handleLogNetinfo}
        />

        {/*
        <Button
          title="Fetch comments"
          onPress={fetchAndSaveComments}
        />

        <Button
          title="Upload comments"
          onPress={uploadLocalComments}
        />

        <Button
          title="Signout"
          onPress={signOut}
        />

        <Button
          title="Log commentsToUpload.json"
          onPress={logCommentsToUpload}
        />

        <Button
          title="Log comments"
          onPress={logComments}
        />

        <Button
          title="Delete commentsToUpload.json"
          onPress={deleteCommentsToUpload}
        />
        */}
      </ScrollView>
    </SafeAreaView>
  );
}

function logAppSettings() {
  console.log("=== appSettings: ", globals.appSettings);
}

async function listFiles() {
  let listing = await FileSystem.readDirectoryAsync(getFileUri(""));
  let listingLogs = await FileSystem.readDirectoryAsync(getFileUri("logs"));
  let listingPCT = await FileSystem.readDirectoryAsync(getFileUri("pacific-crest-trail"));

  console.log("=== oltgrit/: ", listing);
  console.log("=== oltgrit/logs: ", listingLogs);
  console.log("=== oltgrit/pacific-crest-trail: ", listingPCT);

  for (const filename of listing) {
    let fileInfo = await getFileInfo(filename);
    console.log("=== getFileInfo() " + filename + " " + JSON.stringify(fileInfo));
  }

  for (const filename of listingLogs) {
    let fileInfo = await getFileInfo(filename);
    console.log("=== getFileInfo() " + filename + " " + JSON.stringify(fileInfo));
  }

  for (const filenamePCT of listingPCT) {
    let fileInfo = await getFileInfo(filenamePCT);
    console.log("=== getFileInfo() " + filenamePCT + " " + JSON.stringify(fileInfo));
  }
}

async function listFilesRootDir() {
  let listing = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);

  console.log("=== FileSystem.documentDirectory: ", FileSystem.documentDirectory);
  console.log(listing);
}

async function logLogfile() {
  let logfileContents = await FileSystem.readAsStringAsync(FileSystem.documentDirectory + "logs_30-3-2022");

  console.log("=== logfileContents: ", logfileContents);
}

async function checkFile() {
  let fileInfo = await getFileInfo("appSettings.json");

  console.log(JSON.stringify("=== " + fileInfo));
}

function handleDevice() {
  let d = Device;
  console.log("=== Device: ", JSON.stringify(d));
}

async function delFile() {
  console.log("=== At deleteFile().")

  let filename = "termsOfService.json";

  fileInfo = await getFileInfo(filename);

  if (fileInfo.exists == true) {
    console.log("=== deleteFile: file.exists == true, deleting...")
    await deleteFile(filename);
  } else {
    console.log("=== deleteFile: file not found: ", filename);
  }

  filename = "privacyPolicy.json";

  fileInfo = await getFileInfo(filename);

  if (fileInfo.exists == true) {
    console.log("=== deleteFile: file.exists == true, deleting...")
    await deleteFile(filename);
  } else {
    console.log("=== deleteFile: file not found: ", filename);
  }

  filename = "about.json";

  fileInfo = await getFileInfo(filename);

  if (fileInfo.exists == true) {
    console.log("=== deleteFile: file.exists == true, deleting...")
    await deleteFile(filename);
  } else {
    console.log("=== deleteFile: file not found: ", filename);
  }
}

async function trailExists() {
  console.log("=== At trailExists(). Calling isTrailDownloaded(...).");

  let result = await isTrailDownloaded("pacific-crest-trail");

  console.log("=== isTrailDownloaded('pacific-crest-trail'): ", result);
}

async function deletePCT() {
  console.log("=== deletePCT(): deleting files...");
  await deleteFile("pacific-crest-trail/waypoints.geojson");
  await deleteFile("pacific-crest-trail/milepoints.geojson");
  await deleteFile("pacific-crest-trail/buffers.geojson");
  await deleteFile("pacific-crest-trail/tracks.geojson");
  await deleteFile("pacific-crest-trail/");
}

async function handleDeleteCommentsJson() {
  console.log("=== At deleteCommentsJson().");
  await deleteFile("comments.json");
}

async function logGpsHistoryFile() {
  console.log("=== At logGpsHistoryFile().");
  let gpsHistoryFileInfo = await getFileInfo("gpshistory.json");

  if (gpsHistoryFileInfo.exists == false) {
    console.log("=== gpshistory.json not found.");
  } else {
    let resultData = await loadFile("gpshistory.json")

    console.log("=== " + resultData);
  }
}

async function deleteGpsHistoryFile() {
  console.log("=== At deleteGpsHistoryFile().");
  let gpsHistoryFileInfo = await getFileInfo("gpshistory.json");

  if (gpsHistoryFileInfo.exists == false) {
    console.log("=== gpshistory.json not found.");
  } else {
    await deleteFile("gpshistory.json");
  }
}

function handleLogComments() {
  console.log("=== At handleLogComments().");

  globals.comments.map(comment => console.log("=== " + JSON.stringify(comment)));
}

async function handleLogFeedback() {
  console.log("=== At handleLogFeedback().");

  let feedbackFileInfo = await getFileInfo("toUploadFeedback.json");

  if (feedbackFileInfo.exists == true) {
    let feedback = await loadFile("toUploadFeedback.json");
    console.log("=== feedback.json: ", feedback);
  } else {
    console.log("=== handleLogFeedback(): toUploadFeedback.json not found.");
  }
}

async function handleDeleteFeedbackFile() {
  console.log("=== At handleDeleteFeedbackFile().");

  let feedbackFileInfo = await getFileInfo("toUploadFeedback.json");

  if (feedbackFileInfo.exists == true) {
    console.log("=== handleDeleteFeedbackFile(): Deleting toUploadFeedback.json...");
    await deleteFile("toUploadFeedback.json");
  } else {
    console.log("=== handleDeleteFeedbackFile(): toUploadFeedback.json not found.");
  }
}

async function handleDeleteLogs() {
  let listingLogs = await FileSystem.readDirectoryAsync(getFileUri("logs"));

  for (const filename of listingLogs) {
    console.log(`=== handleDeleteLogs(): Deleting ${filename}...`);

    await deleteFile("logs/" + filename);
  }
}

async function handleLogNetinfo() {
  console.log("=== At handleLogNetinfo().");

  let netinfoFileInfo = await getFileInfo("netinfo.txt");

  if (netinfoFileInfo.exists == true) {
    let netinfo = await loadFile("netinfo.txt");
    console.log("=== netinfo.txt: ", netinfo);
  } else {
    console.log("=== handleLogNetinfo(): netinfo.txt not found.");
  }
}

function handleLogWaypoints() {
  console.log("=== handleLogWaypoints(): globals.initialWaypoints[]: ", JSON.stringify(globals.initialWaypoints).substring(0, 300));
}

async function handleTestPerms() {
  console.log("=== Attempting to overwrite trail-data/trails.json on S3");
  await Storage.put("trail-data/trails.json", { test: "data" });
}

async function handleTestPermsDownload() {
  console.log("=== Attempting to download feedback file...");
  let feedback = await storageGetJson("feedback/feedback_4fd0ea65-cfdd-4d71-94e4-feb44b6c0f99_2204044017.json");
  console.log("*** Result of get feedback: ", feedback);
}

async function handleLogPolicyDocs() {
  console.log("=== At handleLogPolicyDocs().");

  let termsOfServiceFileInfo = await getFileInfo("termsOfService.json");

  if (termsOfServiceFileInfo.exists == true) {
    let termsOfServiceDoc = await loadFile("termsOfService.json");
    console.log("=== termsOfService.json: ", termsOfServiceDoc.substring(0, 200));
  } else {
    console.log("=== handleLogPolicyDocs(): termsOfService.json not found.");
  }

  let privacyPolicyFileInfo = await getFileInfo("privacyPolicy.json");

  if (privacyPolicyFileInfo.exists == true) {
    let privacyPolicyDoc = await loadFile("privacyPolicy.json");
    console.log("=== privacyPolicy.json: ", privacyPolicyDoc.substring(0, 200));
  } else {
    console.log("=== handleLogPolicyDocs(): privacyPolicy.json not found.");
  }

}
