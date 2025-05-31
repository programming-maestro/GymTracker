// components/HeightInput.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HEIGHT_KEY = '@user_height';

export default function HeightInput({ onHeightSaved }) {
  const [height, setHeight] = useState('');

  const saveHeight = async () => {
    if (!height || isNaN(height)) {
      Alert.alert('Invalid input', 'Please enter a valid number for height');
      return;
    }
    try {
      await AsyncStorage.setItem(HEIGHT_KEY, height);
      onHeightSaved();
    } catch (e) {
      console.error('Error saving height:', e);
    }
  };

  return (
    <View style={{ margin: 16 }}>
      <Text>Enter your height (cm):</Text>
      <TextInput
        style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, marginVertical: 12 }}
        keyboardType="numeric"
        value={height}
        onChangeText={setHeight}
        placeholder="e.g., 170"
      />
      <Button title="Save Height" onPress={saveHeight} />
    </View>
  );
}
