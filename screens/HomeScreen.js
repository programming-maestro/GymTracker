import React, { useState, useCallback } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';  // <-- Import here


export default function HomeScreen({ navigation }) {
  const [workouts, setWorkouts] = useState([]);

  const loadWorkouts = async () => {
    try {
      const stored = await AsyncStorage.getItem('workouts');
      if (stored) {
        setWorkouts(JSON.parse(stored));
      } else {
        setWorkouts([]); // clear if none
      }
    } catch (error) {
      Alert.alert('Failed to load workouts');
    }
  };

  // Reload workouts every time screen is focused
  useFocusEffect(
    useCallback(() => {
      loadWorkouts();
    }, [])
  );

  const deleteWorkout = (id) => {
    Alert.alert(
      "Delete Workout",
      "Are you sure you want to delete this workout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const updatedWorkouts = workouts.filter(workout => workout.id !== id);
              setWorkouts(updatedWorkouts);
              await AsyncStorage.setItem('workouts', JSON.stringify(updatedWorkouts));
            } catch (error) {
              Alert.alert('Failed to delete workout');
            }
          }
        }
      ],
      { cancelable: true }
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.workoutItem}>
      <Text style={styles.exercise}>{item.exercise}</Text>
      <Text>Sets: {item.sets} | Reps: {item.reps} | Weight: {item.weight} kg</Text>
      <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>

      <TouchableOpacity
        onPress={() => deleteWorkout(item.id)}
        style={styles.deleteButton}
      >
        <Text style={{ color: 'white' }}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Workouts</Text>
      <Button title="Add Workout" onPress={() => navigation.navigate('AddWorkout')} />
      <Button title="Activity Tracker" onPress={() => navigation.navigate('Activity Tracker')} />
      <Button title="Weight Management" onPress={() => navigation.navigate('Weight Tracker')} />
      {workouts.length === 0 ? (
        <Text style={{ marginTop: 20 }}>No workouts logged yet.</Text>
      ) : (
        <FlatList
          data={workouts}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          style={{ marginTop: 20, width: '100%' }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold' },
  workoutItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  exercise: { fontSize: 18, fontWeight: 'bold' },
  date: { fontSize: 12, color: '#666', marginTop: 4 },
  deleteButton: {
    marginTop: 8,
    backgroundColor: 'red',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
});
