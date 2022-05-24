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

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as FileSystem from 'expo-file-system';

import { withAuthenticator } from 'aws-amplify-react-native';
import Amplify from 'aws-amplify';

import awsconfig from './src/aws-exports';

import * as globals from './src/Globals';
globals.appDataPath = FileSystem.documentDirectory + globals.appDataDir;

import { HomeScreen } from './src/Homescreen';
import { FirstLaunch1Screen, FirstLaunch2Screen, FirstLaunch3Screen } from './src/LaunchScreens';
import { StartupScreen } from './src/StartupScreen';
import { DetailsScreen } from './src/DetailsScreen';
import { AnnouncementsScreen } from './src/AnnouncementsScreen';
import { LoadTrailScreen } from './src/LoadTrailScreen';
import { WptGroupScreen } from './src/WptGroupScreen';
import { DevMenuScreen } from './src/DevMenuScreen';
import { SubmitWptScreen } from './src/SubmitWptScreen';
import { SettingsScreen } from './src/SettingsScreen';
import { AboutScreen } from './src/AboutScreen';
import { ShowTextScreen } from './src/ShowTextScreen';
import { TrailInfoScreen } from './src/TrailInfoScreen';
import { TrailSelectionScreen } from './src/TrailSelectionScreen';
import { FeedbackScreen } from './src/FeedbackScreen';

// Don't console.log() in prod. Does Metro automatically do something equivalent?
if (!__DEV__) {
  console.log = () => null
}

Amplify.configure({
  ...awsconfig,
  Analytics: {
    disabled: true,
  },
});

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Startup" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Startup" component={StartupScreen} />
        <Stack.Screen name="LoadTrail" component={LoadTrailScreen} />
        <Stack.Screen name="FirstLaunch1" component={FirstLaunch1Screen} />
        <Stack.Screen name="FirstLaunch2" component={FirstLaunch2Screen} />
        <Stack.Screen name="FirstLaunch3" component={FirstLaunch3Screen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Details" component={DetailsScreen} />
        <Stack.Screen name="WptGroup" component={WptGroupScreen} />
        <Stack.Screen name="SubmitWpt" component={SubmitWptScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="TrailSelection" component={TrailSelectionScreen} />
        <Stack.Screen name="TrailInfo" component={TrailInfoScreen} />
        <Stack.Screen name="Feedback" component={FeedbackScreen} />
        <Stack.Screen name="Announcements" component={AnnouncementsScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
        <Stack.Screen name="ShowText" component={ShowTextScreen} />
        <Stack.Screen name="DevMenu" component={DevMenuScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default withAuthenticator(App)
