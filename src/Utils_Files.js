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

import * as FileSystem from 'expo-file-system';
import * as globals from './Globals';
globals.appDataPath = FileSystem.documentDirectory + globals.appDataDir;

export async function getAboutFileVersion() {
  let aboutFileVersion = -1;

  let aboutFileInfo = await getFileInfo("about.json");

  if (aboutFileInfo.exists == true) {
    let aboutFileData = await loadFile("about.json");
    let aboutFile = JSON.parse(aboutFileData);
    aboutFileVersion = aboutFile["oltFileVersion"];
  }

  console.log("=== getAboutFileVersion(): aboutFileVersion: ", aboutFileVersion);
  return aboutFileVersion;
}

export async function getVersionsOfLocalTrailFiles(trailId) {
  console.log("=== At getVersionOfLocalTrailFiles(). trailId: ", trailId);

  let trailFileVersions = {
    "buffers": -1,
    "milepoints": -1,
    "tracks": -1,
    "waypoints": -1,
    "trails": -1,
    "about": -1
  };

  trailFileVersions.trails = await getOltVersionOfFile('trails.json');
  trailFileVersions.about = await getOltVersionOfFile('about.json');

  if (trailId !== '') {
    trailFileVersions.buffers = await getOltVersionOfFile(trailId + '/buffers.geojson');
    trailFileVersions.milepoints = await getOltVersionOfFile(trailId + '/milepoints.geojson');
    trailFileVersions.tracks = await getOltVersionOfFile(trailId + '/tracks.geojson');
    trailFileVersions.waypoints = await getOltVersionOfFile(trailId + '/waypoints.geojson');
  }

  console.log("=== getVersionsOfLocalTrailFiles(): trailFileVersions: ", JSON.stringify(trailFileVersions));

  return trailFileVersions;
}

export async function getOltVersionOfFile(filename) {
  let oltVersion;
  let fileInfo = await getFileInfo(filename);

  console.log("=== At getOltVersionOfFile().");

  if (fileInfo.exists == true) {
    let fileData = await loadFile(filename);
    let file = JSON.parse(fileData);
    oltVersion = file.oltFileVersion;
  } else {
    oltVersion = -1;
  }

  return oltVersion;
}

export async function getVersionsOfCurrentlyLoadedTrail() {
  console.log("=== At getVersionsOfCurrentlyLoadedTrail().");

  let trailFileVersions = {
    "trails": -1,
    "buffers": -1,
    "milepoints": -1,
    "tracks": -1,
    "waypoints": -1,
    "about": -1
  };

  console.log("=== getVersionsOfCurrentlyLoadedTrail(): Checking globals.trailsJson...");
  await loadTrailsJsonFromFile();
  if (globals.trailsJson !== "empty") {
    console.log("===    globals.trailsJson !== 'empty'. globals.trailsJson['oltFileVersion']: ", globals.trailsJson["oltFileVersion"]);
    trailFileVersions["trails"] = globals.trailsJson["oltFileVersion"];
  } else {
    console.log("===    globals.trailsJson === 'empty'. trailFileVersions['trails'] == -1.");
  }

  console.log("=== getVersionsOfCurrentlyLoadedTrail(): Checking about.json...");
  trailFileVersions["about"] = await getAboutFileVersion();

  console.log("=== getVersionsOfCurrentlyLoadedTrail(): Checking buffers...");
  if (globals.buffers !== "empty") {
    console.log("===    globals.buffers !== 'empty'. globals.buffers['oltFileVersion']: ", globals.buffers["oltFileVersion"]);
    trailFileVersions["buffers"] = globals.buffers["oltFileVersion"];
  } else {
    console.log("===    globals.buffers === 'empty'. trailFileVersions['buffers'] == -1.");
  }

  console.log("=== getVersionsOfCurrentlyLoadedTrail(): Checking milepoints...");
  if (globals.nobo_mileages !== "empty") {
    console.log("===    globals.nobo_mileages !== 'empty'. globals.nobo_mileages['oltFileVersion']: ", globals.nobo_mileages["oltFileVersion"]);
    trailFileVersions["milepoints"] = globals.nobo_mileages["oltFileVersion"];
  } else {
    console.log("===    globals.nobo_mileages === 'empty'. trailFileVersions['milepoints'] == -1.");
  }

  console.log("=== getVersionsOfCurrentlyLoadedTrail(): Checking tracks...");
  if (globals.tracks !== "empty") {
    console.log("===    globals.tracks !== 'empty'. globals.tracks['oltFileVersion']: ", globals.tracks["oltFileVersion"]);
    trailFileVersions["tracks"] = globals.tracks["oltFileVersion"];
  } else {
    console.log("===    globals.tracks === 'empty'. trailFileVersions['tracks'] == -1.");
  }

  console.log("=== getVersionsOfCurrentlyLoadedTrail(): Checking waypoints...");
  if (globals.initialWaypoints !== "empty") {
    console.log("===    globals.initialWaypoints !== 'empty'. globals.initialWaypoints['oltFileVersion']: ", globals.initialWaypoints["oltFileVersion"]);
    trailFileVersions["waypoints"] = globals.initialWaypoints["oltFileVersion"];
  } else {
    console.log("===    globals.initialWaypoints === 'empty'. trailFileVersions['waypoints'] == -1.");
  }

  console.log("=== getVersionsOfCurrentlyLoadedTrail(): trailFileVersions.trails: ", trailFileVersions.trails);
  return trailFileVersions;
}

