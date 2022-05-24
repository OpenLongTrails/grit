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

import NetInfo from '@react-native-community/netinfo';
import { Storage } from 'aws-amplify';
import moment from 'moment';
import * as FileSystem from 'expo-file-system';
import {
  deleteFile, flushGpsHistoryToFile, getAboutFileVersion, getFileInfo, getFileUri, getPolicyDocumentsVersions,
  getVersionsOfLocalTrailFiles, loadFile, writeFile
} from './Utils_Files';
import * as globals from './Globals';

export async function downloadTrail(trailData) {
  // Check whether directory for the trail already exists. If not, create it.
  let directory = await getFileInfo(trailData.trailId);
  console.log("=== downloadTrail(): getFileInfo(" + trailData.trailId + "): " + JSON.stringify(directory));

  if (directory.exists == false) {
    console.log("=== downloadTrail(): Creating directory...");
    try {
      await FileSystem.makeDirectoryAsync(getFileUri(trailData.trailId));
    } catch (err) {
      globals.log.error("===downloadTrail(): FileSystem.makeDirectoryAsync() returned error: ", getFileUri(trailData.trailId) + " / " + err);
    }

    let result = await getFileInfo("trail-data/" + trailData.trailId);
    console.log("=== downloadTrail(): result of makeDirectoryAsync(): ", JSON.stringify(result));
  } else {
    console.log("=== downloadTrail(): Directory already exists: ", trailData.trailId);
  }

  let versionsOfLocalTrailFiles = await getVersionsOfLocalTrailFiles(trailData.trailId);
  console.log("=== downloadTrail(): trailFileVersions: ", JSON.stringify(versionsOfLocalTrailFiles));

  // Check version of local json file and compare to current version from trails.json. If update is available, download it.
  console.log("=== downloadTrail(): Calling updateAboutJson()...");
  await updateAboutJson();

  await updatePolicyDocuments();

  // Check version of local geojson file and compare to current version from trails.json. If update is available, download it.
  console.log("=== downloadTrail(): buffers.geojson local / server versions: ", versionsOfLocalTrailFiles["buffers"] + " / " + trailData["currentVersions"]["buffers"]);
  if (versionsOfLocalTrailFiles["buffers"] < trailData["currentVersions"]["buffers"]) {
    console.log("=== downloadTrail(): Downloading updated version of buffers.geojson. Calling storageGetJson(buffersFileServerPath)..");
    let buffersFileServerPath = "trail-data/" + trailData.trailId + "/buffers-" + trailData.currentVersions.buffers + ".geojson";

    let buffersData = await storageGetJson(buffersFileServerPath);
    console.log("=== downloadTrail(): Calling writeFile(buffersData)...");
    await writeFile(trailData.trailId + "/buffers.geojson", buffersData);
  }

  // Check version of local geojson file and compare to current version from trails.json. If update is available, download it.
  console.log("=== downloadTrail(): tracks.geojson local / server versions: ", versionsOfLocalTrailFiles["tracks"] + " / " + trailData["currentVersions"]["tracks"]);
  if (versionsOfLocalTrailFiles["tracks"] < trailData["currentVersions"]["tracks"]) {
    console.log("=== downloadTrail(): Downloading updated version of tracks.geojson. Calling storageGetJson(tracksFileServerPath)...");
    let tracksFileServerPath = "trail-data/" + trailData.trailId + "/tracks-" + trailData.currentVersions.tracks + ".geojson";

    let tracksData = await storageGetJson(tracksFileServerPath);
    console.log("=== downloadTrail(): Calling writeFile(tracksData)...");
    await writeFile(trailData.trailId + "/tracks.geojson", tracksData);
  }

  // Check version of local geojson file and compare to current version from trails.json. If update is available, download it.
  console.log("=== downloadTrail(): milepoints.geojson local / server versions: ", versionsOfLocalTrailFiles["milepoints"] + " / " + trailData["currentVersions"]["milepoints"]);
  if (versionsOfLocalTrailFiles["milepoints"] < trailData["currentVersions"]["milepoints"]) {
    console.log("=== downloadTrail(): Downloading updated version of milepoints.geojson. Calling storageGetJson(milepointsFileServerPath)...");
    let milepointsFileServerPath = "trail-data/" + trailData.trailId + "/milepoints-" + trailData.currentVersions.milepoints + ".geojson";

    let milepointsData = await storageGetJson(milepointsFileServerPath);
    console.log("=== downloadTrail(): Calling writeFile(milepointsData)...");
    await writeFile(trailData.trailId + "/milepoints.geojson", milepointsData);
  }

  // Check version of local geojson file and compare to current version from trails.json. If update is available, download it.
  console.log("=== downloadTrail(): waypoints.geojson local / server versions: ", versionsOfLocalTrailFiles["waypoints"] + " / " + trailData["currentVersions"]["waypoints"]);
  if (versionsOfLocalTrailFiles["waypoints"] < trailData["currentVersions"]["waypoints"]) {
    console.log("=== downloadTrail(): Downloading updated version of waypoints.geojson. Calling storageGetJson(waypointsFileServerPath)...");
    let waypointsFileServerPath = "trail-data/" + trailData.trailId + "/waypoints-" + trailData.currentVersions.waypoints + ".geojson";

    let waypointsData = await storageGetJson(waypointsFileServerPath);
    console.log("=== downloadTrail(): Calling writeFile(waypointsData)...");
    await writeFile(trailData.trailId + "/waypoints.geojson", waypointsData);
  }
}

