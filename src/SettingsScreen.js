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

import React, { useEffect, useState } from 'react';
import { Alert, Modal, SafeAreaView, ScrollView, Switch, Text, View } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Storage } from 'aws-amplify';
import { Auth } from '@aws-amplify/auth';
import { getFileInfo, getFileUri, getVersionsOfLocalTrailFiles, loadFile, writeAppSettingsToDisk } from './Utils_Files';
import { internetIsReachable } from './Utils_Network';
import { SettingsButton } from './SettingsButton';
import * as globals from './Globals';
import { styles } from './Styles';

export function SettingsScreen({ route, navigation }) {
  const { caller } = route.params;
  const [darkModeToggleValue, setDarkModeToggleValue] = React.useState(globals.appSettings.darkModeOn);
  const [appGpsEnabledToggleValue, setAppGpsEnabledToggleValue] = React.useState(globals.appSettings.appGpsEnabled);
  const [shareGpsWithOltToggleValue, setShareGpsWithOltToggleValue] = React.useState(globals.appSettings.shareGpsWithOlt);
  const [uploadingLogsModalVisible, setUploadingLogsModalVisible] = React.useState(false);

  useEffect(() => {
    (async () => {
      let appSettingsFileExists = await getFileInfo('appSettings.json');

      if (appSettingsFileExists.exists === false) {
        console.log("=== SettingsScreen: appSettings.json not found.");
      } else {
        // Load appSettings.json.
        let appSettingsStr = await loadFile('appSettings.json');
        globals.appSettings = JSON.parse(appSettingsStr);
      }
    });
  }, []);

  async function toggleAppGps() {
    console.log("=== At toggleAppGps().");

    globals.appSettings.appGpsEnabled = !globals.appSettings.appGpsEnabled;
    setAppGpsEnabledToggleValue(globals.appSettings.appGpsEnabled);

    console.log("=== toggleAppGps(): globals.appSettings.appGpsEnabled values after update: ", globals.appSettings.appGpsEnabled);

    await writeAppSettingsToDisk();
  }

  async function toggleShareGpsWithOlt() {
    console.log("=== At toggleShareGpsWithOlt().");

    globals.appSettings.shareGpsWithOlt = !globals.appSettings.shareGpsWithOlt;
    setShareGpsWithOltToggleValue(globals.appSettings.shareGpsWithOlt);

    await writeAppSettingsToDisk();
  }

  async function sendDebugLogs() {
    console.log("=== At sendDebugLogs().");

    if (await internetIsReachable() == false) {
      Alert.alert(
        "",
        "Unable to contact server.",
        [{ text: "OK", onPress: () => console.log("=== OK Pressed") }]
      );
    } else {
      setUploadingLogsModalVisible(true);

      let listingLogs = await FileSystem.readDirectoryAsync(getFileUri("logs"));

      for (const filename of listingLogs) {
        let fileContents = await loadFile("logs/" + filename);

        try {
          let logsCloudFilename = "shared_logs/" + globals.currentUser.userId + filename;

          await Storage.put(logsCloudFilename, fileContents);
        } catch (err) {
          globals.log.error("sendDebugLogs(): Storage.put() returned error: ", logsCloudFilename + " / " + err);
        }
      }
      setUploadingLogsModalVisible(false);

      (async () => {
        Alert.alert(
          "",
          "Thank you!",
          [{ text: "OK", onPress: () => console.log("=== OK Pressed") }]
        );
      })();
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={{ fontSize: 15, marginTop: 0, marginBottom: 2, textAlign: 'center' }}>
          Beta Testing Version
        </Text>

        <Text style={styles.screenTitleText}>
          {"Settings"}
        </Text>

        <View style={{ flexDirection: "row", justifyContent: 'space-between' }}>
          <Text style={{ textAlignVertical: 'center', fontSize: 17 }}>

            {"Enable app use of GPS"}
          </Text>

          <Switch
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={globals.appSettings.appGpsEnabled ? '#f5dd4b' : '#f4f3f4'}
            onValueChange={toggleAppGps}
            value={appGpsEnabledToggleValue}
          />
        </View>

        <View style={{ flexDirection: "row", justifyContent: 'space-between' }}>
          <Text style={{ textAlignVertical: 'center', fontSize: 17 }}>
            {"Share anonymous GPS data with OpenLongTrails"}
          </Text>

          <Switch
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={shareGpsWithOltToggleValue ? '#f5dd4b' : '#f4f3f4'}
            onValueChange={toggleShareGpsWithOlt}
            value={shareGpsWithOltToggleValue}
          />
        </View>

        <SettingsButton
          title="Open a different trail"
          onPress={() => loadDifferentTrail(navigation)}
        />

        <SettingsButton
          title="Sign Out"
          onPress={() => signOut()}
        />

        <SettingsButton
          title="Announcements"
          onPress={() => handleAnnouncements(navigation)}
        />

        <SettingsButton
          title="About"
          onPress={() => handleAbout(navigation)}
        />

        <SettingsButton
          title="Send debug logs to OpenLongTrails"
          onPress={sendDebugLogs}
        />

        <SettingsButton
          title="Show data file versions"
          onPress={() => handleShowDataFileVersions(caller)}
        />

        {uploadingLogsModalVisible && <View style={styles.centeredView}>
          <Modal
            animationType="none"
            transparent={true}
            visible={uploadingLogsModalVisible}
            onRequestClose={() => {
              console.log("=== Closing modal.");
              setSyncingModalVisible(prevValue => !prevValue);
            }}>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <Text style={styles.modalText}>Uploading logs...</Text>
                {/*
                <Pressable
                  style={[styles.button, styles.buttonClose]}
                  onPress={() => setDownloadingModalVisible(!downloadingModalVisible)}>
                  <Text style={styles.textStyle}>Hide Modal</Text>
                </Pressable>
                */}
              </View>
            </View>
          </Modal>
        </View>}
      </ScrollView>
    </SafeAreaView>
  );
}

async function signOut() {
  try {
    await Auth.signOut();
  } catch (error) {
    globals.log.error(" Error signing out: ", error);
    console.log('=== error signing out: ', error);
  }
}

async function handleShowDataFileVersions(caller) {
  let versions = await getVersionsOfLocalTrailFiles(globals.appSettings.selectedTrail);
  let showVersions;

  console.log("=== At handleShowDataFileVersions().");

  if (caller === "trailSelectionScreen") {
    showVersions = `Trails: ${versions.trails}\nAbout: ${versions.about}`;
  } else if (caller === "homeScreen") {
    showVersions = `Trails: ${versions.trails}\nAbout: ${versions.about}\nBuffers: ${versions.buffers}\nMilepoints: ${versions.milepoints}\nTracks: ${versions.tracks}\nWaypoints: ${versions.waypoints}`;
  }

  Alert.alert(
    "Local File Version Data",
    showVersions,
    [{ text: "OK", onPress: () => console.log("=== OK Pressed") }]
  );
}

function loadDifferentTrail(navigation) {
  console.log("=== At loadDifferentTrail().");
  navigation.push('TrailSelection');
}

function handleAnnouncements(navigation) {
  navigation.navigate("Announcements");
}

function handleAbout(navigation) {
  navigation.navigate('About');
}
