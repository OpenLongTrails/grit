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

import { Pressable } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { styles } from './Styles';

function IconButton(props) {
  const { graphic, color = "white", onPress } = props;
  let imageName = "";

  switch (graphic) {
    case "search":
      imageName = "search1";
      break;
    case "feedback":
      imageName = "mail"
      break;
    case "sync":
      imageName = "sync";
      break;
    case "plusCircle":
      imageName = "pluscircleo";
      break;
    case "setting":
      imageName = "setting";
      break;
    case "currentLocation":
      imageName = "find";
      break;
  }

  return (
    <Pressable style={[styles.homeScreenButton, { borderColor: "black", backgroundColor: color }]} onPress={onPress}>
      <AntDesign name={imageName} size={22} color="black" />
    </Pressable>
  );
}

export { IconButton };
