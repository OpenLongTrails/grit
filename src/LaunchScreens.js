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
import { Alert, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { SettingsButton } from './SettingsButton';
import Checkbox from 'expo-checkbox';
import { getFileInfo, loadFile, loadTrailsJsonFromFile, writeAppSettingsToDisk, writeFile } from './Utils_Files';
import { downloadTrailsJson, updatePolicyDocuments } from './Utils_Network';
import { requestLocationForegroundPermission } from './Utils_Perms';
import * as globals from './Globals';
import { styles } from './Styles';

export function FirstLaunch1Screen({ navigation }) {
  console.log("=== firstAppLaunch(): hasLaunchedBefore == false.");

  useEffect(() => {
    (async () => {
      console.log("=== At FirstLaunch1 useEffect().");

      await writeFile("hasLaunchedBefore.json", { "hasLaunchedBefore": true });

      // Download files that are used on FirstLaunch3Screen.
      console.log("=== FirstLaunch3 useEffect(): Calling downloadTrailsJson()...");
      await downloadTrailsJson();

      console.log("=== FirstLaunch3 useEffect(): Calling loadTrailsJsonFromFile()...")
      await loadTrailsJsonFromFile();

      console.log("=== FirstLaunch3 useEffect(): Calling updatePolicyDocuments()...")
      await updatePolicyDocuments();
    })();
  }, []);

  function handleButton() {
    navigation.navigate('FirstLaunch2');
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.screenTitleText}>Welcome to Grit!</Text>
        <Text style={{ fontSize: 14, textAlign: 'center' }}>Beta Testing Version</Text>
        <Text style={{ fontSize: 14, textAlign: 'center' }}>First Run Screen 1/3</Text>

        <Text style={{ fontSize: 16, marginHorizontal: 10 }}>
          {"\n"}
          Grit is a new thruhiking app from OpenLongTrails.org.{"\n\n"}

          The mission of OpenLongTrails.org is to "Create, collect, and freely distribute information about long distance nature trails around the world."{"\n\n"}

          Grit is designed to be used alongside a dedicated mapping app, such as Gaia GPS or Caltopo. Customized mapping data files (GeoJSON, GPX, etc.) for use with these apps are available for free from Grit's trail download screens. OpenLongTrails.org is not affiliated with any of these mapping apps, which may charge their own fees.{"\n\n"}

          This is version 1.00 beta of OLT Grit. While the app is in a beta testing phase, it may be less stable.{"\n\n"}

          Due to potential instability in the beta version, by using this software, you agree to not rely on it as your only means of information while hiking.{"\n\n"}

          Thank you for being a beta tester!{"\n"}
        </Text>

        <SettingsButton
          title="Continue"
          onPress={handleButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

export function FirstLaunch2Screen({ navigation }) {
  const [isChecked, setChecked] = React.useState(true);

  useEffect(() => {
    (async () => {
      console.log("=== At FirstLaunch2 useEffect().");
    })();
  }, []);

  async function handleButton() {
    console.log("=== handleButton(): Calling requestLocationForegroundPermission()...");
    await requestLocationForegroundPermission();

    globals.appSettings.shareGpsWithOlt = isChecked;
    await writeAppSettingsToDisk();
    console.log("=== handleButton(): globals.appSettings.shareGpsWithOlt: ", globals.appSettings.shareGpsWithOlt);

    navigation.navigate('FirstLaunch3');
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.screenTitleText}>App Permissions</Text>
        <Text style={{ fontSize: 14, textAlign: 'center' }}>Beta Testing Version</Text>
        <Text style={{ fontSize: 14, textAlign: 'center' }}>First Run Screen 2/3</Text>

        <Text style={{ fontSize: 16, marginHorizontal: 10 }}>
          {"\n"}
          OLT Grit uses your current GPS location to determine your position along the trail. This requires the "course" and "fine" location Android permissions.{"\n\n"}

          Optionally, you can share your anonymous GPS data with OpenLongTrails.org. This information will be used to aid in keeping the trails' routes up to date.{"\n\n"}

          OLT Grit only accesses your location while the app is active, never while it is closed or in the background.{"\n\n"}

          You can enable or disable sharing GPS data with OpenLongTrails.org from the settings screen at any time.{"\n\n"}

          OLT Grit will now request permission to access your GPS location.{"\n"}
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', marginBottom: 20 }}>
          <Checkbox
            style={{ margin: 8 }}
            value={isChecked}
            onValueChange={setChecked}
            color={isChecked ? '#4630EB' : undefined}
          />
          <Text style={{ fontSize: 16, width: "60%" }} numberOfLines={2} >Share anonymous GPS data with OpenLongTrails.org</Text>
        </View>

        <SettingsButton
          title="Continue"
          onPress={handleButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

export function FirstLaunch3Screen({ navigation }) {
  const [isChecked, setChecked] = React.useState(false);

  useEffect(() => {
    (async () => {
      console.log("=== At FirstLaunch3 useEffect().");
    })();
  }, []);

  async function handleButton() {
    if (isChecked == false) {
      Alert.alert(
        "",
        "To use the app, please indicate your acceptance of the Terms of Service and Privacy Policy by checking the box. Then press the Continue button.",
        [{ text: "OK", onPress: () => console.log("=== OK Pressed") }]
      );
    } else {
      globals.appSettings.acceptedAllPolicies = true;
      await writeAppSettingsToDisk();

      navigation.push('LoadTrail');
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.screenTitleText}>Policies</Text>
        <Text style={{ fontSize: 14, textAlign: 'center' }}>Beta Testing Version</Text>
        <Text style={{ fontSize: 14, textAlign: 'center' }}>First Run Screen 3/3</Text>

        <Text style={{ fontSize: 16, marginHorizontal: 10 }}>
          {"\n"}
          Use of OpenLongTrails Grit requires acceptance of our Terms of Service and Privacy Policy.{"\n\n"}

          Please read these documents, check the box below to indicate your acceptance, and tap the Continue button to use the app.{"\n\n"}

          Thank you!{"\n"}
        </Text>

        <SettingsButton
          title="View Terms of Service"
          onPress={() => handleViewTermsOfService(navigation)}
        />

        <SettingsButton
          title="View Privacy Policy"
          onPress={() => handleViewPrivacyPolicy(navigation)}
        />

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', marginBottom: 20, marginTop: 40 }}>
          <Checkbox
            style={{ margin: 8 }}
            value={isChecked}
            onValueChange={setChecked}
            color={isChecked ? '#4630EB' : undefined}
          />
          <Text style={{ fontSize: 16, width: "60%" }} numberOfLines={2} >I agree to the Terms of Service and Privacy Policy</Text>
        </View>

        <SettingsButton
          title="Continue"
          onPress={handleButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

async function handleViewTermsOfService(navigation) {
  let termsOfService;

  let termsOfServiceFileInfo = await getFileInfo("termsOfService.json");
  console.log("=== handleViewTermsOfService(): termsOfServiceFileInfo: ", JSON.stringify(termsOfServiceFileInfo));

  if (termsOfServiceFileInfo.exists == true) {
    termsOfService = await loadFile("termsOfService.json");
    termsOfService = JSON.parse(termsOfService);

    console.log("=== handleViewTermsOfService(): navigation.navigate('ShowText'...");
    console.log("=== handleViewTermsOfService(): termsOfService: ", JSON.stringify(termsOfService));

    navigation.navigate('ShowText', { showText: termsOfService });
  } else {
    Alert.alert(
      "",
      "Terms of Service document has not been synced to this device.\n\nPlease check your internet connection and restart the app, or access the document at https://grit.OpenLongTrails.org/about/terms-of-service.html.",
      [{ text: "OK", onPress: () => console.log("=== OK Pressed") }]
    );

  }
}

async function handleViewPrivacyPolicy(navigation) {
  let privacyPolicy;

  let privacyPolicyFileInfo = await getFileInfo("privacyPolicy.json");

  if (privacyPolicyFileInfo.exists == true) {
    privacyPolicy = await loadFile("privacyPolicy.json");
    privacyPolicy = JSON.parse(privacyPolicy);

    console.log("=== handleViewPrivacyPolicy(): navigation.navigate('ShowText'..");
    console.log("=== handleViewPrivacyPolicy(): privacyPolicy: ", JSON.stringify(privacyPolicy));

    navigation.navigate('ShowText', { showText: privacyPolicy });
  } else {
    Alert.alert(
      "",
      "The Privacy Policy document has not been synced to this device.\n\nPlease check your intenet connection and restart the app, or access the document at https://grit.OpenLongTrails.org/about/privacy-policy.html.",
      [{ text: "OK", onPress: () => console.log("=== OK Pressed") }]
    );
  }
}
