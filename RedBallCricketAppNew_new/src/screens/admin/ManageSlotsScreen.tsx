import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import Colors from '../../config/colors';
import { Slot, Sport } from '../../types';
import Card from '../../components/Card';
import Loading from '../../components/Loading';
import InputField from '../../components/InputField';
import Button from '../../components/Button';
import { AdminService } from '../../services/admin.service';
import { formatDate, formatTime, formatCurrency } from '../../utils/helpers';
import Icon from 'react-native-vector-icons/FontAwesome';
import DateTimePicker from '@react-native-community/datetimepicker';

const ManageSlotsScreen = () => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [selectedSport, setSelectedSport] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [price, setPrice] = useState('');
  const [maxPlayers, setMaxPlayers] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [slotsResponse, sportsResponse] = await Promise.all([
        AdminService.getAllSlots(),
        AdminService.getAllSports(),
      ]);
      setSlots(slotsResponse);
      setSports(sportsResponse);
    } catch (error) {
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCreateSlot = async () => {
    if (!selectedSport || !price || !maxPlayers) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const slotData = {
        sport: selectedSport,
        date: selectedDate.toISOString().split('T')[0],
        start_time: startTime.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
        }),
        end_time: endTime.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
        }),
        price: parseFloat(price),
        max_players: parseInt(maxPlayers, 10),
      };

      await AdminService.createSlot(slotData);
      Alert.alert('Success', 'Slot created successfully');
      setShowAddForm(false);
      loadData();
      resetForm();
    } catch (error) {
      Alert.alert('Error', 'Failed to create slot');
    }
  };

  const handleDeleteSlot = async (slotId: number) => {
    Alert.alert(
      'Delete Slot',
      'Are you sure you want to delete this slot?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              await AdminService.deleteSlot(slotId);
              Alert.alert('Success', 'Slot deleted successfully');
              loadData();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete slot');
            }
          },
        },
      ],
    );
  };

  const resetForm = () => {
    setSelectedSport(null);
    setSelectedDate(new Date());
    setStartTime(new Date());
    setEndTime(new Date());
    setPrice('');
    setMaxPlayers('');
  };

  const renderSlot = (slot: Slot) => (
    <Card key={slot.id} style={styles.slotCard}>
      <View style={styles.slotHeader}>
        <View>
          <Text style={styles.sportName}>{slot.sport_name}</Text>
          <Text style={styles.dateTime}>
            {formatDate(slot.date)} • {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteSlot(slot.id)}>
          <Icon name="trash" size={20} color={Colors.error} />
        </TouchableOpacity>
      </View>

      <View style={styles.slotDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Price:</Text>
          <Text style={styles.value}>{formatCurrency(slot.price)}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Max Players:</Text>
          <Text style={styles.value}>{slot.max_players}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Status:</Text>
          <Text
            style={[
              styles.status,
              { backgroundColor: slot.is_booked ? Colors.error : Colors.success },
            ]}>
            {slot.is_booked ? 'Booked' : 'Available'}
          </Text>
        </View>
      </View>
    </Card>
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={loadData} />
      }>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowAddForm(!showAddForm)}>
        <Text style={styles.addButtonText}>
          {showAddForm ? 'Cancel' : '+ Add New Slot'}
        </Text>
      </TouchableOpacity>

      {showAddForm && (
        <Card style={styles.formCard}>
          <Text style={styles.formTitle}>Create New Slot</Text>

          <View style={styles.formField}>
            <Text style={styles.formLabel}>Select Sport</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.sportSelector}>
                {sports.map((sport) => (
                  <TouchableOpacity
                    key={sport.id}
                    style={[
                      styles.sportOption,
                      selectedSport === sport.id && styles.selectedSport,
                    ]}
                    onPress={() => setSelectedSport(sport.id)}>
                    <Text
                      style={[
                        styles.sportOptionText,
                        selectedSport === sport.id && styles.selectedSportText,
                      ]}>
                      {sport.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.formField}>
            <Text style={styles.formLabel}>Date</Text>
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={(event, date) => setSelectedDate(date || selectedDate)}
              minimumDate={new Date()}
            />
          </View>

          <View style={styles.formField}>
            <Text style={styles.formLabel}>Start Time</Text>
            <DateTimePicker
              value={startTime}
              mode="time"
              display="default"
              onChange={(event, time) => setStartTime(time || startTime)}
            />
          </View>

          <View style={styles.formField}>
            <Text style={styles.formLabel}>End Time</Text>
            <DateTimePicker
              value={endTime}
              mode="time"
              display="default"
              onChange={(event, time) => setEndTime(time || endTime)}
            />
          </View>

          <View style={styles.formField}>
            <InputField
              label="Price"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              placeholder="Enter price"
            />
          </View>

          <View style={styles.formField}>
            <InputField
              label="Max Players"
              value={maxPlayers}
              onChangeText={setMaxPlayers}
              keyboardType="numeric"
              placeholder="Enter maximum players"
            />
          </View>

          <Button
            title="Create Slot"
            onPress={handleCreateSlot}
            style={styles.createButton}
          />
        </Card>
      )}

      <View style={styles.slotsList}>
        {slots.map(renderSlot)}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.default,
  },
  addButton: {
    margin: 16,
    padding: 16,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: Colors.text.light,
    fontSize: 16,
    fontWeight: '600',
  },
  formCard: {
    margin: 16,
    marginTop: 8,
    padding: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  formField: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  sportSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  sportOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background.paper,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedSport: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  sportOptionText: {
    color: Colors.text.primary,
    fontSize: 14,
  },
  selectedSportText: {
    color: Colors.text.light,
  },
  createButton: {
    marginTop: 8,
  },
  slotsList: {
    padding: 16,
  },
  slotCard: {
    marginBottom: 16,
    padding: 16,
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sportName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  dateTime: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  deleteButton: {
    padding: 8,
  },
  slotDetails: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  value: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  status: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    overflow: 'hidden',
    color: Colors.text.light,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ManageSlotsScreen;
