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

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Modal, Text, TextInput, View } from 'react-native';
import * as Location from 'expo-location';
import { booleanContains, nearestPoint, nearestPointOnLine, point, polygon } from '@turf/turf';
import moment from 'moment';
import { IconButton } from './IconButton';
import { WaypointItem } from './WaypointItem';
import { deleteFile, flushGpsHistoryToFile, getFileInfo, loadTrailData, loadTrailsJsonFromFile } from './Utils_Files';
import { loadComments, syncCommentsWithCloud } from './Utils_Comments';
import {
  downloadTrail, downloadTrailsJson, internetIsReachable, updateAboutJson, updatePolicyDocuments, uploadFeedback,
  uploadGpsHistory, uploadWaypointSubmissions
} from './Utils_Network';
import * as globals from './Globals';
import { styles } from './Styles';

async function getGPS() {
  console.log("=== At getGPS().");

  console.log("=== getGPS(): Calling Location.getCurrentPositionAsync()...");
  let gps = await Location.getCurrentPositionAsync({});

  if (globals.appSettings.shareGpsWithOlt == true) {
    console.log("=== getGPS(): globals.appSettings.shareGpsWithOlt == true, saving coords...");

    let point = {
      "date": moment().format("YYYY-MM-DD"),
      "coords": gps.coords
    };

    globals.gpsHistory.push(point);

    if (globals.gpsHistory.length > globals.MAX_GPS_HISTORY_BEFORE_FLUSH) {
      console.log("=== getGPS(): globals.gpsHistory.length > globals.MAX_GPS_HISTORY_BEFORE_FLUSH, writing globals.gpsHistory to file...");
      await flushGpsHistoryToFile();
    }
  }

  return gps;
}

