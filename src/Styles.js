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

import { StyleSheet } from 'react-native';

// In testing, in order to avoid covering up the Android Status Bar, the style applied to Views must:
//    In development via Expo Go: Set container: marginTop to StatusBar.currentHeight || 0
//        (In Expo Go, marginTop: 0 covers up the Android Status bar).
//    In compiled APK: Set container.marginTop to 0.
//    
// container: marginTop: StatusBar.currentHeight || 0,
//

export const styles = StyleSheet.create({
  btnNormal: {
    backgroundColor: "cornflowerblue",
  },
  btnPressed: {
    backgroundColor: "blue",
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  container: {
    backgroundColor: 'lightgrey',
    flex: 1,
    marginTop: 0,
  },
  homeScreenButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: 'blue',
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
  item: {
    height: 100,
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  modalText: {
    fontSize: 17,
    textAlign: 'center',
    textAlignVertical: 'center'
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  screenTitleText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  settingsButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginVertical: 5,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: 'blue',
  },
  settingsButtonText: {
    fontSize: 17,
    color: 'white',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  title: {
    fontSize: 20,
  },
  paragraph: {
    fontSize: 18,
    textAlign: 'center',
  },
  trailSelectionListItem: {
    borderRadius: 2,
    height: 70,
    padding: 4,
    marginHorizontal: 10,
    marginVertical: 5,
    backgroundColor: "blue",
  },
  waypointDescriptionTitle: {
    fontSize: 24,
    textAlign: 'center',
    textAlignVertical: 'top',
  },
  waypointItemTouchableHighlight: {
    borderRadius: 2,
    height: 70,
    padding: 4,
    marginHorizontal: 10,
    marginVertical: 5
  },
  waypointItemMileage: {
    fontSize: 15,
    margin: 0,
    padding: 0
  },
  waypointItemDescription: {
    fontSize: 17,
    margin: 0,
    padding: 0
  },
  waypointItemTitle: {
    fontSize: 20,
    margin: 0,
    padding: 0
  }
});
