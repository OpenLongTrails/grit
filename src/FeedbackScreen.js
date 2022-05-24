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
import { SafeAreaView, Text, TextInput } from 'react-native';
import { getFileInfo, loadFile, writeFile } from './Utils_Files';
import { SettingsButton } from './SettingsButton';
import moment from 'moment';
import * as globals from './Globals';
import { styles } from './Styles';

export function FeedbackScreen({ route, navigation }) {
  const [userEmail, setUserEmail] = React.useState("");
  const [feedbackText, setFeedbackText] = React.useState("");

  async function sendFeedback() {
    console.log("=== At sendFeedback().");

    if (feedbackText === "") {
      console.log("=== sendFeedback(): feedbackText == '', cancelling...");
      return;
    }

    let feedbackMessage = [{
      "timestamp": moment(),
      "userId": globals.currentUser.userId,
      "username": globals.currentUser.username,
      "user-provided-email": userEmail,
      "message": feedbackText
    }]

    // Check for existing toUploadFeedback.json. If found, apend current message to existing message(s) and write to disk.
    let allFeedback = [...feedbackMessage];

    let feedbackJsonInfo = await getFileInfo("toUploadFeedback.json");

    if (feedbackJsonInfo.exists == true) {
      let feedbackFromFileData = await loadFile("toUploadFeedback.json");
      let feedbackFromFile = JSON.parse(feedbackFromFileData);
      allFeedback = [...feedbackFromFile, ...feedbackMessage];
    }

    await writeFile("toUploadFeedback.json", allFeedback);

    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={{ fontSize: 15, marginTop: 0, marginBottom: 2, textAlign: 'center' }}>
        Beta Testing Version
      </Text>

      <Text style={styles.screenTitleText}>Send Feedback</Text>

      <Text style={{ marginHorizontal: 5, marginTop: 20 }}>
        If it's alright for OpenLongTrails to contact you by email about this feedback, please enter your email address here:
      </Text>

      <TextInput
        multiline={false}
        onChangeText={(text) => setUserEmail(text)}
        placeholder={"address@email.com"}
        value={userEmail}
        style={{
          margin: 12,
          borderWidth: 1,
          padding: 10,
          textAlignVertical: 'top'
        }}
      />

      <TextInput
        multiline={true}
        maxLength={1000}
        numberOfLines={5}
        onChangeText={(text) => setFeedbackText(text)}
        placeholder={"Enter your feedback here."}
        value={feedbackText}
        style={{
          margin: 12,
          borderWidth: 1,
          padding: 10,
          textAlignVertical: 'top'
        }}
      />

      <SettingsButton
        title="Save"
        onPress={sendFeedback}
      />
    </SafeAreaView>
  );
}