function HomeScreen({ navigation, route }) {
  const { trailId } = route.params;

  const [flatlistWaypoints, setFlatlistWaypoints] = React.useState({});
  const [waypointsSearchText, setWaypointsSearchText] = React.useState('');
  const [searchInputIsVisible, setSearchInputIsVisible] = React.useState(false);
  const [currentCoords, setCurrentCoords] = React.useState({ "lon": "0.0", "lat": "0.0" });
  const [syncingModalVisible, setSyncingModalVisible] = React.useState(false);
  const [updatingLocationModalVisible, setUpdatingLocationModalVisible] = React.useState(false);
  // const [spoofClIsVisible, setSpoofClIsVisible] = React.useState(false);
  // const [spoofedClText, setSpoofedClText] = React.useState("");

  const waypointsFlatlist = useRef();
  const searchTextInput = useRef();
  const currentWaypoints = useRef(globals.initialWaypoints);

  const keyExtractor = useCallback((item) => item.properties.id, []);

  let timerId = {};

  // This is a temporary kludge to prevent errors when user navigates to Settings -> Open another trail -> Opens a trail -> deletes current trail. Since HomeScreen component is still mounted and timer is still running, deleting the current trail's data objects throws an exception. This is a quick & dirty way to prevent that.
  console.log("=== Home: setting globals.pauseGps = false.");
  globals.pauseGps = false;

  // When user loads a new trail (at startup, or via 'Open a different trail' from Settings), trailId changes and this useEffect() runs.
  useEffect(() => {
    console.log("=== At useEffect({}, [trailId]).");
    // globals.initialWaypoints was updated to the newly selected trail's data in loadTrailData() priod to navigating to HomeScreen. Update currentWaypoints.current to reflect that update in HomeScreen state.
    currentWaypoints.current = { ...globals.initialWaypoints };
    setFlatlistWaypoints([...currentWaypoints.current.features]);
  }, [trailId]);

  // Following initial render...
  useEffect(() => {
    (async () => {
      console.log("=== At Home:useEffect({},[]).");

      console.log("=== At Home:useEffect({},[]). Calling loadComments()...");
      await loadComments();

      console.log("=== At Home:useEffect({},[]): initializing timerId.");
      timerId = setInterval(() => {
        tick()
      }, globals.GPS_INTERVAL);

      // Initial call at t=0.
      console.log("=== Home:useEffect({},[]): Initial manual call to tick().");
      tick();
    })();

    return () => {
      clearInterval(timerId);
    }
  }, []);

  // Disable back button when on HomeScreen. Quick fix to prevent app getting stuck on LoadTrailScreen 'Loading...'.
  useEffect(() => {
    navigation.addListener('beforeRemove', (e) => {
      // Prevent default behavior of leaving the screen.
      e.preventDefault();
    })
  }, [navigation]);

  /*
  // When flatlistWaypoints changes, update the render count for debugging purposes.
  useEffect(() => {
    console.log("At Home:useEffect({}, [flatlistWaypoints]). Setting setRefreshCount()...");
    setRefreshCount(prevRefreshCount => prevRefreshCount + 1);
  }, [flatlistWaypoints]);
  */

  useEffect(() => {
    console.log("=== At Home:useEffect({}, [searchInputIsVisible, waypointsSearchText]). searchInputIsVisible: ", searchInputIsVisible);

    if (searchInputIsVisible) {
      searchTextInput.current.focus();
      handleSearchWaypoints();
    } else {      // Search was just closed.
      // Reset waypointsFlatlist to show all waypoints.
      console.log("    globals.initialWaypoints: ", JSON.stringify(globals.initialWaypoints).substring(0, 400));
      currentWaypoints.current = { ...globals.initialWaypoints };
      console.log("    currentWaypoints.current.features after update: ", JSON.stringify(currentWaypoints.current.features).substring(0, 400));
      setFlatlistWaypoints([...currentWaypoints.current.features]);
    }
  }, [searchInputIsVisible, waypointsSearchText]);

  // When currentCoords changes...
  useEffect(() => {
    console.log("=== At Home:useEffect({},[currentCoords]). currentCoords: " + currentCoords.lon + " " + currentCoords.lat);

    if ((currentCoords.lon === "0.0" && currentCoords.lat === "0.0") || (currentCoords.lon === "NA" && currentCoords.lat === "NA")) {
      console.log("=== Home:useEffect({},[]): currentCoords lat and lon are both 0 or NA, skipping useEffect().");
      globals.currentLocation.geometry.coordinates = [currentCoords.lon, currentCoords.lat];
    } else {
      globals.currentLocation.geometry.coordinates = [currentCoords.lon, currentCoords.lat];

      console.log("=== Home:useEffect({},[currentCoords]): Calling getCurrentLocationBuffer()...");

      getCurrentLocationBuffer();
      let insertAtIndex = getPositionInWaypointsList2();
      addClToWaypointsFlatlist(insertAtIndex);
    }
  }, [currentCoords]);

  const tick = async () => {
    console.log("=== At tick().");

    if (await Location.hasServicesEnabledAsync()) {
      if (globals.appSettings.appGpsEnabled) {
        console.log("=== Location.hasServicesEnabledAsync() == true");

        if (globals.pauseGps == false) {
          let gpsResults = await getGPS();

          // 0.1 before beginning of sec-e
          // gpsResults.coords.longitude = -118.320024;
          // gpsResults.coords.latitude = 34.520293;

          // Within sec-e.
          // gpsResults.coords.longitude = -118.466992;
          // gpsResults.coords.latitude = 34.907807;

          // 0.1 after end of sec-e.
          // gpsResults.coords.longitude = -118.292786;
          // gpsResults.coords.latitude = 35.10008;

          // 0.2 nobo from the Northern Terminus.
          // gpsResults.coords.longitude = -120.804259;
          // gpsResults.coords.latitude = 49.003508;

          console.log("=== tick(): globals.pauseGps == false, calling setCurrentCoords()...");
          setCurrentCoords({ "lon": gpsResults.coords.longitude.toFixed(6), "lat": gpsResults.coords.latitude.toFixed(6) });
        } else {
          // When globals.pauseGps == true ...
          console.log("=== tick(): globals.pauseGps == true, skipping update.");
          console.log("===    globals.buffers: ", JSON.stringify(globals.buffers).substring(0, 100));
          console.log("===    globals.initialWaypoints: ", JSON.stringify(globals.initialWaypoints).substring(0, 100));
          console.log("===       currentWaypoints: ", JSON.stringify(currentWaypoints.current.features).substring(0, 100));
          console.log("===    milepoints: ", JSON.stringify(globals.nobo_mileages).substring(0, 100));
          console.log("===    globals.tracks: ", JSON.stringify(globals.tracks).substring(0, 100));
        }
      } else {
        // When globals.appSettings.appGpsEnabled == false ...
        console.log("=== Home:tick(): globals.appSettings.appGpsEnabled == false");
        console.log("=== Home: tick(): Calling addClToWaypointsFlatlist(-2)...");
        setCurrentCoords({ lon: "NA", lat: "NA" });
        globals.currentLocation.properties.description = "App GPS is set to 'Off'";
        addClToWaypointsFlatlist(-2);
      }
    } else {
      // What Location.hasServicesEnabledAsync() == false ...
      console.log("=== Location.hasServicesEnabledAsync() == false");
      setCurrentCoords({ lon: "NA", lat: "NA" });
      globals.currentLocation.properties.description = "System GPS is set to 'Off'";
      addClToWaypointsFlatlist(-2);
    }
  }

  function removeClFromWaypointsFlatlist() {
    console.log("=== At Home:removeClFromWaypointsFlatlist().");
    console.log("=== Home:removeClFromWaypointsFlatlist(): setFlatlistWaypoints([...globals.initialWaypoints.features]).");
    setFlatlistWaypoints([...globals.initialWaypoints.features]);
  }

  function getPositionInWaypointsList2() {
    let high, low, mid, sectionWaypoints;
    let insertAtIndex;
    // let t0, t1;

    console.log("=== At Home:getPositionInWaypointsList2().");

    if (globals.currentLocation.properties.currentSection === "outside all buffers") {
      console.log("=== Home:getPositionInWaypointsList2(): currentSection === 'outside all buffers'"); //, returning -1...");
      console.log("=== Home:getPositionInWaypointsList2(): CL.properties.nearestMilepoint: ", globals.currentLocation.properties.nearestMilepoint);
      console.log("=== Home:getPositionInWaypointsList2(): CL.properties.description: ", globals.currentLocation.properties.description);

      insertAtIndex = currentWaypoints.current.features.findIndex(waypoint => parseFloat(waypoint.properties.nobo_mileage) > globals.currentLocation.properties.nearestMilepoint);
    } else {

      console.log("=== globals.currentLocation.properties.npot: ", JSON.stringify(globals.currentLocation.properties.npot));

      sectionWaypoints = currentWaypoints.current.features.filter((wpt) => wpt.properties.section === globals.currentLocation.properties.currentSection);

      console.log("=== beginning loop. globals.currentLocation.properties.npot.properties.location: ", JSON.stringify(globals.currentLocation.properties)); //.npot.properties.location);
      // t0 = performance.now();
      low = 0;
      high = sectionWaypoints.length;

      // Place currentLocation in list according to mileage.
      // Hat tip: https://stackoverflow.com/a/21822316
      while (low < high) {
        mid = low + high >>> 1;
        if (sectionWaypoints[mid].properties.turfSectionNoboMileage < globals.currentLocation.properties.npot.properties.location) {
          low = mid + 1;
        } else {
          high = mid;
        }
      }
      // t1 = performance.now();

      if (low == sectionWaypoints.length) {
        // Caller should append CL to end of currentWaypoints.
        insertAtIndex = currentWaypoints.current.features.findIndex(item => item.properties.id === sectionWaypoints[low - 1].properties.id) + 1;
      } else {
        insertAtIndex = currentWaypoints.current.features.findIndex(item => item.properties.id === sectionWaypoints[low].properties.id);
      }
    }
    console.log(`=== Home:getPositionInWaypointsList2(): insertAtIndex: ${insertAtIndex}`);

    return insertAtIndex;
  }

  function addClToWaypointsFlatlist(insertAtIndex) {
    let newWaypoints;

    console.log("=== addClToWaypointsFlatlist(): insertAtIndex: ", insertAtIndex);

    switch (insertAtIndex) {
      case -2:
        // case -2 is when app GPS is disabled via appSettings.
        newWaypoints = [globals.currentLocation, ...currentWaypoints.current.features];
        break;

      //   case -1:
      //     console.log("*** Home:addClToWaypointsFlatlist(): insertAtIndex == -1");

      //     currentLocation.properties.description = `Far from trail. Nearest mm: ${currentLocation.properties.nearestMilepoint}`;
      //     newWaypoints = [currentLocation, ...currentWaypoints.current.features]; //   newWaypoints.splice(0, 0, currentLocation);
      //     break;

      default:
        if (globals.currentLocation.properties.currentSection == "outside all buffers") {
          // This if() and else is a temporary kludge to work around a bug where the currentLocation item from reading: 'Far from trail. Nearest mm: -1'.
          // Seems to occur when the app starts with appSettings.shareGpsWithOlt == false.
          if (globals.currentLocation.properties.nearestMilepoint >= 0) {
            globals.currentLocation.properties.description = `Far from trail. Nearest mm: ${globals.currentLocation.properties.nearestMilepoint}`;
          } else {
            globals.currentLocation.properties.description = "Far from trail. Nearest mm: NA";
          }
        } else {
          globals.currentLocation.properties.description = "mm " + globals.currentLocation.properties.nobo_mileage;
        }

        newWaypoints = [...currentWaypoints.current.features];
        newWaypoints.splice(insertAtIndex, 0, globals.currentLocation);
        break;
    }

    setFlatlistWaypoints([...newWaypoints]);
  }

  async function handleScrollToCurrentLocation() {
    let currentLocationIndex = 0;

    console.log("=== At scrollToCurrentLocation().");

    setUpdatingLocationModalVisible(true);

    await tick();

    // Find index of id === "currentLocation".
    console.log("=== scrollToCurrentLocation(): finding element.properties.id === 'currentLocation'");
    // Using a predefined function is significantly faster, according to https://stackoverflow.com/a/15998003.
    const findCurrentLocation = element => element.properties.id === "currentLocation";
    currentLocationIndex = flatlistWaypoints.findIndex(findCurrentLocation);

    console.log("=== Home:scrollToCurrentLocation: currentLocationIndex: ", currentLocationIndex);

    setUpdatingLocationModalVisible(false);

    if (currentLocationIndex >= 0) {
      console.log("=== scrollToCurrentLocation(): calling waypointsFlatlist.current.scrollToIndex()");
      waypointsFlatlist.current.scrollToIndex({ animated: true, index: currentLocationIndex, viewPosition: 0.3 });
    }
  }

  function handleSearchWaypoints() {
    console.log("=== At handleSearchWaypoints().");

    //TODO: Refactor this to use addClToWaypointsFlatlist().
    console.log("=== Home:handleSearchWaypoints(): Calling getPositionInWaypointsList2()...");
    let insertAfterIndex = getPositionInWaypointsList2();

    let newWaypoints = [...currentWaypoints.current.features];
    if (insertAfterIndex != -100) {
      newWaypoints.splice((insertAfterIndex + 1), 0, globals.currentLocation);
    }

    if (searchInputIsVisible) {
      let results = [];

      searchInWaypoints(globals.initialWaypoints.features, waypointsSearchText, results);

      currentWaypoints.current.features = [...results];
      setFlatlistWaypoints([...results]);
    }
  }

  async function handleSync() {
    // 0. Check for network connection.
    // 1. Download trails.json.
    // 2. Load trails.json.
    // 3. Upload any local comments.
    // 4. Download all comments.
    // 5. Upload any feedback.
    // 6. Upload any waypoint submissions.
    // 7. Download all files for current trail.
    // 8. Reload waypoints.
    // 9. If shareGpsWithOlt==true, upload globals.gpsHistory and delete gpshistory.json.

    if (await internetIsReachable() == false) {
      Alert.alert(
        "",
        "Unable to contact server.",
        [{ text: "OK", onPress: () => console.log("=== OK Pressed") }]
      );
    } else {
      console.log("=== At handleSync().");

      setSyncingModalVisible(true);

      // Download trails.json and load to global trailsJson.
      console.log("=== handleSync(): Calling downloadTrailsJson()...");
      await downloadTrailsJson();

      console.log("=== handleSync(): Calling loadTrailsJsonFromFile()...")
      await loadTrailsJsonFromFile();

      await updateAboutJson();
      await updatePolicyDocuments();

      // Sync comments.
      console.log("=== handleSync(): calling syncCommentsWithCloud()...");
      await syncCommentsWithCloud();

      // Upload any feedback.
      console.log("=== handleSync(): Calling uploadFeedback()...");
      await uploadFeedback();

      // Upload any submitted waypoints.
      await uploadWaypointSubmissions();

      // Download buffers, waypoints, tracks, and milepoints.
      // Get the current trail's info from trails.json.
      console.log("=== handleSync(): globals.appSettings.selectedTrail: ", globals.appSettings.selectedTrail);
      let trailData = globals.trailsJson.trails.find(trail => trail.trailId === globals.appSettings.selectedTrail);

      console.log("=== handleSync(): trailData: ", JSON.stringify(trailData));

      console.log("=== handleSync(): calling downloadTrail(trailData)...");
      await downloadTrail(trailData);
      console.log("=== handleSync(): Calling loadTrailData()...");
      await loadTrailData();

      let insertAfterIndex = getPositionInWaypointsList2();
      addClToWaypointsFlatlist(insertAfterIndex);

      if (globals.appSettings.shareGpsWithOlt == true) {
        console.log("=== handleSync(): globals.appSettings.shareGpsWithOlt == true, calling uploadGpsHistory()...");
        await uploadGpsHistory();

        let gpsHistoryFileInfo = await getFileInfo("gpshistory.json");
        if (gpsHistoryFileInfo.exists == true) {
          await deleteFile("gpshistory.json");
        }
      }

      setSyncingModalVisible(false);
    }
  }

  function handleSpoof() {
    setSpoofClIsVisible(prevValue => !prevValue);
  }

  function spoofCL() {
    console.log("=== At Home:spoofCL().");

    let lon = spoofedClText.split(',')[0];
    let lat = spoofedClText.split(',')[1];
    console.log("=== Home:spoofCL(): lon, lat: " + lon + ", " + lat);
    setCurrentCoords({ "lon": lon, "lat": lat });
    console.log("=== Home:spoofCL(): currentCoords.geometry.coordinates: ", JSON.stringify(currentCoords));
  }

  function getItemLayout(data, index) {
    // This may or may not be the correct value for 'length', but it seems to work. Was unable to find clear documentation for the value online.
    return ({ length: 80, offset: 80 * index, index });
  }

  const renderItem = ({ item }) => {
    let backgroundColor = 'blue';
    const color = item.properties.id === "currentLocation" ? 'black' : 'white';

    if (item.properties.id === "currentLocation") {
      backgroundColor = 'red';
    } else {
      if (item.properties.type === "group") { backgroundColor = 'green'; }
    }

    return (
      <WaypointItem
        selectedItem={item}
        backgroundColor={{ backgroundColor }}
        textColor={{ color }}
        format={"trail-waypoint"}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/*
      <Text>
        ({currentCoords.lon}, {currentCoords.lat}){"\n"}
        mileage: {currentNoboMileage}    dist from trail: {currentDisplayedDistanceFromTrail}     refresh: {refreshCount}{"\n"}
        {fileContents}
      </Text>
      */}
      <Text style={{ fontSize: 15, marginTop: 0, marginBottom: 0, textAlign: 'center' }}>
        Beta Testing Version
      </Text>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, marginTop: 5, textAlign: 'center' }}>
        {globals.appSettings.selectedTrailDisplayName}
      </Text>
      <View style={{ flexDirection: "row", marginBottom: 5, marginHorizontal: 5, justifyContent: 'space-evenly' }}>
        <IconButton
          graphic="search"
          onPress={() => setSearchInputIsVisible(prevSearchInputIsVisible => !prevSearchInputIsVisible)}
        />

        <IconButton
          graphic="currentLocation"
          onPress={handleScrollToCurrentLocation}
        />

        <IconButton
          graphic="plusCircle"
          onPress={() => handleSubmitWpt(navigation)}
        />

        <IconButton
          graphic="setting"
          onPress={() => handleSettings(navigation)}
        />

        <IconButton
          graphic="sync"
          onPress={handleSync}
        />

        <IconButton
          graphic="feedback"
          onPress={() => handleSendFeedback(navigation)}
        />

        {/*
        <Button
          title="Spoof"
          onPress={handleSpoof}
        />
        */}

        <IconButton
          title="dev"
          onPress={() => handleDevMenu(navigation)}
        />
      </View>
      {searchInputIsVisible &&
        <View style={{ flexDirection: "row", marginHorizontal: 15, justifyContent: 'space-between' }}>
          <TextInput
            ref={searchTextInput}
            onChangeText={(text) => setWaypointsSearchText(text)}
            placeholder={"Search"}
            value={waypointsSearchText}
            style={{
              flex: 1,
              margin: 12,
              borderWidth: 1,
              padding: 10,
              textAlignVertical: 'center'
            }}
          />
          <Text style={{ textAlign: 'center', textAlignVertical: 'center' }}> {"Results:\n"}{flatlistWaypoints.length}</Text>
        </View>
      }
      {/*
      {spoofClIsVisible &&
        <View style={{ flexDirection: "row", marginLeft: 20, justifyContent: 'space-evenly' }}>
          <TextInput
            onChangeText={(text) => setSpoofedClText(text)}
            placeholder={"Spoofed CL"}
            value={spoofedClText}
            style={{
              margin: 12,
              borderWidth: 1,
              padding: 10,
              textAlignVertical: 'top'
            }}
          />

          <Button title="Go" onPress={spoofCL} />
        </View>
      }
      */}
      <FlatList
        data={flatlistWaypoints}
        // getItemLayout is necessary for scrollToIndex().
        getItemLayout={getItemLayout}
        initialNumToRender={7}
        keyExtractor={keyExtractor}
        //maxToRenderPerBatc={2}
        ref={waypointsFlatlist}
        //removeClippedSubviews
        renderItem={renderItem}
        windowSize={15}
      />
      {syncingModalVisible && <View style={styles.centeredView}>
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
              {/*
              <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => setDownloadingModalVisible(!downloadingModalVisible)}>
                <Text style={styles.textStyle}>Hide Modal</Text>
              </Pressable>
              */}
            </View>
          </View>
        </Modal>
      </View>}
      {updatingLocationModalVisible &&
        <View style={styles.centeredView}>
          <Modal
            animationType="none"
            transparent={true}
            visible={updatingLocationModalVisible}
            onRequestClose={() => {
              console.log("=== Closing modal.");
              setUpdatingLocationModalVisible(prevValue => !prevValue);
            }}>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <Text style={styles.modalText}>Updating location...</Text>
              </View>
            </View>
          </Modal>
        </View>}
    </View>
  );
}

