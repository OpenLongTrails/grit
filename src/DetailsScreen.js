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

import { SafeAreaView, ScrollView, Text } from 'react-native';
import { Comments } from './Comments';
import * as globals from './Globals';
import { styles } from './Styles';

export function DetailsScreen({ route, navigation }) {
  const { selectedItem } = route.params;
  let relativeNoboMileage;

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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps='handled'>
        <Text style={{ fontSize: 15, marginTop: 0, marginBottom: 2, textAlign: 'center' }}>
          Beta Testing Version
        </Text>

        <Text style={styles.screenTitleText}>
          {selectedItem.properties.title}
        </Text>

        <Text style={{ textAlign: 'center' }}>
          GPS Coordinates: {"("}{selectedItem.geometry.coordinates[1].toFixed(6)}{", "}{selectedItem.geometry.coordinates[0].toFixed(6)}{")"}{"\n"}
          Halfmile ID: {selectedItem.properties.hm_map_code}{"\n"}
          Nobo Mileage: {selectedItem.properties.nobo_mileage} {relativeNoboMileage}{"\n"}
          Elevation: {selectedItem.properties.hm_elevation} ft.{"\n"}
        </Text>

        <Text style={{ padding: 8 }}>
          {selectedItem.properties.description}
        </Text>

        <Comments waypointId={selectedItem.properties.id} commentEntryField={true} />
      </ScrollView>
    </SafeAreaView>
  );
}
