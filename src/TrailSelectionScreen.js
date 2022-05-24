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
import { Alert, Button, FlatList, Modal, SafeAreaView, Text, TouchableHighlight, View } from 'react-native';
import { getFileInfo, loadTrailsJsonFromFile } from './Utils_Files';
import { loadComments, syncCommentsWithCloud } from './Utils_Comments';
import { downloadTrailsJson, internetIsReachable, updateAboutJson, updatePolicyDocuments } from './Utils_Network';
import * as globals from './Globals';
import { styles } from './Styles';

export function TrailSelectionScreen({ route, navigation }) {
  const [listOfTrails, setListOfTrails] = React.useState({});
  const [syncingModalVisible, setSyncingModalVisible] = React.useState(false);

  useEffect(() => {
    console.log("=== At TrailSelectionScreen: useEffect().");

    (async () => {
      console.log("=== TrailSelectScreen useEffect(async()): Attempting to load trails.json...");

      let trailsJsonFileExists = await getFileInfo('trails.json');

      console.log("=== TrailSelectionScreen useEffect(): trailJsonFileExists: ", JSON.stringify(trailsJsonFileExists));

      if (trailsJsonFileExists.exists === false) {
        console.log("=== TrailSelectionScreen: trails.json not found. downloading...");

        if (await internetIsReachable() == false) {
          Alert.alert(
            "",
            "Unable to contact server.",
            [{ text: "OK", onPress: () => console.log("=== OK Pressed") }]
          );
        } else {
          await downloadTrailsJson();
        }
      }

      // TODO: It's still possible to reach this code w/o a local copy of trails.json.
      console.log("=== TrailSelectionScreen: useEffect(): calling loadTrailsJsonFromFile().");

      await loadTrailsJsonFromFile();

      console.log("=== TrailSelection useEffect(): setListOfTrails(globals.trailsJson).");
      setListOfTrails(globals.trailsJson);

      await loadComments();
    })();
  }, []);

  async function handleSync() {
    if (await internetIsReachable() == false) {
      Alert.alert(
        "",
        "Unable to contact server.",
        [{ text: "OK", onPress: () => console.log("=== OK Pressed") }]
      );
    } else {
      setSyncingModalVisible(true);

      console.log("=== handleSync(): calling downloadTrailsJson()...");
      let result = await downloadTrailsJson();

      console.log("=== handleSync(): calling loadTrailsJsonFromFile()...");
      result = await loadTrailsJsonFromFile();

      setListOfTrails(globals.trailsJson);

      await updateAboutJson();
      await updatePolicyDocuments();

      console.log("=== handleSync(): Calling syncCommentsWithCloud()...");
      await syncCommentsWithCloud();

      setSyncingModalVisible(false);
    }
  }

  const renderItem = ({ item }) => {
    return (
      <TouchableHighlight
        style={styles.trailSelectionListItem}
        onPress={async () => {
          navigation.push('TrailInfo', {
            "trailData": item
          });
        }}>
        <View style={{ padding: 5, marginVertical: 10, marginHorizontal: 16 }}>
          <Text style={{ fontSize: 18, color: "white" }}>{item.trailDisplayName}</Text>
        </View>
      </TouchableHighlight>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={{ fontSize: 15, marginTop: 0, marginBottom: 2, textAlign: 'center' }}>
        Beta Testing Version
      </Text>

      <Text style={styles.screenTitleText}>
        {"Select a Trail"}
      </Text>

      <View style={{ flexDirection: "row", marginLeft: 5, justifyContent: 'space-evenly' }}>
        <Button
          title="Sync Trails List"
          onPress={handleSync}
        />

        <Button
          title="Settings"
          onPress={() => handleSettings(navigation)}
        />

        <Button
          title="Announcements"
          onPress={() => handleAnnouncements(navigation)}
        />
      </View>

      <FlatList
        data={listOfTrails.trails}
        renderItem={renderItem}
        keyExtractor={(item) => item.trailId}
      />

      <View style={styles.centeredView}>
        <Modal
          animationType="none"
          transparent={true}
          visible={syncingModalVisible}
          onRequestClose={() => {
            console.log("=== Closing modal.");
            setSyncingModalVisible(prevValue => !prevValue);
          }}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>Syncing...</Text>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

function handleSettings(navigation) {
  console.log("=== At handleSettings().");
  navigation.navigate('Settings', { caller: "trailSelectionScreen" });
}

function handleAnnouncements(navigation) {
  console.log("=== At handleAnnouncements().");

  navigation.navigate('Announcements');
}
