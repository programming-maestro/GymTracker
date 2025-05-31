// components/WeightInput.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WEIGHT_KEY = '@weight_entries';

export default function WeightInput({ onSave }) {
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const formatDate = (d) => d.toISOString().split('T')[0]; // yyyy-mm-dd

  const saveWeight = async () => {
    if (!weight || isNaN(weight)) {
      Alert.alert('Invalid input', 'Please enter a valid number for weight');
      return;
    }

    const formattedDate = formatDate(date);
    const newEntry = { date: formattedDate, weight };

    try {
      const data = await AsyncStorage.getItem(WEIGHT_KEY);
      let weightHistory = data ? JSON.parse(data) : [];

      const existingIndex = weightHistory.findIndex(entry => entry.date === formattedDate);

      if (existingIndex !== -1) {
        Alert.alert(
          'Confirm Update',
          `A record already exists for ${formattedDate}. Do you want to update it?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Update',
              onPress: async () => {
                weightHistory[existingIndex] = newEntry;
                await AsyncStorage.setItem(WEIGHT_KEY, JSON.stringify(weightHistory));
                setWeight('');
                onSave();
              },
            },
          ]
        );
      } else {
        weightHistory.push(newEntry);
        await AsyncStorage.setItem(WEIGHT_KEY, JSON.stringify(weightHistory));
        setWeight('');
        onSave();
      }
    } catch (e) {
      console.error('Error saving weight:', e);
    }
  };

  return (
    <View style={{ margin: 16 }}>
      <Text style={{ marginBottom: 8 }}>Select Date:</Text>
      <Button title={formatDate(date)} onPress={() => setShowDatePicker(true)} />
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}

      <Text style={{ marginTop: 16 }}>Enter Weight (kg):</Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 4,
          padding: 8,
          marginVertical: 8,
        }}
        keyboardType="numeric"
        value={weight}
        onChangeText={setWeight}
        placeholder="e.g., 70"
      />
      <Button title="Save Weight" onPress={saveWeight} />
    </View>
  );
}
