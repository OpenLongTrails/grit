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

import { Alert, SafeAreaView, Text } from 'react-native';
import { getFileInfo, loadFile } from './Utils_Files';
import { SettingsButton } from './SettingsButton';
import { styles } from './Styles';

export function AboutScreen({ route, navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={{ fontSize: 15, marginTop: 0, marginBottom: 2, textAlign: 'center' }}>
        Beta Testing Version
      </Text>

      <SettingsButton
        title="About"
        onPress={() => handleAbout(navigation)}
      />

      <SettingsButton
        title="Terms of Service"
        onPress={() => handleTermsOfService(navigation)}
      />

      <SettingsButton
        title="Privacy Policy"
        onPress={() => handlePrivacyPolicy(navigation)}
      />
    </SafeAreaView>
  );
}

async function handleAbout(navigation) {
  let aboutFileInfo = await getFileInfo("about.json");

  if (aboutFileInfo.exists == true) {
    let aboutFileData = await loadFile('about.json');
    let aboutFile = JSON.parse(aboutFileData);
    console.log("=== handleAbout(): aboutFile.text: ", aboutFile.text);

    console.log("=== handleAbout(): navigation.push('ShowText', {showText: aboutFile['text']})");
    navigation.push('ShowText', { showText: aboutFile });
  } else {
    Alert.alert(
      "",
      "About file not found. Please sync and try again.",
      [{ text: "OK", onPress: () => console.log("=== OK Pressed") }]
    );
  }
}

async function handleTermsOfService(navigation) {
  let termsOfServiceFileInfo = await getFileInfo("termsOfService.json");

  if (termsOfServiceFileInfo.exists == true) {
    let termsOfServiceFileData = await loadFile('termsOfService.json');
    let termsOfServiceFile = JSON.parse(termsOfServiceFileData);

    navigation.push('ShowText', { showText: termsOfServiceFile });
  } else {
    Alert.alert(
      "",
      "Terms of Service file not found. Please sync and try again, or view the file at grit.OpenLongTrails.org/about/terms-of-service.html.",
      [{ text: "OK", onPress: () => console.log("=== OK Pressed") }]
    );
  }
}

async function handlePrivacyPolicy(navigation) {
  let privacyPolicyFileInfo = await getFileInfo("privacyPolicy.json");

  if (privacyPolicyFileInfo.exists == true) {
    let privacyPolicyFileData = await loadFile('privacyPolicy.json');
    let privacyPolicyFile = JSON.parse(privacyPolicyFileData);

    navigation.push('ShowText', { showText: privacyPolicyFile });
  } else {
    Alert.alert(
      "",
      "Privacy Policy file not found. Please sync and try again, or view the file at grit.OpenLongTrails.org/about/privacy-policy.html.",
      [{ text: "OK", onPress: () => console.log("=== OK Pressed") }]
    );
  }
}
