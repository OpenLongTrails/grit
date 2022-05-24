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
import { SafeAreaView, ScrollView, Text } from 'react-native';
import { styles } from './Styles';

export function ShowTextScreen({ route, navigation }) {
  const { showText } = route.params;
  const [text, setText] = React.useState(showText.text);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={{ fontSize: 15, marginTop: 0, marginBottom: 2, textAlign: 'center' }}>
          Beta Testing Version
        </Text>
        <Text style={{ fontSize: 14, marginHorizontal: 10 }}>{text}</Text>
      </ScrollView>
    </SafeAreaView>
  )
}
