// components/WeightHistory.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WEIGHT_KEY = '@weight_entries';

export default function WeightHistory() {
  const [weightHistory, setWeightHistory] = useState([]);

  const loadWeightHistory = async () => {
    try {
      const data = await AsyncStorage.getItem(WEIGHT_KEY);
      const parsedData = data ? JSON.parse(data) : [];
      parsedData.sort((a, b) => (a.date < b.date ? 1 : -1));
      setWeightHistory(parsedData);
    } catch (e) {
      console.error('Error loading weight history:', e);
    }
  };

  useEffect(() => {
    loadWeightHistory();
  }, []);

  const deleteRecord = (date) => {
    Alert.alert(
      'Delete Entry',
      `Are you sure you want to delete the weight record for ${date}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const data = await AsyncStorage.getItem(WEIGHT_KEY);
              let weightHistory = data ? JSON.parse(data) : [];
              weightHistory = weightHistory.filter(entry => entry.date !== date);
              await AsyncStorage.setItem(WEIGHT_KEY, JSON.stringify(weightHistory));
              setWeightHistory(weightHistory);
            } catch (e) {
              console.error('Error deleting record:', e);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View>
        <Text style={styles.date}>{item.date}</Text>
        <Text style={styles.weight}>{item.weight} kg</Text>
      </View>
      <TouchableOpacity onPress={() => deleteRecord(item.date)} style={styles.deleteButton}>
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1, margin: 16 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>
        Weight History
      </Text>

      {weightHistory.length === 0 ? (
        <Text>No weight entries yet.</Text>
      ) : (
        <FlatList
          data={weightHistory}
          keyExtractor={(item) => item.date}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  date: { fontSize: 16 },
  weight: { fontSize: 16, fontWeight: '600' },
  deleteButton: {
    backgroundColor: '#ff4d4d',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  deleteText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