export async function getPolicyDocumentsVersions() {
  let termsOfServiceFileVersion = -1;
  let privacyPolicyFileVersion = -1;

  let termsOfServiceFileInfo = await getFileInfo("termsOfService.json");
  let privacyPolicyFileInfo = await getFileInfo("privacyPolicy.json");

  if (termsOfServiceFileInfo.exists == true) {
    let termsOfServiceFileData = await loadFile("termsOfService.json");
    let termsOfServiceFile = JSON.parse(termsOfServiceFileData);
    termsOfServiceFileVersion = termsOfServiceFile["oltFileVersion"];
  }

  if (privacyPolicyFileInfo.exists == true) {
    let privacyPolicyFileData = await loadFile("privacyPolicy.json");
    let privacyPolicyFile = JSON.parse(privacyPolicyFileData);
    privacyPolicyFileVersion = privacyPolicyFile["oltFileVersion"];
  }

  console.log("=== getPolicydocumentsVersions(): termsOfServiceFileVersion: ", termsOfServiceFileVersion);
  console.log("=== getPolicydocumentsVersions(): privacyPolicyFileVersion: ", privacyPolicyFileVersion);

  return {
    localTermsOfServiceJsonVersion: termsOfServiceFileVersion,
    localPrivacyPolicyJsonVersion: privacyPolicyFileVersion
  };
}

export async function loadTrailsJsonFromFile() {
  console.log("=== At loadTrailsJsonFromFile().");

  console.log("=== loadTrailsJsonFromFile(): calling loadFile('trails.json')...");
  let trailsJsonData = await loadFile('trails.json');

  globals.trailsJson = JSON.parse(trailsJsonData);
}

export async function isTrailDownloaded(trailId) {
  console.log("=== At isTrailDownloaded(). trailId === ", trailId);

  // TODO: Change this to a Promise.all().

  let directory = await getFileInfo(trailId);
  console.log("=== isTrailDownloaded(): directory: ", JSON.stringify(directory));
  if (directory.exists == false) { return false; }

  let buffersFileInfo = await getFileInfo(trailId + "/buffers.geojson");
  console.log("=== isTrailDownloaded(): buffers: ", JSON.stringify(buffersFileInfo));
  if (buffersFileInfo.exists == false) { return false; }

  let milepointsFileInfo = await getFileInfo(trailId + "/milepoints.geojson");
  console.log("=== isTrailDownloaded(): milepoints: ", JSON.stringify(milepointsFileInfo));
  if (milepointsFileInfo.exists == false) { return false; }

  let tracksFileInfo = await getFileInfo(trailId + "/tracks.geojson");
  console.log("=== isTrailDownloaded(): tracks: ", JSON.stringify(tracksFileInfo));
  if (tracksFileInfo.exists == false) { return false; }

  let wptsFileInfo = await getFileInfo(trailId + "/waypoints.geojson");
  console.log("=== isTrailDownloaded(): wpts: ", JSON.stringify(wptsFileInfo));
  if (wptsFileInfo.exists == false) { return false; }

  return true;
}

