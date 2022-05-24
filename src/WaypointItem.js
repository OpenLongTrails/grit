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

import { useNavigation } from '@react-navigation/native';
import { Text, TouchableHighlight, View } from 'react-native';
import * as globals from './Globals';
import { styles } from './Styles';

const WaypointItem = ({ selectedItem, backgroundColor, textColor, format }) => {
  const navigation = useNavigation();
  let relativeNoboMileage = "";
  let absoluteNoboMileage = "";
  let title = selectedItem.properties.title;
  let description = "mm " + selectedItem.properties.nobo_mileage;

  if (selectedItem.properties.id === "currentLocation") {
    console.log("=== WaypointItem: Rendering currentLocation. CL.properties.description: ", selectedItem.properties.description);
  }

  if (format === "trail-waypoint") {
    if (selectedItem.properties.id === "currentLocation") {
      let lon, lat;

      if ((selectedItem.geometry.coordinates[0] == "NA" && selectedItem.geometry.coordinates[1] == "NA")) {
        lon = "NA";
        lat = "NA";
      } else {
        lon = (+selectedItem.geometry.coordinates[0]).toFixed(6);
        lat = (+selectedItem.geometry.coordinates[1]).toFixed(6);
      }

      relativeNoboMileage = "(" + lat + ", " + lon + ")"; //(mm " + selectedItem.properties.nobo_mileage + ")";

      description = selectedItem.properties.description;
    } else {
      description += ": " + selectedItem.properties.description;

      if (globals.currentLocation.properties.currentSection === "outside all buffers") {
        relativeNoboMileage = (selectedItem.properties.nobo_mileage - globals.currentLocation.properties.nearestMilepoint).toFixed(1);
      } else {
        relativeNoboMileage = (selectedItem.properties.nobo_mileage - globals.currentLocation.properties.nobo_mileage).toFixed(1);
      }

      if (relativeNoboMileage <= 0) {
        relativeNoboMileage = relativeNoboMileage + " mi";
      } else {
        relativeNoboMileage = "+" + relativeNoboMileage + " mi";
      }

      relativeNoboMileage = "(" + relativeNoboMileage + ")";
    }

    let wptGroupText = selectedItem.properties.hasOwnProperty("parentGroup") ?
      " (Town: " + selectedItem.properties.parentGroup + ")"
      : "";
  }

  return (
    <TouchableHighlight
      style={[styles.waypointItemTouchableHighlight, backgroundColor]}
      onPress={() => onPress(selectedItem, navigation)}>

      <View style={{ padding: 0, marginVertical: 0, marginHorizontal: 0, flex: 1, flexDirection: 'column', justifyContent: 'space-between' }}>
        {/* In the style on this <View>, flex + flexDirection + justifyContent vertically align the second <Text> at the bottom of the <View>. */}
        <View style={{ flexDirection: "row", justifyContent: 'space-between' }}>
          <Text style={[styles.waypointItemTitle, textColor]}
            numberOfLines={1}>
            {title}
            {selectedItem.properties.hasOwnProperty("parentGroup") && (format === "trail-waypoint") && wptGroupText}
          </Text>

          <Text style={[styles.waypointItemMileage, textColor, { width: 100 }, { textAlign: selectedItem.properties.id === "currentLocation" ? 'left' : 'right' }]}
            numberOfLines={2}>
            {relativeNoboMileage}
          </Text>
        </View>

        <Text style={[styles.waypointItemDescription, textColor]}
          numberOfLines={1}>
          {description}
        </Text>
      </View>
    </TouchableHighlight>
  );
}

export { WaypointItem };

function onPress(selectedItem, navigation) {
  console.log("=== WaypointItem: At onPress. selectedItem.properties.type: ", selectedItem.properties.type);

  switch (selectedItem.properties.type) {
    case "point":
      console.log("=== WaypointItem: onPress: selectedItem.properties.type == 'point'");
      navigation.navigate('Details', { selectedItem: selectedItem });
      break;

    case "group":
      console.log("=== WaypointItem: onPress: selectedItem.properties.type == 'group'");
      navigation.navigate('WptGroup', {
        selectedGroup: selectedItem
      });
      break;
  }
}
