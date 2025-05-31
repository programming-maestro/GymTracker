import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Platform,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

const muscleGroups = {
  Chest: ['Bench Press', 'Incline Dumbbell Press', 'Push-up'],
  Back: ['Pull-up', 'Deadlift', 'Bent-over Row'],
  Legs: ['Squat', 'Leg Press', 'Lunges'],
  Shoulders: ['Overhead Press', 'Lateral Raise'],
  Arms: ['Bicep Curl', 'Tricep Extension'],
};

export default function AddWorkoutScreen({ navigation }) {
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [muscleGroup, setMuscleGroup] = useState('');
  const [exercise, setExercise] = useState('');
  const [weightLbs, setWeightLbs] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [reps, setReps] = useState('');

  useEffect(() => {
    if (weightLbs && !isNaN(weightLbs)) {
      const kg = (parseFloat(weightLbs) / 2.20462).toFixed(2);
      setWeightKg(kg);
    } else {
      setWeightKg('');
    }
  }, [weightLbs]);

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const getNextSetNumber = async () => {
    try {
      const existing = await AsyncStorage.getItem('workouts');
      const workouts = existing ? JSON.parse(existing) : [];
      const filtered = workouts.filter(
        (w) =>
          w.date.slice(0, 10) === date.toISOString().slice(0, 10) &&
          w.muscleGroup === muscleGroup &&
          w.exercise === exercise
      );
      return filtered.length + 1;
    } catch {
      return 1;
    }
  };

  const saveWorkout = async () => {
    if (!muscleGroup || !exercise || !weightLbs || !reps) {
      Alert.alert('Please fill in all fields');
      return;
    }

    const setNumber = await getNextSetNumber();

    const newWorkout = {
      id: Date.now().toString(),
      date: date.toISOString(),
      muscleGroup,
      exercise,
      weightLbs,
      weightKg,
      setNumber,
      reps,
    };

    try {
      const existing = await AsyncStorage.getItem('workouts');
      const workouts = existing ? JSON.parse(existing) : [];
      workouts.push(newWorkout);
      await AsyncStorage.setItem('workouts', JSON.stringify(workouts));
      Alert.alert(`Set ${setNumber} saved!`);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error saving workout');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Date</Text>
      <TouchableOpacity
        onPress={() => setShowDatePicker(true)}
        style={styles.dateButton}
      >
        <Text>{date.toDateString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onChangeDate}
          maximumDate={new Date()}
        />
      )}

      <Text style={styles.label}>Muscle Group</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={muscleGroup}
          onValueChange={(itemValue) => {
            setMuscleGroup(itemValue);
            setExercise('');
          }}
        >
          <Picker.Item label="Select muscle group" value="" />
          {Object.keys(muscleGroups).map((group) => (
            <Picker.Item key={group} label={group} value={group} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Exercise</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={exercise}
          enabled={!!muscleGroup}
          onValueChange={(itemValue) => setExercise(itemValue)}
        >
          <Picker.Item label="Select exercise" value="" />
          {muscleGroup &&
            muscleGroups[muscleGroup].map((ex) => (
              <Picker.Item key={ex} label={ex} value={ex} />
            ))}
        </Picker>
      </View>

      <Text style={styles.label}>Weight (lbs)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={weightLbs}
        onChangeText={setWeightLbs}
      />
      {weightKg !== '' && (
        <Text style={styles.kgText}>Equivalent: {weightKg} kg</Text>
      )}

      <Text style={styles.label}>Reps</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={reps}
        onChangeText={setReps}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.quickRepScrollView}
        contentContainerStyle={{ alignItems: 'center', paddingVertical: 10 }}
      >
        {[5, 8, 10, 12, 15, 20, 25, 30, 45, 50].map((val) => (
          <TouchableOpacity
            key={val}
            style={styles.quickRepButton}
            onPress={() => setReps(val.toString())}
          >
            <Text style={styles.quickRepText}>{val}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>


      <Button title="Save Workout" onPress={saveWorkout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    backgroundColor: '#fff',
  },
  label: {
    marginTop: 10,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
  },
  kgText: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 10,
  },
  dateButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginBottom: 10,
    alignItems: 'center',
  },
  quickRepButton: {
    backgroundColor: '#ddd',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickRepText: {
    fontSize: 14,
    color: '#333',
  },
});