export { HomeScreen };

function getCurrentLocationBuffer() {
  let buffer, bufferContainsCL, track;
  let bufferFound = false;
  // let t0, t1, t10, t11;

  console.log("=== At Home:getCurrentLocationBuffer().");

  // t0 = performance.now();
  for (let b = 0; b < globals.buffers.features.length; b++) {
    buffer = globals.buffers.features[b];

    bufferContainsCL = booleanContains(polygon(buffer.geometry.coordinates), point(globals.currentLocation.geometry.coordinates));
    if (bufferContainsCL == true) {
      bufferFound = true;
      track = globals.tracks.features.findIndex(t => t.properties.name === buffer.properties.name);
      globals.currentLocation.properties.currentSection = buffer.properties.name;
      // npot is "Nearest Point on Track".
      // t10 = performance.now();
      globals.currentLocation.properties.npot = nearestPointOnLine(globals.tracks.features[track], globals.currentLocation.geometry, { units: "miles" });

      globals.currentLocation.properties.nobo_mileage = nearestPoint(globals.currentLocation, globals.nobo_mileages, { units: "miles" }).properties.nobo_mileage;
      globals.currentLocation.properties.nearestMilepoint = -1;
      // t11 = performance.now();

      console.log("=== Home: getCurrentLocationBuffer(): bufferFound==true. CL.currentSection: ", globals.currentLocation.properties.currentSection);

      break;
    }
  }
  // t1 = performance.now()
  // console.log("===    location check timing, total: ", (t1 - t0));

  if (bufferFound == false) {
    console.log("=== Home:getCurrentLocationBuffer(): After buffer check loop, bufferFound still == false.");
    globals.currentLocation.properties.currentSection = "outside all buffers";

    // let t0 = performance.now();
    globals.currentLocation.properties.nearestMilepoint = nearestPoint(globals.currentLocation, globals.nobo_mileages, { units: "miles" }).properties.nobo_mileage;
    // let t1 = performance.now();
    // console.log("=== getCurrentLocationBuffer(): nearestPoint() perf: ", (t1 - t0));

    if (globals.currentLocation.properties.currentSection === "outside all buffers") {
      globals.currentLocation.properties.description = `Far from trail. Nearest mm: ${globals.currentLocation.properties.nearestMilepoint}`;
    }
  }
}

