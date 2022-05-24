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

import { useEffect, useState } from 'react';
import { Alert, Modal, SafeAreaView, ScrollView, Text, View } from 'react-native';
import * as Linking from 'expo-linking';
import { deleteFile, isTrailDownloaded, writeAppSettingsToDisk } from './Utils_Files';
import { downloadTrail } from './Utils_Network';
import { SettingsButton } from './SettingsButton';
import * as globals from './Globals';
import { styles } from './Styles';

export function TrailInfoScreen({ route, navigation }) {
  const [downloadFirstModalVisible, setDownloadFirstModalVisible] = useState(false);
  const [downloadingModalVisible, setDownloadingModalVisible] = useState(false);
  const [deletingModalVisible, setDeletingModalVisible] = useState(false);
  const [trailIsDownloadedText, setTrailIsDownloadedText] = useState("Loading...");

  const { trailData } = route.params;

  console.log("=== TrailInfoScreen: trailData: ", JSON.stringify(trailData));

  useEffect(() => {
    (async () => {
      await updateIsTrailDownloaded();
    })();
  }, []);

  async function handleDeleteTrail() {
    console.log("=== At deleteTrail().");

    console.log("=== deleteTrail(): calling isTrailDownloaded()...");
    let result = await isTrailDownloaded(trailData.trailId);

    if (result == true) {
      setDeletingModalVisible(true);

      console.log("=== deleteTrail(): isTrailDownloaded==true.");
      console.log("=== deleteTrail(): Resetting variables...");

      // Temporary kludge. Prevent GPS updates for globals.appSettings.selectedTrail while trail data files do not exist.
      globals.pauseGps = true;

      globals.initialWaypoints = "empty";
      globals.nobo_mileages = "empty";
      globals.tracks = "empty";
      globals.buffers = "empty";

      console.log("=== deleteTrail(): deleting tracks, buffers, waypoints, milepoints, directory...");

      await deleteFile(trailData.trailId + "/tracks.geojson");
      await deleteFile(trailData.trailId + "/buffers.geojson");
      await deleteFile(trailData.trailId + "/waypoints.geojson");
      await deleteFile(trailData.trailId + "/milepoints.geojson");
      await deleteFile(trailData.trailId);

      await updateIsTrailDownloaded();

      setDeletingModalVisible(false);

      Alert.alert(
        "",
        "Trail deleted.",
        [{ text: "OK", onPress: () => console.log("=== OK Pressed") }]
      );
    } else {
      console.log("=== deleteTrail(): isTrailDownloaded() == false.");
      Alert.alert(
        "",
        "Trail deleted.",
        [{ text: "OK", onPress: () => console.log("=== OK Pressed") }]
      );
    }
  }

  async function handleDownloadTrail() {
    console.log("=== At handleDownloadTrail().");

    setDownloadingModalVisible(true);
    console.log("=== handleDownloadTrail(): calling downloadTrail(trailData). trailData: ", JSON.stringify(trailData));
    await downloadTrail(trailData);
    setDownloadingModalVisible(false);

    await updateIsTrailDownloaded();
  }

  async function updateIsTrailDownloaded() {
    console.log("=== updateIsTrailDownloaded(): Calling isTrailDownloaded() with trailData.trailId: ", trailData.trailId);
    let trailIsDownloaded = await isTrailDownloaded(trailData.trailId);

    if (trailIsDownloaded == true) {
      setTrailIsDownloadedText("Trail is downloaded.");
    } else if (trailIsDownloaded == false) {
      setTrailIsDownloadedText("Trail is not downloaded.");
    }

    return trailIsDownloaded;
  }

  async function handleOpenTrail() {
    console.log("=== At handleOpenTrail().");

    if (await updateIsTrailDownloaded() == false) {
      console.log("=== openTrail(): isTrailDownloaded() == false.");

      Alert.alert(
        "",
        "Trail must be downloaded prior to opening.",
        [{ text: "OK", onPress: () => console.log("=== OK Pressed") }]
      );
    } else {
      // To reach this code, isTrailDownloaded == true.
      console.log("=== handleOpenTrail(): isTrailDownloaded() == true.");

      globals.appSettings.selectedTrail = trailData.trailId;
      globals.appSettings.selectedTrailDisplayName = trailData.trailDisplayName;

      await writeAppSettingsToDisk();

      console.log("=== handleOpenTrail(): navigation.navigate('LoadTrail')...");
      navigation.push('LoadTrail');
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={{ fontSize: 15, marginTop: 0, marginBottom: 2, textAlign: 'center' }}>
          Beta Testing Version
        </Text>

        <Text style={styles.screenTitleText}>{trailData.trailDisplayName}</Text>
        <Text style={{ fontSize: 16, marginBottom: 15, marginTop: 5, textAlign: 'center' }}>{trailIsDownloadedText}</Text>
        <Text style={{ marginHorizontal: 5 }}>{trailData.trailDescription}{"\n\n"}</Text>

        <SettingsButton
          title="Open this Trail"
          onPress={handleOpenTrail}
        />

        <SettingsButton
          title="Download this Trail"
          onPress={handleDownloadTrail}
        />

        <SettingsButton
          title="Download map data from grit.OpenLongTrails.org"
          onPress={() => handleGetMapData()}
        />

        <SettingsButton
          title="Delete this Trail"
          onPress={handleDeleteTrail}
        />

        <SettingsButton
          title="Back to Trails List"
          onPress={() => navigation.goBack()}
        />

        <View style={styles.centeredView}>
          <Modal
            animationType="none"
            transparent={true}
            visible={downloadingModalVisible}
            onRequestClose={() => {
              //Alert.alert('Modal has been closed.');
              console.log("=== Closing modal.");
              setDownloadingModalVisible(!downloadingModalVisible);
            }}>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <Text style={styles.modalText}>Downloading...</Text>
              </View>
            </View>
          </Modal>
        </View>
        <View style={styles.centeredView}>
          <Modal
            animationType="none"
            transparent={true}
            visible={deletingModalVisible}
            onRequestClose={() => {
              console.log("=== Closing modal.");
              setDeletingModalVisible(prevValue => !prevValue);
            }}>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <Text style={styles.modalText}>Deleting...</Text>
              </View>
            </View>
          </Modal>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

async function handleGetMapData() {
  Linking.openURL('https://grit.openlongtrails.org');
}


