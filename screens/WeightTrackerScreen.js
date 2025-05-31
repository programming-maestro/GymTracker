// screens/WeightTrackerScreen.js
import React, { useState, useEffect } from 'react';
import { SafeAreaView, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HeightInput from '../components/HeightInput';
import WeightInput from '../components/WeightInput';
import WeightHistory from '../components/WeightHistory';

const HEIGHT_KEY = '@user_height';

export default function WeightTrackerScreen() {
  const [hasHeight, setHasHeight] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const checkHeight = async () => {
      const h = await AsyncStorage.getItem(HEIGHT_KEY);
      setHasHeight(!!h);
    };
    checkHeight();
  }, []);

  const handleHeightSaved = () => setHasHeight(true);
  const handleSave = () => setRefreshKey(prev => prev + 1);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {!hasHeight ? (
        <HeightInput onHeightSaved={handleHeightSaved} />
      ) : (
        <View style={{ flex: 1 }}>
          <WeightInput onSave={handleSave} />
          <WeightHistory key={refreshKey} />
        </View>
      )}
    </SafeAreaView>
  );
}
