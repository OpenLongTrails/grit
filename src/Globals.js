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

export let trailsJson = "empty";
export let initialWaypoints = "empty";
export let nobo_mileages = "empty";
export let tracks = "empty";
export let buffers = "empty";
export let gpsHistory = [];
export let pauseGps = false;
export let comments = [];                           // Waypoint comments loaded from file.                         

export let log;

export let GPS_INTERVAL = 5000;                     // Delay between GPS radio polls, in milliseconds.                                                                                  
export let MAX_GPS_HISTORY_BEFORE_FLUSH = 100;      // When appSettings.shareGpsWithOlt == true, GPS coords are held in memory and flushed to disk when array.length reaches this value. 
export let MAX_LOG_AGE = 7;                         // Max age of a log file, in days. Used in log rotation routine.                                                                   

export let currentLocation = {
  "geometry": {
    "coordinates": [-116.462459, 32.596251],
    "type": "Point"
  },
  "type": "Feature",
  "properties": {
    "id": "currentLocation",
    "type": "",
    "title": "Current Location",
    "description": "",
    "tags": [],
    "sequence": -1,
    "nobo_mileage": 0,
    "nearestMilepoint": -1,
    "currentSection": "outside all buffers",
    "npot": {}
  }
};

// Information about the logged in user.                        
export let currentUser = {
  "data": "",
  "username": "",
  "userId": "",
  "email": ""
}

export let appSettings = {
  "appGpsEnabled": false,
  "darkModeOn": false,
  "selectedTrail": "",
  "selectedTrailDisplayName": "",
  "shareGpsWithOlt": false,
  "acceptedAllPolicies": false
};

export const appDataDir = 'oltgrit/';
export let appDataPath; // = FileSystem.documentDirectory + appDataDir;
