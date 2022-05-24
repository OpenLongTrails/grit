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

import * as Location from 'expo-location';
import * as globals from './Globals';
import { writeAppSettingsToDisk } from './Utils_Files';

export async function requestLocationForegroundPermission() {
  let status = await Location.requestForegroundPermissionsAsync();

  if (status.granted == true) {
    globals.appSettings.appGpsEnabled = true;
  }

  await writeAppSettingsToDisk();

  console.log("=== requestLocationForegroundPermission(): status: ", JSON.stringify(status));
  /*
  if (status !== 'granted') {
    setErrorMsg('Permission to access location was denied');
    return;
  }
  */
}
