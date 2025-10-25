import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
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
import SlotsService, { BlackoutDate } from '../../services/slots.service';
import BookingConfigService from '../../services/booking-config.service';

const ManageSlotsScreen = () => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [filteredSlots, setFilteredSlots] = useState<Slot[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [blackoutDates, setBlackoutDates] = useState<BlackoutDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal states
  const [showBulkGenerateModal, setShowBulkGenerateModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showBlackoutModal, setShowBlackoutModal] = useState(false);

  // Bulk generation states
  const [bulkSport, setBulkSport] = useState<number | null>(null);
  const [bulkStartDate, setBulkStartDate] = useState<Date | null>(null);
  const [bulkEndDate, setBulkEndDate] = useState<Date | null>(null);
  const [showBulkStartDatePicker, setShowBulkStartDatePicker] = useState(false);
  const [showBulkEndDatePicker, setShowBulkEndDatePicker] = useState(false);

  // Filter states
  const [filterSport, setFilterSport] = useState<number | null>(null);
  const [filterStartDate, setFilterStartDate] = useState<Date | null>(null);
  const [filterEndDate, setFilterEndDate] = useState<Date | null>(null);
  const [showFilterStartDatePicker, setShowFilterStartDatePicker] = useState(false);
  const [showFilterEndDatePicker, setShowFilterEndDatePicker] = useState(false);

  // Blackout date states
  const [blackoutSport, setBlackoutSport] = useState<number | null>(null);
  const [blackoutDate, setBlackoutDate] = useState<Date | null>(null);
  const [blackoutReason, setBlackoutReason] = useState('');
  const [showBlackoutDatePicker, setShowBlackoutDatePicker] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [slots, filterSport, filterStartDate, filterEndDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [slotsResponse, sportsResponse, blackoutResponse] = await Promise.all([
        AdminService.getAllSlots(),
        AdminService.getAllSports(),
        SlotsService.getBlackoutDates(),
      ]);
      setSlots(Array.isArray(slotsResponse) ? slotsResponse : []);
      setSports(Array.isArray(sportsResponse) ? sportsResponse : []);
      
      // Debug: Log received slots data
      console.log('📊 Slots received from API:', slotsResponse);
      console.log('📊 Total slots count:', Array.isArray(slotsResponse) ? slotsResponse.length : 0);
      if (Array.isArray(slotsResponse)) {
        const slotsByDate = slotsResponse.reduce((acc, slot) => {
          acc[slot.date] = (acc[slot.date] || 0) + 1;
          return acc;
        }, {});
        console.log('📅 Slots by date:', slotsByDate);
      }
      
      // Debug: Check which sports have booking configurations
      const sportsWithConfig = [];
      const sportsWithoutConfig = [];
      
      if (Array.isArray(sportsResponse)) {
        for (const sport of sportsResponse) {
          try {
            const config = await BookingConfigService.getBookingConfig(sport.id);
            if (config) {
              sportsWithConfig.push(sport.name);
              console.log(`✅ ${sport.name} (ID: ${sport.id}) has booking config:`, {
                hours: `${config.opens_at}-${config.closes_at}`,
                duration: config.slot_duration,
                buffer: config.buffer_time
              });
            } else {
              sportsWithoutConfig.push(sport.name);
              console.log(`❌ ${sport.name} (ID: ${sport.id}) has NO booking config`);
            }
          } catch (error) {
            sportsWithoutConfig.push(sport.name);
            console.log(`❌ ${sport.name} (ID: ${sport.id}) config check failed:`, error);
          }
        }
        
        console.log('📊 Configuration Summary:');
        console.log('   Sports WITH config:', sportsWithConfig);
        console.log('   Sports WITHOUT config:', sportsWithoutConfig);
      }
      setBlackoutDates(Array.isArray(blackoutResponse) ? blackoutResponse : []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load data');
      setSlots([]);
      setSports([]);
      setBlackoutDates([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...slots];
    
    console.log('🔍 Applying filters:');
    console.log('   Total slots before filtering:', filtered.length);
    console.log('   Filter Sport:', filterSport);
    console.log('   Filter Start Date:', filterStartDate);
    console.log('   Filter End Date:', filterEndDate);

    if (filterSport) {
      filtered = filtered.filter(slot => slot.sport === filterSport);
      console.log('   After sport filter:', filtered.length);
    }

    if (filterStartDate) {
      const startDateStr = filterStartDate.toISOString().split('T')[0];
      filtered = filtered.filter(slot => slot.date >= startDateStr);
      console.log('   After start date filter:', filtered.length);
    }

    if (filterEndDate) {
      const endDateStr = filterEndDate.toISOString().split('T')[0];
      filtered = filtered.filter(slot => slot.date <= endDateStr);
      console.log('   After end date filter:', filtered.length);
    }
    
    console.log('✅ Final filtered slots:', filtered.length);
    setFilteredSlots(filtered);
  };

  const clearFilters = () => {
    setFilterSport(null);
    setFilterStartDate(null);
    setFilterEndDate(null);
    setShowFilterModal(false);
  };

  // Bulk generate slots from booking configuration
  const handleBulkGenerate = async () => {
    if (!bulkSport || !bulkStartDate || !bulkEndDate) {
      Alert.alert('Error', 'Please select sport and date range');
      return;
    }

    if (bulkStartDate > bulkEndDate) {
      Alert.alert('Error', 'Start date must be before end date');
      return;
    }

    try {
      setLoading(true);
      
      console.log('🔍 Checking booking config for sport ID:', bulkSport);
      
      // Check if booking config exists
      const config = await BookingConfigService.getBookingConfig(bulkSport);
      console.log('📋 Booking config response:', config);
      
      if (!config) {
        console.log('❌ No booking config found for sport:', bulkSport);
        Alert.alert(
          'No Configuration Found',
          `No booking configuration found for this sport (ID: ${bulkSport}).\\n\\nPlease go to Sports Management and set up the booking configuration first.\\n\\nRequired settings:\\n• Operating hours\\n• Slot duration\\n• Buffer time`,
          [{ text: 'OK' }]
        );
        setLoading(false);
        return;
      }
      
      console.log('✅ Found booking config:', {
        id: config.id,
        opens_at: config.opens_at,
        closes_at: config.closes_at,
        slot_duration: config.slot_duration,
        buffer_time: config.buffer_time
      });

      // Generate slots automatically based on booking configuration
      const result = await SlotsService.bulkCreateSlots({
        sport: bulkSport,
        start_date: bulkStartDate.toISOString().split('T')[0],
        end_date: bulkEndDate.toISOString().split('T')[0],
        // Pass booking config details for automatic slot generation
        opens_at: config.opens_at,
        closes_at: config.closes_at,
        slot_duration: config.slot_duration,
        buffer_time: config.buffer_time,
        weekend_opens_at: config.weekend_opens_at,
        weekend_closes_at: config.weekend_closes_at,
      });

      Alert.alert(
        'Success',
        `Generated ${result.created_count} slots successfully!\n\nBased on configuration:\n• Hours: ${config.opens_at} - ${config.closes_at}\n• Duration: ${config.slot_duration} minutes\n• Buffer: ${config.buffer_time} minutes`,
        [{ text: 'OK' }]
      );
      
      setShowBulkGenerateModal(false);
      setBulkSport(null);
      setBulkStartDate(null);
      setBulkEndDate(null);
      loadData();
    } catch (error: any) {
      console.error('Bulk generation error:', error);
      console.error('Error response data:', error.response?.data);
      
      const errorMessage = error.response?.data?.error 
        || error.response?.data?.detail 
        || error.message 
        || 'Failed to generate slots';
      
      // Check if it's a configuration error
      if (errorMessage.includes('booking configuration')) {
        Alert.alert(
          'Missing Booking Configuration',
          'This sport needs booking configuration set up first. Please go to Booking Configuration and set up the operating hours, slot duration, and other settings for this sport.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Go to Booking Config', 
              onPress: () => {
                setShowBulkGenerateModal(false);
                navigation.navigate('BookingManagement' as never);
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Create blackout date
  const handleCreateBlackoutDate = async () => {
    if (!blackoutSport || !blackoutDate || !blackoutReason.trim()) {
      Alert.alert('Error', 'Please fill all blackout date fields');
      return;
    }

    try {
      console.log('🚫 Creating blackout date:', {
        sport: blackoutSport,
        date: blackoutDate.toISOString().split('T')[0],
        reason: blackoutReason,
      });
      
      await SlotsService.createBlackoutDate({
        sport: blackoutSport,
        date: blackoutDate.toISOString().split('T')[0],
        reason: blackoutReason,
      });

      Alert.alert('Success', 'Blackout date created successfully');
      setShowBlackoutModal(false);
      setBlackoutSport(null);
      setBlackoutDate(null);
      setBlackoutReason('');
      loadData();
    } catch (error: any) {
      console.error('🚫 Blackout date error:', error);
      console.error('🚫 Error response:', error.response?.data);
      console.error('🚫 Error status:', error.response?.status);
      
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.detail || 
                          error.message || 
                          'Failed to create blackout date';
      
      Alert.alert('Error', `Blackout date creation failed:\\n${errorMessage}`);
    }
  };

  // Delete blackout date
  const handleDeleteBlackoutDate = async (id: number) => {
    Alert.alert(
      'Delete Blackout Date',
      'Are you sure you want to remove this blackout date?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await SlotsService.deleteBlackoutDate(id);
              Alert.alert('Success', 'Blackout date removed');
              loadData();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete blackout date');
            }
          },
        },
      ]
    );
  };

  // Toggle slot availability
  const handleToggleAvailability = async (slot: Slot) => {
    try {
      const newAvailability = !slot.is_available;
      await AdminService.updateSlot(slot.id, { is_available: newAvailability });
      
      Alert.alert(
        'Success',
        `Slot marked as ${newAvailability ? 'available' : 'unavailable'}`
      );
      loadData();
    } catch (error: any) {
      console.error('Toggle availability error:', error);
      Alert.alert('Error', 'Failed to update slot availability');
    }
  };

  // Delete slot
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
              console.log('🗑️ Deleting slot:', slotId);
              await AdminService.deleteSlot(slotId);
              console.log('✅ Slot deleted successfully');
              Alert.alert('Success', 'Slot deleted successfully');
              loadData();
            } catch (error: any) {
              console.error('❌ Delete slot error:', error);
              console.error('❌ Error response:', error.response?.data);
              console.error('❌ Error status:', error.response?.status);
              
              const errorMessage = error.response?.data?.error || 
                                  error.response?.data?.detail || 
                                  error.message || 
                                  'Failed to delete slot';
              
              Alert.alert('Error', `Delete failed:\\n${errorMessage}`);
            }
          },
        },
      ],
    );
  };

  const renderSlot = (slot: Slot) => {
    const isAvailable = slot.is_available !== false && !slot.is_booked;
    const statusColor = slot.is_booked 
      ? Colors.error 
      : isAvailable 
      ? Colors.success 
      : '#999';
    const statusText = slot.is_booked 
      ? 'Booked' 
      : isAvailable 
      ? 'Available' 
      : 'Unavailable';

    return (
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
              onPress={() => handleToggleAvailability(slot)}>
              <Icon 
                name={isAvailable ? "eye-slash" : "eye"} 
                size={18} 
                color={isAvailable ? "#999" : Colors.success} 
              />
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
            <Text style={styles.label}>Players:</Text>
            <Text style={styles.value}>{slot.current_players || 0}/{slot.max_players}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Status:</Text>
            <Text
              style={[
                styles.status,
                { backgroundColor: statusColor },
              ]}>
              {statusText}
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  if (loading) {
    return <Loading />;
  }

  // Apply filters and determine display logic
  const displaySlots = filteredSlots.length > 0 ? filteredSlots : slots;
  
  // Debug display logic
  console.log('📱 Display Logic Debug:');
  console.log('   Raw slots count:', slots.length);
  console.log('   Filtered slots count:', filteredSlots.length);
  console.log('   Display slots count:', displaySlots.length);
  
  if (displaySlots.length > 0) {
    console.log('   First few display slots:');
    displaySlots.slice(0, 5).forEach((slot, index) => {
      console.log(`     ${index + 1}. ${slot.sport_name} - ${slot.date} - ${slot.start_time}`);
    });
  }
  const hasActiveFilters = filterSport || filterStartDate || filterEndDate;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadData} />
        }>
        
        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: Colors.primary }]}
            onPress={() => setShowBulkGenerateModal(true)}>
            <Icon name="magic" size={18} color="#FFF" />
            <Text style={styles.actionButtonText}>Bulk Generate</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#F59E0B' }]}
            onPress={() => setShowFilterModal(true)}>
            <Icon name="filter" size={18} color="#FFF" />
            <Text style={styles.actionButtonText}>Filter{hasActiveFilters ? ' •' : ''}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#EF4444' }]}
            onPress={() => setShowBlackoutModal(true)}>
            <Icon name="ban" size={18} color="#FFF" />
            <Text style={styles.actionButtonText}>Blackout</Text>
          </TouchableOpacity>
        </View>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <View style={styles.activeFiltersContainer}>
            <Text style={styles.activeFiltersText}>
              Filters: {filterSport && sports.find(s => s.id === filterSport)?.name + ' • '}
              {filterStartDate && `From ${filterStartDate.toLocaleDateString()} • `}
              {filterEndDate && `To ${filterEndDate.toLocaleDateString()}`}
            </Text>
            <TouchableOpacity onPress={clearFilters}>
              <Text style={styles.clearFiltersText}>Clear All</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Blackout Dates List */}
        {blackoutDates.length > 0 && (
          <Card style={styles.blackoutSection}>
            <View style={styles.blackoutHeader}>
              <Icon name="ban" size={20} color="#EF4444" />
              <Text style={styles.blackoutTitle}>Active Blackout Dates</Text>
            </View>
            {blackoutDates.map((blackout) => (
              <View key={blackout.id} style={styles.blackoutItem}>
                <View style={{flex: 1}}>
                  <Text style={styles.blackoutDate}>
                    {formatDate(blackout.date)} - {blackout.sport_name || 'All Sports'}
                  </Text>
                  <Text style={styles.blackoutReason}>{blackout.reason}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDeleteBlackoutDate(blackout.id)}>
                  <Icon name="trash" size={16} color={Colors.error} />
                </TouchableOpacity>
              </View>
            ))}
          </Card>
        )}

        {/* Slots List */}
        <View style={styles.slotsList}>
          <Text style={styles.sectionTitle}>
            {hasActiveFilters ? `Filtered Slots (${displaySlots.length})` : `All Slots (${displaySlots.length})`}
          </Text>
          {displaySlots && displaySlots.length > 0 ? (
            displaySlots.map(renderSlot)
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="calendar-times-o" size={48} color="#CCC" />
              <Text style={styles.emptyText}>
                {hasActiveFilters ? 'No slots match your filters' : 'No slots available. Use Bulk Generate to create slots!'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bulk Generate Modal */}
      <Modal
        visible={showBulkGenerateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBulkGenerateModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bulk Generate Slots</Text>
              <TouchableOpacity onPress={() => setShowBulkGenerateModal(false)}>
                <Icon name="times" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
              Generate slots based on booking configuration for the selected sport and date range.
            </Text>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>Select Sport *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.sportSelector}>
                  {sports.map((sport) => (
                    <TouchableOpacity
                      key={sport.id}
                      style={[
                        styles.sportOption,
                        bulkSport === sport.id && styles.selectedSport,
                      ]}
                      onPress={() => {
                        console.log('🏏 Selected sport for bulk generation:', sport.id, sport.name);
                        setBulkSport(sport.id);
                      }}>
                      <Text
                        style={[
                          styles.sportOptionText,
                          bulkSport === sport.id && styles.selectedSportText,
                        ]}>
                        {sport.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>Start Date *</Text>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowBulkStartDatePicker(true)}>
                <Text style={bulkStartDate ? styles.dateText : styles.placeholderText}>
                  {bulkStartDate ? bulkStartDate.toLocaleDateString() : 'Select start date'}
                </Text>
                <Icon name="calendar" size={20} color={Colors.primary} />
              </TouchableOpacity>
              {showBulkStartDatePicker && (
                <DateTimePicker
                  value={bulkStartDate || new Date()}
                  mode="date"
                  display="default"
                  minimumDate={new Date()}
                  onChange={(event, date) => {
                    setShowBulkStartDatePicker(false);
                    if (event.type === 'set' && date) setBulkStartDate(date);
                  }}
                />
              )}
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>End Date *</Text>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowBulkEndDatePicker(true)}>
                <Text style={bulkEndDate ? styles.dateText : styles.placeholderText}>
                  {bulkEndDate ? bulkEndDate.toLocaleDateString() : 'Select end date'}
                </Text>
                <Icon name="calendar" size={20} color={Colors.primary} />
              </TouchableOpacity>
              {showBulkEndDatePicker && (
                <DateTimePicker
                  value={bulkEndDate || new Date()}
                  mode="date"
                  display="default"
                  minimumDate={bulkStartDate || new Date()}
                  onChange={(event, date) => {
                    setShowBulkEndDatePicker(false);
                    if (event.type === 'set' && date) setBulkEndDate(date);
                  }}
                />
              )}
            </View>

            <Button
              title="Generate Slots"
              onPress={handleBulkGenerate}
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilterModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Slots</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Icon name="times" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>Filter by Sport</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.sportSelector}>
                  {sports.map((sport) => (
                    <TouchableOpacity
                      key={sport.id}
                      style={[
                        styles.sportOption,
                        filterSport === sport.id && styles.selectedSport,
                      ]}
                      onPress={() => setFilterSport(sport.id)}>
                      <Text
                        style={[
                          styles.sportOptionText,
                          filterSport === sport.id && styles.selectedSportText,
                        ]}>
                        {sport.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>From Date</Text>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowFilterStartDatePicker(true)}>
                <Text style={filterStartDate ? styles.dateText : styles.placeholderText}>
                  {filterStartDate ? filterStartDate.toLocaleDateString() : 'Select start date'}
                </Text>
                <Icon name="calendar" size={20} color={Colors.primary} />
              </TouchableOpacity>
              {showFilterStartDatePicker && (
                <DateTimePicker
                  value={filterStartDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, date) => {
                    setShowFilterStartDatePicker(false);
                    if (event.type === 'set' && date) setFilterStartDate(date);
                  }}
                />
              )}
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>To Date</Text>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowFilterEndDatePicker(true)}>
                <Text style={filterEndDate ? styles.dateText : styles.placeholderText}>
                  {filterEndDate ? filterEndDate.toLocaleDateString() : 'Select end date'}
                </Text>
                <Icon name="calendar" size={20} color={Colors.primary} />
              </TouchableOpacity>
              {showFilterEndDatePicker && (
                <DateTimePicker
                  value={filterEndDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, date) => {
                    setShowFilterEndDatePicker(false);
                    if (event.type === 'set' && date) setFilterEndDate(date);
                  }}
                />
              )}
            </View>

            <View style={styles.modalButtonRow}>
              <Button
                title="Clear Filters"
                onPress={clearFilters}
                buttonStyle={[styles.modalButton, styles.secondaryButton]}
              />
              <Button
                title="Apply"
                onPress={() => setShowFilterModal(false)}
                buttonStyle={[styles.modalButton, { flex: 1 }]}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Blackout Date Modal */}
      <Modal
        visible={showBlackoutModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBlackoutModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Blackout Date</Text>
              <TouchableOpacity onPress={() => setShowBlackoutModal(false)}>
                <Icon name="times" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
              Block a specific date from accepting bookings. All slots on this date will be unavailable.
            </Text>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>Select Sport *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.sportSelector}>
                  {sports.map((sport) => (
                    <TouchableOpacity
                      key={sport.id}
                      style={[
                        styles.sportOption,
                        blackoutSport === sport.id && styles.selectedSport,
                      ]}
                      onPress={() => setBlackoutSport(sport.id)}>
                      <Text
                        style={[
                          styles.sportOptionText,
                          blackoutSport === sport.id && styles.selectedSportText,
                        ]}>
                        {sport.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>Date *</Text>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowBlackoutDatePicker(true)}>
                <Text style={blackoutDate ? styles.dateText : styles.placeholderText}>
                  {blackoutDate ? blackoutDate.toLocaleDateString() : 'Select blackout date'}
                </Text>
                <Icon name="calendar" size={20} color={Colors.primary} />
              </TouchableOpacity>
              {showBlackoutDatePicker && (
                <DateTimePicker
                  value={blackoutDate || new Date()}
                  mode="date"
                  display="default"
                  minimumDate={new Date()}
                  onChange={(event, date) => {
                    setShowBlackoutDatePicker(false);
                    if (event.type === 'set' && date) setBlackoutDate(date);
                  }}
                />
              )}
            </View>

            <View style={styles.formField}>
              <InputField
                label="Reason *"
                value={blackoutReason}
                onChangeText={setBlackoutReason}
                placeholder="e.g., Public Holiday, Maintenance"
                multiline
              />
            </View>

            <Button
              title="Create Blackout Date"
              onPress={handleCreateBlackoutDate}
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollView: {
    flex: 1,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  activeFiltersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
  },
  activeFiltersText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
  },
  clearFiltersText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  blackoutSection: {
    margin: 16,
    padding: 16,
  },
  blackoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  blackoutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  blackoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  blackoutDate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  blackoutReason: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  slotsList: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
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
    color: '#1F2937',
    marginBottom: 4,
  },
  dateTime: {
    fontSize: 14,
    color: '#6B7280',
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
    color: '#6B7280',
  },
  value: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  status: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    overflow: 'hidden',
    color: '#FFF',
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
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  formField: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
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
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedSport: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  sportOptionText: {
    color: '#1F2937',
    fontSize: 14,
  },
  selectedSportText: {
    color: '#FFF',
    fontWeight: '600',
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dateText: {
    fontSize: 16,
    color: '#1F2937',
  },
  placeholderText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  modalButton: {
    marginTop: 8,
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  secondaryButton: {
    backgroundColor: '#6B7280',
    flex: 1,
  },
});

export default ManageSlotsScreen;
