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
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null);

  // Form states
  const [selectedSport, setSelectedSport] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [price, setPrice] = useState('');
  const [maxPlayers, setMaxPlayers] = useState('');
  // Picker visibility states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

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
      setSlots(Array.isArray(slotsResponse) ? slotsResponse : []);
      setSports(Array.isArray(sportsResponse) ? sportsResponse : []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load data');
      setSlots([]);
      setSports([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const openCreateModal = () => {
    setEditingSlot(null);
    resetForm();
    setShowAddForm(true);
  };

  const openEditModal = (slot: Slot) => {
    setEditingSlot(slot);
    setSelectedSport(slot.sport);
    setSelectedDate(new Date(slot.date));
    const [startHour, startMin] = slot.start_time.split(':');
    const [endHour, endMin] = slot.end_time.split(':');
    const startDate = new Date();
    startDate.setHours(parseInt(startHour, 10), parseInt(startMin, 10));
    const endDate = new Date();
    endDate.setHours(parseInt(endHour, 10), parseInt(endMin, 10));
    setStartTime(startDate);
    setEndTime(endDate);
    setPrice(slot.price.toString());
    setMaxPlayers(slot.max_players.toString());
    setShowAddForm(true);
  };

  const handleCreateOrUpdateSlot = async () => {
    if (!selectedSport || !selectedDate || !price || !maxPlayers || !startTime || !endTime) {
      Alert.alert('Error', 'Please fill in all required fields including date and times');
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
          second: '2-digit',
        }),
        end_time: endTime.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        price: price,
        max_players: parseInt(maxPlayers, 10),
      };

      console.log(editingSlot ? 'Updating slot' : 'Creating slot', 'with data:', slotData);
      
      if (editingSlot) {
        // Update existing slot
        const result = await AdminService.updateSlot(editingSlot.id, slotData);
        console.log('Slot updated:', result);
        Alert.alert('Success', 'Slot updated successfully');
        setSlots(prev => prev.map(s => s.id === editingSlot.id ? result : s));
      } else {
        // Create new slot
        const result = await AdminService.createSlot(slotData);
        console.log('Slot created:', result);
        Alert.alert('Success', 'Slot created successfully');
        setSlots(prev => [result, ...prev]);
      }
      
      setShowAddForm(false);
      resetForm();
    } catch (error: any) {
      console.error('Slot creation/update error:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.error 
        || error.response?.data?.detail 
        || error.message 
        || `Failed to ${editingSlot ? 'update' : 'create'} slot`;
      Alert.alert('Error', errorMessage);
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
    setSelectedDate(null);
    setStartTime(null);
    setEndTime(null);
    setPrice('');
    setMaxPlayers('');
  };

  const renderSlot = (slot: Slot) => (
    <Card key={slot.id} style={styles.slotCard}>
      <View style={styles.slotHeader}>
        <View style={{flex: 1}}>
          <Text style={styles.sportName}>{slot.sport_name}</Text>
          <Text style={styles.dateTime}>
            {formatDate(slot.date)} • {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
          </Text>
        </View>
        <View style={styles.slotActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => openEditModal(slot)}>
            <Icon name="edit" size={18} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteSlot(slot.id)}>
            <Icon name="trash" size={18} color={Colors.error} />
          </TouchableOpacity>
        </View>
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
        onPress={() => {
          if (showAddForm) {
            setShowAddForm(false);
            setEditingSlot(null);
          } else {
            openCreateModal();
          }
        }}>
        <Text style={styles.addButtonText}>
          {showAddForm ? 'Cancel' : '+ Add New Slot'}
        </Text>
      </TouchableOpacity>

      {showAddForm && (
        <Card style={styles.formCard}>
          <Text style={styles.formTitle}>
            {editingSlot ? 'Edit Slot' : 'Create New Slot'}
          </Text>

          <View style={styles.formField}>
            <Text style={styles.formLabel}>Select Sport</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.sportSelector}>
                {(sports || []).map((sport) => (
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
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.pickerContainer}>
              <Text style={selectedDate ? styles.pickerText : styles.placeholderText}>
                {selectedDate ? selectedDate.toLocaleDateString() : 'Select date'}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate || new Date()}
                mode="date"
                display="default"
                minimumDate={new Date()}
                onChange={(event, date) => {
                  setShowDatePicker(false);
                  if (event.type === 'set' && date) setSelectedDate(date);
                }}
              />
            )}
          </View>

          <View style={styles.formField}>
            <Text style={styles.formLabel}>Start Time</Text>
            <TouchableOpacity onPress={() => setShowStartTimePicker(true)} style={styles.pickerContainer}>
              <Text style={startTime ? styles.pickerText : styles.placeholderText}>
                {startTime ? startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'Select start time'}
              </Text>
            </TouchableOpacity>
            {showStartTimePicker && (
              <DateTimePicker
                value={startTime || new Date()}
                mode="time"
                display="default"
                onChange={(event, time) => {
                  setShowStartTimePicker(false);
                  if (event.type === 'set' && time) setStartTime(time);
                }}
              />
            )}
          </View>

          <View style={styles.formField}>
            <Text style={styles.formLabel}>End Time</Text>
            <TouchableOpacity onPress={() => setShowEndTimePicker(true)} style={styles.pickerContainer}>
              <Text style={endTime ? styles.pickerText : styles.placeholderText}>
                {endTime ? endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'Select end time'}
              </Text>
            </TouchableOpacity>
            {showEndTimePicker && (
              <DateTimePicker
                value={endTime}
                mode="time"
                display="default"
                onChange={(event, time) => {
                  setShowEndTimePicker(false);
                  if (event.type === 'set' && time) setEndTime(time);
                }}
              />
            )}
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
            title={editingSlot ? 'Update Slot' : 'Create Slot'}
            onPress={handleCreateOrUpdateSlot}
            style={styles.createButton}
          />
        </Card>
      )}

      <View style={styles.slotsList}>
        {slots && slots.length > 0 ? (
          slots.map(renderSlot)
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No slots available. Create one to get started!</Text>
          </View>
        )}
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
  pickerContainer: {
    alignItems: 'flex-start',
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
  dateTimeButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dateTimeButtonText: {
    fontSize: 16,
    color: Colors.text.primary,
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
  slotActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    padding: 8,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  pickerText: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  placeholderText: {
    fontSize: 16,
    color: Colors.text.secondary,
    fontStyle: 'italic',
  },
});

export default ManageSlotsScreen;
