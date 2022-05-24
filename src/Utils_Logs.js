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

import { logger, fileAsyncTransport } from "react-native-logs";
import * as FileSystem from 'expo-file-system';
import * as Device from 'expo-device';
import moment from 'moment';
import * as globals from './Globals';
import { deleteFile, getFileInfo, getFileUri } from './Utils_Files';

export async function loadLogger() {
  let logFilenameDate = moment().format("YYYY-MM-DD-mm-ss");

  const config = {
    severity: "info",
    transport: fileAsyncTransport,
    transportOptions: {
      FS: FileSystem,
      fileName: `${globals.appDataDir}logs/log_${logFilenameDate}.txt`
    },
    dateFormat: "iso",
    printLevel: true,
    printDate: true,
    enabled: true,
    levels: {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    }
  };

  console.log("=== loadLogger(): Creating logger...");
  globals.log = logger.createLogger(config);

  let deviceInfo = [];

  // Log basic device info for use in diagnostics.
  deviceInfo.push({ uptime: await Device.getUptimeAsync() });
  deviceInfo.push({ isDevice: Device.isDevice });
  deviceInfo.push({ brand: Device.brand });
  deviceInfo.push({ manufacturer: Device.manufacturer });
  deviceInfo.push({ modelName: Device.modelName });
  deviceInfo.push({ modelId: Device.modelId });
  deviceInfo.push({ designName: Device.designName });
  deviceInfo.push({ productName: Device.productName });
  deviceInfo.push({ deviceYearClass: Device.deviceYearClass });
  deviceInfo.push({ totalMemory: Device.totalMemory });
  deviceInfo.push({ supportedCpuArchitectures: Device.supportedCpuArchitectures });
  deviceInfo.push({ osName: Device.osName });
  deviceInfo.push({ osVersion: Device.osVersion });
  deviceInfo.push({ osBuildId: Device.osBuildId });
  deviceInfo.push({ osInternalBuildId: Device.osInternalBuildId });
  deviceInfo.push({ platformApiLevel: Device.platformApiLevel });
  deviceInfo.push({ maxMemory: await Device.getMaxMemoryAsync() });

  globals.log.info("Device: ", JSON.stringify(deviceInfo));
}

export async function rotateLogs() {
  console.log("=== At rotateLogs().");

  let listingLogs = await FileSystem.readDirectoryAsync(getFileUri("logs"));
  let today = moment();

  for (const filename of listingLogs) {
    let fileInfo = await getFileInfo("logs/" + filename);

    let filenameDateString = filename.substring(4, 14);
    let fileDate = moment(filenameDateString);

    let dateDiff = today.diff(fileDate, 'days');
    if (dateDiff > globals.MAX_LOG_AGE) {
      await deleteFile("logs/" + filename);
    }
  }
}