function handleSubmitWpt(navigation) {
  navigation.navigate('SubmitWpt');
}

function handleSettings(navigation) {
  console.log("=== At handleSettings().");

  navigation.push('Settings', { caller: "homeScreen" });
}

function handleSendFeedback(navigation) {
  console.log("=== At handleSendFeedback().");

  navigation.navigate('Feedback');
}

function handleAnnouncements(navigation) {
  console.log("=== At handleAnnouncements().");

  navigation.navigate('Announcements');
}

function handleDevMenu(navigation) {
  console.log("=== At handleDevMenu()");

  navigation.navigate('DevMenu');
}

function searchInWaypoints(arr, searchText, results) {
  let addToResults;
  searchText = searchText.toLowerCase();

  arr.forEach((obj) => {
    addToResults = false;

    if (obj.properties.title.toLowerCase().includes(searchText)) {
      addToResults = true;
    }

    if (("mm" + obj.properties.nobo_mileage).includes(searchText)) {
      addToResults = true;
    }

    if (obj.properties.description.toLowerCase().includes(searchText)) {
      addToResults = true;
    }

    if (obj.properties.hm_map_code.toLowerCase().includes(searchText)) {
      addToResults = true;
    }

    if (addToResults == true) {
      results.push(obj);
    }
  });
}
