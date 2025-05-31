// screens/AddWorkoutScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AddWorkoutScreen({ navigation }) {
  const [exercise, setExercise] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');

  const saveWorkout = async () => {
    if (!exercise || !sets || !reps || !weight) {
      Alert.alert('Please fill in all fields');
      return;
    }

    const newWorkout = {
      id: Date.now().toString(),
      exercise,
      sets,
      reps,
      weight,
      date: new Date().toISOString(),
    };

    try {
      const existing = await AsyncStorage.getItem('workouts');
      const workouts = existing ? JSON.parse(existing) : [];
      workouts.push(newWorkout);
      await AsyncStorage.setItem('workouts', JSON.stringify(workouts));
      Alert.alert('Workout saved!');
      navigation.goBack(); // go back to Home after saving
    } catch (error) {
      Alert.alert('Error saving workout');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Exercise Name</Text>
      <TextInput style={styles.input} value={exercise} onChangeText={setExercise} />

      <Text style={styles.label}>Sets</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={sets} onChangeText={setSets} />

      <Text style={styles.label}>Reps</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={reps} onChangeText={setReps} />

      <Text style={styles.label}>Weight (kg)</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={weight} onChangeText={setWeight} />

      <Button title="Save Workout" onPress={saveWorkout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
  },
  label: {
    marginTop: 10,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
  },
});