export async function updateAboutJson() {
  console.log("=== At updateAboutJson().");
  let localAboutJsonVersion = await getAboutFileVersion();

  console.log("=== updateAboutJson(): localAboutJsonVersion / server version: ", localAboutJsonVersion + " / " + globals.trailsJson["aboutVersion"]);

  if (localAboutJsonVersion < globals.trailsJson["aboutVersion"]) {
    console.log("=== updateAboutJson(): Calling storageGetJson('about.json')...");
    let aboutJsonData = await storageGetJson("trail-data/about.json");

    console.log("=== updateAboutJson(): Calling writeFile(aboutJsonData)...")
    await writeFile("about.json", aboutJsonData);
  }
}

export async function updatePolicyDocuments() {
  console.log("=== At updatePolicyDocuments().");
  let { localTermsOfServiceJsonVersion, localPrivacyPolicyJsonVersion } = await getPolicyDocumentsVersions();

  console.log("=== updatePolicyDocuments(): localTermsOfServiceJsonVersion / server version: ", localTermsOfServiceJsonVersion + " / " + globals.trailsJson["termsOfServiceVersion"]);
  console.log("=== updatePolicyDocuments(): localPrivacyPolicyJsonVersion / server version: ", localPrivacyPolicyJsonVersion + " / " + globals.trailsJson["privacyPolicyVersion"]);

  if (localTermsOfServiceJsonVersion < globals.trailsJson["termsOfServiceVersion"]) {
    console.log("=== updatePolicyDocuments(): Updating terms of service. Calling storageGetJson('trail-data/termsOfService.json')...");
    let termsOfServiceJsonData = await storageGetJson("trail-data/termsOfService.json");

    console.log("=== updatePolicyDocuments(): Writing termsOfService.json: ", JSON.stringify(termsOfServiceJsonData).substring(0, 200));
    await writeFile("termsOfService.json", termsOfServiceJsonData);
  }

  if (localPrivacyPolicyJsonVersion < globals.trailsJson["privacyPolicyVersion"]) {
    console.log("=== updatePolicyDocuments(): Updating privacy policy. Calling storageGetJson('trail-data/privacyPolicy.json')...");
    let privacyPolicyJsonData = await storageGetJson("trail-data/privacyPolicy.json");

    console.log("=== updatePolicyDocuments(): Writing privacyPolicy.json: ", JSON.stringify(privacyPolicyJsonData).substring(0, 200));
    await writeFile("privacyPolicy.json", privacyPolicyJsonData);
  }
}

export async function downloadTrailsJson() {
  console.log("=== At downloadTrailsJson. Calling storageGetJson('trail-data/trails.json')...");
  let trailsList = await storageGetJson("trail-data/trails.json");

  console.log("=== downloadTrailsJson(): typeof trailsList: ", typeof trailsList);
  console.log("=== downloadTrailsJson(): JSON.stringify(trailsList): ", JSON.stringify(trailsList));

  console.log("=== Writing trails.json...");
  await writeFile("trails.json", trailsList);
}

