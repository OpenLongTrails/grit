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

import React, { useState } from 'react';
import { SafeAreaView, Switch, Text, TextInput, View } from 'react-native';
import { getFileInfo, loadFile, writeFile } from './Utils_Files';
import { SettingsButton } from './SettingsButton';
import * as globals from './Globals';
import { styles } from './Styles';

export function SubmitWptScreen({ route, navigation }) {
  const [wptDescription, setWptDescription] = React.useState("");
  const [atWaypointNow, setAtWaypointNow] = React.useState(true);

  async function handleSaveWptDescription() {
    console.log("=== At saveWptDescription().");

    const waypointSubmission = [{
      "coords": globals.currentLocation.geometry.coordinates,
      "atWaypointNow": atWaypointNow,
      "description": wptDescription,
      "userId": globals.currentUser.userId,
      "username": globals.currentUser.username,
      "trail": globals.appSettings.selectedTrail
    }];

    // Check for existing toUploadFeedback.json. If found, apend current message to existing message(s) and write to disk.
    let allWaypointSubmissions = [...waypointSubmission];

    let toUploadWaypointSubmissionsJsonInfo = await getFileInfo("toUploadWaypointSubmissions.json");

    if (toUploadWaypointSubmissionsJsonInfo.exists == true) {
      let waypointSubmissionsFromFileData = await loadFile("toUploadWaypointSubmissions.json");
      let waypointSubmissionsFromFile = JSON.parse(waypointSubmissionsFromFileData);
      allWaypointSubmissions = [...waypointSubmissionsFromFile, ...waypointSubmission];
    }

    await writeFile("toUploadWaypointSubmissions.json", allWaypointSubmissions);

    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={{ fontSize: 15, marginTop: 0, marginBottom: 2, textAlign: 'center' }}>
        Beta Testing Version
      </Text>

      <Text style={styles.screenTitleText}>
        {"Submit a New Waypoint."}
      </Text>
      <Text style={{ marginVertical: 10, marginLeft: 5 }}>
        {"GPS Coordinates: ("}{globals.currentLocation.geometry.coordinates[1]}{", "}{globals.currentLocation.geometry.coordinates[0]}{")"}
      </Text>

      <View style={{ flexDirection: "row", justifyContent: 'space-between' }}>
        <Text style={{ marginLeft: 5, textAlignVertical: 'center' }}>Are you at the waypoint right now?</Text>

        <Switch
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={atWaypointNow ? '#f5dd4b' : '#f4f3f4'}
          onValueChange={() => setAtWaypointNow(prevValue => !prevValue)}
          value={atWaypointNow}
        />
      </View>

      <TextInput
        multiline={true}
        maxLength={1000}
        numberOfLines={4}
        onChangeText={(text) => setWptDescription(text)}
        placeholder={"Enter waypoint description here."}
        value={wptDescription}
        style={{
          margin: 12,
          borderWidth: 1,
          padding: 10,
          textAlignVertical: 'top'
        }}
      />

      <SettingsButton
        title="Save"
        onPress={handleSaveWptDescription}
      />

      <SettingsButton
        title="Cancel"
        onPress={() => handleCancelWptDescription(navigation)}
      />
    </SafeAreaView>
  );
}

function handleCancelWptDescription(navigation) {
  console.log("=== At handleCancelWptDescription().");
  navigation.goBack();
}
