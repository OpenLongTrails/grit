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
import { SafeAreaView, Text } from 'react-native';
import { getFileInfo, isTrailDownloaded, loadFile, loadTrailData, writeAppSettingsToDisk } from './Utils_Files';
import * as globals from './Globals';
import { styles } from './Styles';

export function LoadTrailScreen({ navigation }) {
  useEffect(() => {
    (async () => {
      await loadAppSettings(navigation);
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

async function loadAppSettings(navigation) {
  console.log("=== At loadAppSettings().");

  // console.log("loadAppSettings(): debug: Deleting appSettings.json...");
  // let appSettingsInfo = await getFileInfo("appSettings.json");
  // if (appSettingsInfo.exists == true) {
  //   await deleteFile("appSettings.json");
  // }

  // console.log("loadAppSettings(): debug: Setting appSettings = {}.");
  // globals.appSettings = {};

  let appSettingsFileExists = await getFileInfo('appSettings.json');

  if (appSettingsFileExists.exists === false) {
    console.log("=== loadAppSettings(): appSettings.json not found.");
    console.log("=== loadAppSettings(): creating appSettings.json...");

    await writeAppSettingsToDisk();

    // Since appSettings was just written, we know that user has not set selectedTrail, so load TrailSelection.
    navigation.navigate('TrailSelection');
  } else {
    console.log("=== loadAppSettings(): appSettings.json found, attempting to load settings...");

    let appSettingsData = await loadFile('appSettings.json');
    globals.appSettings = JSON.parse(appSettingsData);

    console.log("=== loadAppSettings(): globals.appSettings.selectedTrail: ", globals.appSettings.selectedTrail);

    if (globals.appSettings.selectedTrail === "") {
      console.log("=== loadAppSettings(): globals.appSettings.selectedTrail === '', loading TrailSelectionScreen...");

      navigation.navigate('TrailSelection');
    } else {
      // Verify that the trail has been downloaded before calling loadTrail().
      console.log("=== loadAppSettings(): globals.appSettings.selectedTrail !== ''. Calling isTrailDownloaded('" + globals.appSettings.selectedTrail + "')...");
      let trailIsDownloaded = await isTrailDownloaded(globals.appSettings.selectedTrail);

      if (trailIsDownloaded == true) {
        console.log("=== loadAppSettings(): isTrailDownloaded() returned true. Calling loadTrailData()...");

        await loadTrailData();

        console.log("=== loadAppSettings(): Back from loadTrailData().");

        console.log("=== loadAppSettings(): Setting globals.pauseGps = false.");
        globals.pauseGps = false;

        console.log("=== loadAppSettings(): Calling navigation.navigate('Home') with globals.appSettings.selectedTrail: ", globals.appSettings.selectedTrail);
        navigation.navigate('Home', { trailId: globals.appSettings.selectedTrail });
      } else {
        console.log("=== loadAppSettings(): isTrailDownloaded() returned false. Loading TrailSelectionScreen...");

        navigation.push('TrailSelection');
      }
    }
  }
}
