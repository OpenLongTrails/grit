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

import { Button, FlatList, SafeAreaView, Text } from 'react-native';
import { WaypointItem } from './WaypointItem';
import { styles } from './Styles';

export function WptGroupScreen({ route, navigation }) {
  const { selectedGroup } = route.params;

  let groupWpts = [...selectedGroup.properties.waypoints];

  function handleSubmitWpt() {
    navigation.navigate('SubmitWpt');
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
        format={"group-waypoint"}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.waypointDescriptionTitle}>
        {selectedGroup.properties.title}
      </Text>

      <Text style={{ textAlign: 'center' }}>
        ID: {selectedGroup.properties.id}{"\n"}
        GPS Coordinates: {"("}{selectedGroup.geometry.coordinates[1].toFixed(6)}{", "}{selectedGroup.geometry.coordinates[0].toFixed(6)}{")"}
        {"\n"}
      </Text>

      <Text>{selectedGroup.properties.description}</Text>

      <Button
        title="+wpt"
        onPress={handleSubmitWpt}
      />

      <FlatList
        data={groupWpts}
        renderItem={renderItem}
        keyExtractor={(item) => item.properties.id}
      />
    </SafeAreaView >
  );
}