export async function loadTrailData() {
  console.log("=== At loadTrailData().");
  console.log("=== loadTrailData(): globals.appSettings.selectedTrail: '" + globals.appSettings.selectedTrail + "'");

  console.log("=== loadTrailData(): calling loadFile(trailId/waypoints.geojson)...");
  let data = await loadFile(globals.appSettings.selectedTrail + "/waypoints.geojson")

  console.log("=== loadTrailData(): setting globals.initialWaypoints: ", data.substring(0, 100));
  globals.initialWaypoints = JSON.parse(data);

  console.log("=== loadTrailData(): calling loadFile(trailId/milepoints.geojson)...");
  let milepointData = await loadFile(globals.appSettings.selectedTrail + "/milepoints.geojson");

  console.log("=== loadTrailData(): milepointData: ", milepointData.substring(0, 100));
  console.log("=== loadTrailData(): globals.nobo_mileages = JSON.parse(milepointData)");
  globals.nobo_mileages = JSON.parse(milepointData);

  console.log("=== loadTrailData(): calling loadFile(trailId/tracks.geojson)...");
  let tracksData = await loadFile(globals.appSettings.selectedTrail + "/tracks.geojson");
  console.log("=== loadTrailData(): tracksData: ", tracksData.substring(0, 100));
  globals.tracks = JSON.parse(tracksData);
  console.log("=== loadTrailData(): globals.tracks.features.length: ", globals.tracks.features.length);

  console.log("=== loadTrailData(): calling loadFile(trailId/buffers.geojson)...");
  let buffersData = await loadFile(globals.appSettings.selectedTrail + "/buffers.geojson");
  console.log("=== loadTrailData(): buffersData: ", buffersData.substring(0, 100));
  globals.buffers = JSON.parse(buffersData);
  console.log("=== loadTrailData(): globals.buffers.features.length: ", globals.buffers.features.length);

  console.log("=== loadTrailData(): exiting loadTrail()...");
}

export async function flushGpsHistoryToFile() {
  let fullGpsHistory = [...globals.gpsHistory];

  // If there's already a gpshistory.json, load it and append the current data to it.
  let gpsHistoryFileInfo = await getFileInfo("gpshistory.json");

  // Expo FileSystem does not appear to have a way to append to a text file?
  if (gpsHistoryFileInfo.exists == true) {
    let gpsHistoryFromFileData = await loadFile("gpshistory.json");
    let gpsHistoryFromFile = JSON.parse(gpsHistoryFromFileData);
    fullGpsHistory = [...gpsHistoryFromFile, ...globals.gpsHistory];
  }

  await writeFile("gpshistory.json", fullGpsHistory);

  globals.gpsHistory = [];

  return fullGpsHistory;
}

// Also works for directories.
export const getFileInfo = async (filename) => {
  let fullFilename = getFileUri(filename);
  let fileInfo = {};

  try {
    fileInfo = await FileSystem.getInfoAsync(fullFilename);
  } catch (err) {
    globals.log.error("getFileInfo(): FileSystem.getInfoAsync() returned error: ", fullFilename + " / " + err);
  }

  return (fileInfo);
}

export const loadFile = async (filename) => {
  let fileContents = {};

  try {
    fileContents = await FileSystem.readAsStringAsync(getFileUri(filename));
  } catch (err) {
    globals.log.error("loadFile(): FileSystem.readAsStringAsync() returned error: ", getFileUri(filename) + " / " + err);
  }
  return (fileContents);
}

export const writeFile = async (filename, contents) => {
  try {
    await FileSystem.writeAsStringAsync(getFileUri(filename), JSON.stringify(contents));
  } catch (err) {
    globals.log.error("writeFile() FileSystem.writeAsStringAsync() returned error: ", filename + " / " + JSON.stringify(contents) + " / " + err);
  }
}

export const deleteFile = async (filename) => {
  console.log("=== deleteFile(): deleting file: " + filename);
  try {
    await FileSystem.deleteAsync(getFileUri(filename));
  } catch (err) {
    globals.log.error("deleteFile(): FileSystem.deleteAsync() returned error: ", filename + " / " + err);
  }
}

// Also works for directories.
export const getFileUri = (filename) => globals.appDataPath + filename;

export async function ensureDirExists() {
  const dirInfo = await FileSystem.getInfoAsync(globals.appDataPath);
  const logDirInfo = await FileSystem.getInfoAsync(globals.appDataPath + "logs/");

  if (!dirInfo.exists) {
    console.log("=== App directory doesn't exist, creating...");
    await FileSystem.makeDirectoryAsync(globals.appDataPath, { intermediates: true });
  }

  if (!logDirInfo.exists) {
    console.log("=== App log directory doesn't exist, creating...");
    await FileSystem.makeDirectoryAsync(globals.appDataPath + "logs/", { intermediates: true });
  }
}

export async function writeAppSettingsToDisk() {
  try {
    console.log("=== writeAppSettingsToDisk(): writing settings to file...");

    let writeFileResult = await writeFile("appSettings.json", globals.appSettings);
  } catch (err) { console.log('=== error in writeAppSettingsToDisk(): ', err) }
}
