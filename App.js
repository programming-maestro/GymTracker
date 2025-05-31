import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './screens/HomeScreen';
import AddWorkoutScreen from './screens/AddWorkoutScreen';
import ActivityTrackerScreen from './screens/ActivityTrackerScreen';
import WeightTrackerScreen from './screens/WeightTrackerScreen';  

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="AddWorkout" component={AddWorkoutScreen} />
        <Stack.Screen name="Activity Tracker" component={ActivityTrackerScreen} />
        <Stack.Screen name="Weight Tracker" component={WeightTrackerScreen} />  
      </Stack.Navigator>
    </NavigationContainer>
  );
}