export async function storageGetJson(file) {
  // Getting text from a blob in Expo has been challenging.
  // Amplify Storage.get() returns an object with a blob.
  // Blob.text() is not working in Expo. Before even attempting Blob.text(), the following throws an error:
  //    let text = new Blob(s3response.Body);
  // The following does, however, work:
  //    const obj = { hello: 'world' };
  //    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
  //    console.log("tryBlob(): obj and blob defined.");
  //    console.log("typeof blob: ", typeof blob);
  // In any event, Response.text() successfully gets the text from s3response.Body.
  // FileReader has also worked, but requires extra steps to use with async/await.
  // See this SO answer for an example of how to use FileReader with async/await: https://stackoverflow.com/a/63372663

  let s3response = {};
  let text = "";

  console.log("=== At storageGetJson().");
  console.log("=== storageGetJson(): file: ", file);

  if (await internetIsReachable() == false) {
    Alert.alert(
      "",
      "Unable to contact server.",
      [{ text: "OK", onPress: () => console.log("=== OK Pressed") }]
    );
  } else {
    s3response = await Storage.get(file, { download: true });
    console.log("=== storageGetJson(): s3response: ", JSON.stringify(s3response));

    // Thank you, MDN: https://developer.mozilla.org/en-US/docs/Web/API/Blob#extracting_data_from_a_blob
    text = await (new Response(s3response.Body)).text();
    return JSON.parse(text);

    //const reader = new FileReader();
    //reader.readAsText(s3blob.Body);

    //reader.onloadend = () => {
    //  result = reader.result;
    //  console.log("storageGetJson(): reader.onloadend");
    //  console.log("storageGetJson(): result: ", result);
    //  return result;
  }
}

export async function internetIsReachable() {
  let networkState = await NetInfo.fetch();

  return networkState.isInternetReachable;
}

export async function uploadGpsHistory() {
  console.log("=== At uploadGpsHistory().");

  await flushGpsHistoryToFile();

  // Do not send userId or any other identifying info. Add current ms to avoid potentially overwriting other files already on server.
  let gpsHistoryCloudFilename = "shared_gps/gpshistory_" + moment().valueOf().toString().slice(-6) + ".json";

  await uploadToS3AndDelete("gpshistory.json", gpsHistoryCloudFilename);
}

export async function uploadToS3AndDelete(localFilename, cloudFilename) {
  globals.log.info("At uploadToS3AndDelete().");
  let localFileInfo = await getFileInfo(localFilename);

  if (localFileInfo.exists == true) {
    globals.log.info("localFileInfo.exists == true.");
    let content = await loadFile(localFilename);

    globals.log.info("trying await Storage.put()...");
    try {
      await Storage.put(cloudFilename, content);

      await deleteFile(localFilename);
      console.log(`=== uploadToS3AndDelete(): Storage.put() returned success. Deleting local file ${localFilename}...`);
      globals.log.info(`uploadToS3AndDelete(): Storage.put() returned success. Deleting local file ${localFilename}...`);
    } catch (err) {
      let errorMessage = "uploadToS3AndDelete(): Storage.put exception: " + localFilename + " / " + cloudFilename + " / " + content + " / " + err;
      globals.log.error(errorMessage);
      console.log("=== uploadToS3AndDelete(): ", errorMessage);
    }
  }
}

export async function uploadWaypointSubmissions() {
  console.log("=== At uploadWaypointSubmissions().");
  let waypointSubmissionCloudFilename = "waypoint_submissions/waypoint_submission_" + globals.currentUser.userId + "_" + moment().format("YYMMDDmmss") + ".json";

  await uploadToS3AndDelete("toUploadWaypointSubmissions.json", waypointSubmissionCloudFilename);
}

export async function uploadFeedback() {
  let feedbackCloudFilename = "feedback/feedback_" + globals.currentUser.userId + "_" + moment().format("YYMMDDmmss") + ".json";

  await uploadToS3AndDelete("toUploadFeedback.json", feedbackCloudFilename);
}
