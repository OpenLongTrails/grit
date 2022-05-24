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

import { useEffect } from 'react';
import { SafeAreaView, StatusBar, Platform, Text } from 'react-native';
import { Auth } from '@aws-amplify/auth';
import * as Location from 'expo-location';
import Constants from 'expo-constants';
import * as globals from './Globals';
import { ensureDirExists, getFileInfo, writeAppSettingsToDisk } from './Utils_Files';
import { loadLogger, rotateLogs } from './Utils_Logs';
import { requestLocationForegroundPermission } from './Utils_Perms';
import { styles } from './Styles';

export function StartupScreen({ navigation }) {
  useEffect(() => {
    console.log("=== At Startup useEffect().");

    (async () => {
      if (Platform.OS === 'android' && !Constants.isDevice) {
        setErrorMsg(
          'Oops, this will not work on Snack in an Android emulator. Try it on your device!'
        );
        return;
      }

      console.log("=== StartupScreen useEffect(): StatusBar.currentHeight: ", StatusBar.currentHeight);
      StatusBar.setBarStyle('dark-content', true);

      await ensureDirExists();
      await rotateLogs();
      await loadLogger();

      Auth.currentAuthenticatedUser()
        .then((data) => {
          globals.currentUser.data = data;
          globals.currentUser.username = data.username;
          globals.currentUser.userId = data.attributes.sub;
          globals.currentUser.email = data.email;
        }).catch(err => globals.log.error("Auth.currentAuthenticatedUser() returned error: ", err));

      // For testing purposes:
      // let hasLaunchedBeforeFileInfo = await getFileInfo("hasLaunchedBefore.json");
      // if (hasLaunchedBeforeFileInfo.exists == true) {
      //   await deleteFile("hasLaunchedBefore.json");
      // }

      let hasLaunchedBefore = await getFileInfo("hasLaunchedBefore.json");

      globals.log.info("globals.currentUser.data.username: ", JSON.stringify(globals.currentUser.data.username));
      globals.log.info("globals.currentUser.data.attributes: ", JSON.stringify(globals.currentUser.data.attributes));

      if (hasLaunchedBefore.exists == false) {
        navigation.navigate('FirstLaunch1');
        return;
      } else {
        console.log("=== LoadTrailScreen useEffect(): hasLaunchedBefore == true.");
      }

      let locationForegroundPerms = await Location.getForegroundPermissionsAsync();

      console.log("=== *** LoadTrailScreen useEffect(): Location.getForegroundPermissionsAsync(): ", JSON.stringify(locationForegroundPerms));

      if (locationForegroundPerms.granted == false && locationForegroundPerms.canAskAgain == true) {
        requestLocationForegroundPermission();
      }

      navigation.push('LoadTrail');
    })();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={{ fontSize: 20 }}>
        {"Loading..."}
      </Text>
    </SafeAreaView>
  );
}
