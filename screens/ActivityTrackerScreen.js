import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  TextInput,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function ActivityTrackerScreen() {
  const [workouts, setWorkouts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editValues, setEditValues] = useState({
    muscleGroup: '',
    exercise: '',
    setIndex: null,
    weightLbs: '',
    reps: '',
  });

  const fetchData = async () => {
    try {
      const stored = await AsyncStorage.getItem('workouts');
      const allWorkouts = stored ? JSON.parse(stored) : [];
      const filtered = allWorkouts.filter(
        (item) =>
          new Date(item.date).toDateString() === selectedDate.toDateString()
      );

      const groupedByMuscle = {};
      filtered.forEach((item) => {
        if (!groupedByMuscle[item.muscleGroup]) {
          groupedByMuscle[item.muscleGroup] = {};
        }
        if (!groupedByMuscle[item.muscleGroup][item.exercise]) {
          groupedByMuscle[item.muscleGroup][item.exercise] = [];
        }
        groupedByMuscle[item.muscleGroup][item.exercise].push(item);
      });

      const sections = Object.entries(groupedByMuscle).map(
        ([muscleGroup, exercises]) => ({
          title: muscleGroup,
          data: Object.entries(exercises).map(([exercise, sets]) => ({
            muscleGroup,
            exercise,
            sets: sets.sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            ),
          })),
        })
      );

      setWorkouts(sections);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const onChangeDate = (event, date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) setSelectedDate(date);
  };

  const saveToStorage = async (updatedSets) => {
    await AsyncStorage.setItem('workouts', JSON.stringify(updatedSets));
    fetchData();
  };

  const handleDelete = async (level, muscleGroup, exercise, setIndex = null) => {
    const stored = await AsyncStorage.getItem('workouts');
    let allWorkouts = stored ? JSON.parse(stored) : [];

    if (level === 'muscleGroup') {
      allWorkouts = allWorkouts.filter(
        (w) =>
          !(w.muscleGroup === muscleGroup &&
            new Date(w.date).toDateString() === selectedDate.toDateString())
      );
    } else if (level === 'exercise') {
      allWorkouts = allWorkouts.filter(
        (w) =>
          !(w.muscleGroup === muscleGroup &&
            w.exercise === exercise &&
            new Date(w.date).toDateString() === selectedDate.toDateString())
      );
    } else if (level === 'set') {
      const relevant = allWorkouts.filter(
        (w) =>
          w.muscleGroup === muscleGroup &&
          w.exercise === exercise &&
          new Date(w.date).toDateString() === selectedDate.toDateString()
      );
      const toRemove = relevant[setIndex];
      allWorkouts = allWorkouts.filter((w) => w !== toRemove);
    }

    await saveToStorage(allWorkouts);
  };

  const handleEditSet = (muscleGroup, exercise, index) => {
    AsyncStorage.getItem('workouts').then((stored) => {
      const allWorkouts = stored ? JSON.parse(stored) : [];
      const filtered = allWorkouts.filter(
        (w) =>
          w.muscleGroup === muscleGroup &&
          w.exercise === exercise &&
          new Date(w.date).toDateString() === selectedDate.toDateString()
      );
      const workoutToEdit = filtered[index];
      if (workoutToEdit) {
        setEditValues({
          muscleGroup,
          exercise,
          setIndex: index,
          weightLbs: String(workoutToEdit.weightLbs),
          reps: String(workoutToEdit.reps),
        });
        setEditModalVisible(true);
      }
    });
  };

  const saveEditedSet = async () => {
    const { muscleGroup, exercise, setIndex, weightLbs, reps } = editValues;
    const stored = await AsyncStorage.getItem('workouts');
    let allWorkouts = stored ? JSON.parse(stored) : [];

    const matchingSets = allWorkouts.filter(
      (w) =>
        w.muscleGroup === muscleGroup &&
        w.exercise === exercise &&
        new Date(w.date).toDateString() === selectedDate.toDateString()
    );

    const setToEdit = matchingSets[setIndex];
    if (setToEdit) {
      setToEdit.weightLbs = parseInt(weightLbs);
      setToEdit.reps = parseInt(reps);
    }

    await saveToStorage(allWorkouts);
    setEditModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.dateLabel}>Selected Date</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
        <Text>{selectedDate.toDateString()}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={onChangeDate}
        />
      )}

      <SectionList
        sections={workouts}
        keyExtractor={(item, index) => item.exercise + index}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeaderBlock}>
            <Text style={styles.sectionHeader}>{title}</Text>
            <TouchableOpacity
              onPress={() =>
                Alert.alert('Delete Muscle Group', `Delete ${title}?`, [
                  { text: 'Cancel' },
                  {
                    text: 'Delete',
                    onPress: () => handleDelete('muscleGroup', title),
                  },
                ])
              }
            >
              <Text style={styles.deleteBtn}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.exerciseBlock}>
            <View style={styles.exerciseTitleRow}>
              <Text style={styles.exerciseTitle}>{item.exercise}</Text>
              <TouchableOpacity
                onPress={() =>
                  Alert.alert('Delete Exercise', `Delete ${item.exercise}?`, [
                    { text: 'Cancel' },
                    {
                      text: 'Delete',
                      onPress: () => handleDelete('exercise', item.muscleGroup, item.exercise),
                    },
                  ])
                }
              >
                <Text style={styles.deleteBtn}>🗑️</Text>
              </TouchableOpacity>
            </View>
            {item.sets.map((set, index) => (
              <View key={index} style={styles.setRow}>
                <Text style={styles.setInfo}>
                  Set {index + 1}: {set.weightLbs} lbs / {set.reps} reps
                </Text>
                <View style={styles.setActions}>
                  <TouchableOpacity onPress={() => handleEditSet(item.muscleGroup, item.exercise, index)}>
                    <Text style={{ color: 'blue', marginRight: 10 }}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      Alert.alert('Delete Set', `Delete set ${index + 1}?`, [
                        { text: 'Cancel' },
                        {
                          text: 'Delete',
                          onPress: () => handleDelete('set', item.muscleGroup, item.exercise, index),
                        },
                      ])
                    }
                  >
                    <Text style={styles.deleteBtn}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
        ListEmptyComponent={() => (
          <Text style={{ textAlign: 'center', marginTop: 30 }}>
            No workouts for this date
          </Text>
        )}
      />

      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editValues.exercise}</Text>
            <Text style={styles.modalSubTitle}>Set {editValues.setIndex + 1}</Text>

            <Text style={styles.label}>Weight (lbs)</Text>
            <TextInput
              placeholder="Enter weight"
              keyboardType="numeric"
              value={editValues.weightLbs}
              onChangeText={(text) =>
                setEditValues({ ...editValues, weightLbs: text })
              }
              style={styles.input}
            />

            <Text style={styles.label}>Reps</Text>
            <TextInput
              placeholder="Enter reps"
              keyboardType="numeric"
              value={editValues.reps}
              onChangeText={(text) =>
                setEditValues({ ...editValues, reps: text })
              }
              style={styles.input}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={saveEditedSet} style={styles.modalBtn}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setEditModalVisible(false)} style={styles.modalBtn}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 20, paddingHorizontal: 15 },
  dateLabel: { fontSize: 16, fontWeight: 'bold' },
  dateButton: {
    padding: 10,
    backgroundColor: '#eee',
    marginBottom: 15,
    borderRadius: 5,
  },
  sectionHeaderBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#ddd',
    padding: 10,
    marginTop: 10,
  },
  sectionHeader: { fontSize: 18, fontWeight: 'bold' },
  deleteBtn: { fontSize: 18 },
  exerciseBlock: { marginBottom: 10, backgroundColor: '#f9f9f9', padding: 10 },
  exerciseTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseTitle: { fontSize: 16, fontWeight: '600' },
  setRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  setInfo: { fontSize: 14 },
  setActions: { flexDirection: 'row', alignItems: 'center' },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  modalSubTitle: {
    fontSize: 14,
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 5,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  saveText: {
    color: 'green',
    fontWeight: 'bold',
  },
  cancelText: {
    color: 'red',
    fontWeight: 'bold',
  },
});
