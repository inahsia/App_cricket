import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  RefreshControl,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Card from '../../components/Card';
import Loading from '../../components/Loading';
import Button from '../../components/Button';
import InputField from '../../components/InputField';
import Colors from '../../config/colors';
import SportsService from '../../services/sports.service';
import BookingConfigService, { CreateBookingConfigData, BookingConfig } from '../../services/booking-config.service';
import {Sport} from '../../types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import StorageService from '../../utils/storage';

type AdminStackParamList = {
  ManageSports: undefined;
  AllBookings: { sportId?: number; sportName?: string };
  ManageSlots: { sportId: number; sportName: string };
};

type NavigationProp = NativeStackNavigationProp<AdminStackParamList>;

const ManageSportsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingSport, setEditingSport] = useState<Sport | null>(null);
  const [currentStep, setCurrentStep] = useState<'sport' | 'booking'>('sport');
  const [viewConfigModal, setViewConfigModal] = useState(false);
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
  const [bookingConfig, setBookingConfig] = useState<BookingConfig | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(false);

  // Sport form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [pricePerHour, setPricePerHour] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('60');
  const [maxPlayers, setMaxPlayers] = useState('10');
  const [isActive, setIsActive] = useState(true);

  // Booking configuration state
  const [opensAt, setOpensAt] = useState('06:00');
  const [closesAt, setClosesAt] = useState('22:00');
  const [slotDuration, setSlotDuration] = useState<30 | 60 | 120 | 240>(60);
  const [advanceBookingDays, setAdvanceBookingDays] = useState<1 | 3 | 7 | 15 | 30>(7);
  const [minBookingDuration, setMinBookingDuration] = useState('1');
  const [maxBookingDuration, setMaxBookingDuration] = useState('4');
  const [bufferTime, setBufferTime] = useState('0');
  
  // Advanced booking options
  const [differentWeekendTimings, setDifferentWeekendTimings] = useState(false);
  const [weekendOpensAt, setWeekendOpensAt] = useState('08:00');
  const [weekendClosesAt, setWeekendClosesAt] = useState('20:00');
  const [peakHourPricing, setPeakHourPricing] = useState(false);
  const [peakStartTime, setPeakStartTime] = useState('18:00');
  const [peakEndTime, setPeakEndTime] = useState('21:00');
  const [peakPriceMultiplier, setPeakPriceMultiplier] = useState('1.5');
  const [weekendPricing, setWeekendPricing] = useState(false);
  const [weekendPriceMultiplier, setWeekendPriceMultiplier] = useState('1.3');

  useEffect(() => {
    fetchSports();
  }, []);

  const fetchSports = async () => {
    try {
      // Debug: Check token before fetching
      const token = await StorageService.getAuthToken();
      console.log('🔐 Token check before fetchSports:', token ? 'EXISTS' : 'MISSING');
      
      const data = await SportsService.getAllSports();
      setSports(Array.isArray(data) ? data : []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load sports');
      setSports([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchSports();
  };

  const openCreateModal = () => {
    setEditingSport(null);
    setCurrentStep('sport');
    resetForm();
    setModalVisible(true);
  };

  const resetForm = () => {
    // Sport fields
    setName('');
    setDescription('');
    setPricePerHour('');
    setDurationMinutes('60');
    setMaxPlayers('10');
    setIsActive(true);
    
    // Booking fields
    setOpensAt('06:00');
    setClosesAt('22:00');
    setSlotDuration(60);
    setAdvanceBookingDays(7);
    setMinBookingDuration('1');
    setMaxBookingDuration('4');
    setBufferTime('0');
    setDifferentWeekendTimings(false);
    setWeekendOpensAt('08:00');
    setWeekendClosesAt('20:00');
    setPeakHourPricing(false);
    setPeakStartTime('18:00');
    setPeakEndTime('21:00');
    setPeakPriceMultiplier('1.5');
    setWeekendPricing(false);
    setWeekendPriceMultiplier('1.3');
  };

  const openEditModal = (sport: Sport) => {
    setEditingSport(sport);
    setCurrentStep('sport');
    setName(sport.name || '');
    setDescription(sport.description || '');
    setPricePerHour(sport.price_per_hour?.toString() || '');
    setDurationMinutes(sport.duration?.toString() || '60');
    setMaxPlayers(sport.max_players?.toString() || '10');
    setIsActive(sport.is_active !== undefined ? sport.is_active : true);
    
    // Load booking configuration if editing
    loadBookingConfig(sport.id);
    setModalVisible(true);
  };

  const loadBookingConfig = async (sportId: number) => {
    try {
      const config = await BookingConfigService.getBookingConfig(sportId);
      if (config) {
        setOpensAt(config.opens_at);
        setClosesAt(config.closes_at);
        setSlotDuration(config.slot_duration as 30 | 60 | 120 | 240);
        setAdvanceBookingDays(config.advance_booking_days as 1 | 3 | 7 | 15 | 30);
        setMinBookingDuration(config.min_booking_duration.toString());
        setMaxBookingDuration(config.max_booking_duration.toString());
        setBufferTime(config.buffer_time.toString());
        setDifferentWeekendTimings(config.different_weekend_timings);
        setWeekendOpensAt(config.weekend_opens_at || '08:00');
        setWeekendClosesAt(config.weekend_closes_at || '20:00');
        setPeakHourPricing(config.peak_hour_pricing);
        setPeakStartTime(config.peak_start_time || '18:00');
        setPeakEndTime(config.peak_end_time || '21:00');
        setPeakPriceMultiplier(config.peak_price_multiplier);
        setWeekendPricing(config.weekend_pricing);
        setWeekendPriceMultiplier(config.weekend_price_multiplier);
      }
    } catch (error) {
      console.log('No booking config found for this sport');
    }
  };

  const handleCreateOrUpdate = async () => {
    if (currentStep === 'sport') {
      // Validate sport details
      if (!name.trim()) {
        Alert.alert('Validation', 'Please enter sport name');
        return;
      }
      
      const payload: Partial<Sport> = {
        name: name.trim(),
        description: description.trim(),
        price_per_hour: pricePerHour || '0',
        duration: parseInt(durationMinutes, 10),
        max_players: parseInt(maxPlayers, 10),
        is_active: isActive,
      };

      try {
        setCreating(true);
        let sport: Sport;
        
        if (editingSport) {
          sport = await SportsService.updateSport(editingSport.id, payload);
          setSports(prev => prev.map(s => s.id === sport.id ? sport : s));
        } else {
          sport = await SportsService.createSport(payload);
          setSports(prev => [sport, ...prev]);
        }
        
        // Move to booking configuration step
        setEditingSport(sport);
        setCurrentStep('booking');
      } catch (error) {
        Alert.alert('Error', editingSport ? 'Failed to update sport' : 'Failed to create sport');
      } finally {
        setCreating(false);
      }
    } else {
      // Save booking configuration
      await handleSaveBookingConfig();
    }
  };

  const handleSaveBookingConfig = async () => {
    if (!editingSport) {
      Alert.alert('Error', 'Sport must be created first');
      return;
    }

    const configData: CreateBookingConfigData = {
      sport: editingSport.id,
      opens_at: opensAt,
      closes_at: closesAt,
      slot_duration: slotDuration,
      advance_booking_days: advanceBookingDays,
      min_booking_duration: parseInt(minBookingDuration, 10),
      max_booking_duration: parseInt(maxBookingDuration, 10),
      buffer_time: parseInt(bufferTime, 10),
      different_weekend_timings: differentWeekendTimings,
      weekend_opens_at: differentWeekendTimings ? weekendOpensAt : null,
      weekend_closes_at: differentWeekendTimings ? weekendClosesAt : null,
      peak_hour_pricing: peakHourPricing,
      peak_start_time: peakHourPricing ? peakStartTime : null,
      peak_end_time: peakHourPricing ? peakEndTime : null,
      peak_price_multiplier: parseFloat(peakPriceMultiplier),
      weekend_pricing: weekendPricing,
      weekend_price_multiplier: parseFloat(weekendPriceMultiplier),
    };

    console.log('📤 Sending booking config data:', configData);

    try {
      setCreating(true);
      
      // Try to get existing config
      let existingConfig = null;
      try {
        console.log('🔍 Checking for existing config for sport:', editingSport.id);
        existingConfig = await BookingConfigService.getBookingConfig(editingSport.id);
        console.log('✅ Found existing config:', existingConfig?.id);
      } catch (error) {
        console.log('ℹ️ No existing config found, will create new one');
      }
      
      if (existingConfig && existingConfig.id) {
        console.log('📝 Updating existing config ID:', existingConfig.id);
        // Remove sport field for update (can't change sport)
        const { sport, ...updateData } = configData;
        await BookingConfigService.updateBookingConfig(existingConfig.id, updateData);
        Alert.alert(
          'Success', 
          'Sport and booking configuration updated successfully',
          [
            { text: 'OK', onPress: () => {
              setModalVisible(false);
              setEditingSport(null);
              setCurrentStep('sport');
              fetchSports();
            }}
          ]
        );
      } else {
        console.log('➕ Creating new booking config');
        try {
          const createdConfig = await BookingConfigService.create(configData);
          console.log('✅ Created config:', createdConfig);
        } catch (createError: any) {
          // If creation fails due to existing config, try to fetch and update
          if (createError.response?.status === 400 || createError.response?.data?.sport) {
            console.log('⚠️ Config already exists, fetching and updating instead...');
            existingConfig = await BookingConfigService.getBookingConfig(editingSport.id);
            if (existingConfig && existingConfig.id) {
              const { sport, ...updateData } = configData;
              await BookingConfigService.updateBookingConfig(existingConfig.id, updateData);
              Alert.alert('Success', 'Sport and booking configuration updated successfully');
              setModalVisible(false);
              setEditingSport(null);
              setCurrentStep('sport');
              fetchSports();
              return;
            }
          }
          throw createError;
        }
        Alert.alert(
          'Success!', 
          'Sport and booking configuration created successfully. What would you like to do next?',
          [
            { text: 'Add Another Sport', onPress: () => {
              setModalVisible(false);
              setEditingSport(null);
              setCurrentStep('sport');
              fetchSports();
              setTimeout(() => openCreateModal(), 300);
            }},
            { text: 'Manage Bookings', onPress: () => {
              setModalVisible(false);
              setEditingSport(null);
              setCurrentStep('sport');
              fetchSports();
              setTimeout(() => navigation.navigate('AllBookings', { 
                sportId: editingSport.id, 
                sportName: editingSport.name 
              }), 300);
            }},
            { text: 'Done', style: 'cancel', onPress: () => {
              setModalVisible(false);
              setEditingSport(null);
              setCurrentStep('sport');
              fetchSports();
            }}
          ]
        );
      }
    } catch (error: any) {
      console.error('❌ Error saving booking config:', error);
      console.error('Response data:', error.response?.data);
      console.error('Status:', error.response?.status);
      
      // Extract detailed error message
      let errorMessage = 'Failed to save booking configuration';
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else {
          // Show validation errors if available
          const errors = Object.entries(error.response.data)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');
          errorMessage = errors || 'Failed to save booking configuration';
        }
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = (sport: Sport) => {
    Alert.alert('Delete Sport', `Delete "${sport.name}"?`, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await SportsService.deleteSport(sport.id);
            setSports(prev => prev.filter(s => s.id !== sport.id));
          } catch (error) {
            Alert.alert('Error', 'Failed to delete sport');
          }
        },
      },
    ]);
  };

  const handleViewConfig = async (sport: Sport) => {
    setSelectedSport(sport);
    setLoadingConfig(true);
    setViewConfigModal(true);
    
    try {
      const config = await BookingConfigService.getBookingConfig(sport.id);
      setBookingConfig(config);
    } catch (error) {
      setBookingConfig(null);
    } finally {
      setLoadingConfig(false);
    }
  };

  const handleManageBookings = (sport: Sport) => {
    navigation.navigate('AllBookings', { 
      sportId: sport.id, 
      sportName: sport.name 
    });
  };

  const renderSport = ({item}: {item: Sport}) => (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.sportInfo}>
          <Text style={styles.sportName}>{item.name}</Text>
          <View style={[styles.badge, item.is_active ? styles.badgeActive : styles.badgeInactive]}>
            <Text style={[styles.badgeText, item.is_active ? styles.badgeTextActive : styles.badgeTextInactive]}>
              {item.is_active ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>
        <Text style={styles.price}>{`₹ ${item.price_per_hour}/hour`}</Text>
      </View>
      
      <Text style={styles.description}>{item.description}</Text>
      
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickActionButton} onPress={() => handleViewConfig(item)}>
          <Icon name="gear" size={16} color={Colors.primary} />
          <Text style={styles.quickActionText}>Config</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionButton} onPress={() => handleManageBookings(item)}>
          <Icon name="calendar" size={16} color={Colors.primary} />
          <Text style={styles.quickActionText}>Bookings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionButton} onPress={() => openEditModal(item)}>
          <Icon name="edit" size={16} color={Colors.primary} />
          <Text style={styles.quickActionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionButton} onPress={() => handleDelete(item)}>
          <Icon name="trash" size={16} color={Colors.error} />
          <Text style={[styles.quickActionText, {color: Colors.error}]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  if (loading) return <Loading />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Manage Sports</Text>
        <Text style={styles.headerSubtitle}>Add, edit or remove sports</Text>
      </View>

      <View style={styles.toolbar}>
        <Button title="Add Sport" onPress={openCreateModal} />
        <TouchableOpacity onPress={onRefresh} style={styles.refreshTouchable}>
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={sports || []}
        renderItem={renderSport}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No sports found</Text>
            </View>
          ) : null
        }
      />

      <Modal visible={modalVisible} animationType="slide" transparent={false} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.fullScreenModal}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => {
              if (currentStep === 'booking') {
                setCurrentStep('sport');
              } else {
                setModalVisible(false);
                setEditingSport(null);
                setCurrentStep('sport');
              }
            }}>
              <Text style={styles.backButton}>{currentStep === 'booking' ? '← Back' : '× Close'}</Text>
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>
              {editingSport ? 'Edit Sport' : 'Create Sport'}
            </Text>
            <View style={{width: 60}} />
          </View>

          {/* Step Indicator */}
          <View style={styles.stepIndicator}>
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, currentStep === 'sport' && styles.stepCircleActive]}>
                <Text style={[styles.stepNumber, currentStep === 'sport' && styles.stepNumberActive]}>1</Text>
              </View>
              <Text style={styles.stepLabel}>Sport Details</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, currentStep === 'booking' && styles.stepCircleActive]}>
                <Text style={[styles.stepNumber, currentStep === 'booking' && styles.stepNumberActive]}>2</Text>
              </View>
              <Text style={styles.stepLabel}>Booking Config</Text>
            </View>
          </View>

          <ScrollView style={styles.modalScroll}>
            {currentStep === 'sport' ? (
              // Step 1: Sport Details
              <View style={styles.stepContent}>
                <Text style={styles.sectionTitle}>Basic Information</Text>
                <InputField label="Sport Name *" value={name} onChangeText={setName} placeholder="e.g., Cricket Net Practice" />
                <InputField label="Description" value={description} onChangeText={setDescription} placeholder="Brief description of the sport" multiline numberOfLines={3} />
                
                <Text style={styles.sectionTitle}>Pricing & Capacity</Text>
                <InputField label="Price per Hour (₹) *" value={pricePerHour} onChangeText={setPricePerHour} placeholder="500" keyboardType="numeric" />
                <InputField label="Default Duration (minutes)" value={durationMinutes} onChangeText={setDurationMinutes} placeholder="60" keyboardType="numeric" />
                <InputField label="Max Players *" value={maxPlayers} onChangeText={setMaxPlayers} placeholder="10" keyboardType="numeric" />
                
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Active (visible to users)</Text>
                  <Switch value={isActive} onValueChange={setIsActive} trackColor={{false: '#767577', true: Colors.primary}} />
                </View>
              </View>
            ) : (
              // Step 2: Booking Configuration
              <View style={styles.stepContent}>
                <Text style={styles.sectionTitle}>Operating Hours</Text>
                <View style={styles.rowInputs}>
                  <View style={styles.halfWidth}>
                    <InputField label="Opens At" value={opensAt} onChangeText={setOpensAt} placeholder="06:00" />
                  </View>
                  <View style={styles.halfWidth}>
                    <InputField label="Closes At" value={closesAt} onChangeText={setClosesAt} placeholder="22:00" />
                  </View>
                </View>
                <InputField label="Buffer Time (minutes)" value={bufferTime} onChangeText={setBufferTime} placeholder="0" keyboardType="numeric" />
                
                <Text style={styles.sectionTitle}>Slot Duration</Text>
                <View style={styles.optionsRow}>
                  {[30, 60, 120, 240].map(duration => (
                    <TouchableOpacity
                      key={duration}
                      style={[styles.optionButton, slotDuration === duration && styles.optionButtonActive]}
                      onPress={() => setSlotDuration(duration as any)}>
                      <Text style={[styles.optionText, slotDuration === duration && styles.optionTextActive]}>
                        {duration < 60 ? `${duration} min` : `${duration / 60} hr${duration > 60 ? 's' : ''}`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <Text style={styles.sectionTitle}>Booking Window</Text>
                <View style={styles.optionsRow}>
                  {[1, 3, 7, 15, 30].map(days => (
                    <TouchableOpacity
                      key={days}
                      style={[styles.optionButton, advanceBookingDays === days && styles.optionButtonActive]}
                      onPress={() => setAdvanceBookingDays(days as any)}>
                      <Text style={[styles.optionText, advanceBookingDays === days && styles.optionTextActive]}>
                        {days} {days === 1 ? 'day' : 'days'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <Text style={styles.sectionTitle}>Duration Limits</Text>
                <View style={styles.rowInputs}>
                  <View style={styles.halfWidth}>
                    <InputField label="Min Duration (hrs)" value={minBookingDuration} onChangeText={setMinBookingDuration} placeholder="1" keyboardType="numeric" />
                  </View>
                  <View style={styles.halfWidth}>
                    <InputField label="Max Duration (hrs)" value={maxBookingDuration} onChangeText={setMaxBookingDuration} placeholder="4" keyboardType="numeric" />
                  </View>
                </View>
                
                <Text style={styles.sectionTitle}>Advanced Options</Text>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Different Weekend Timings</Text>
                  <Switch value={differentWeekendTimings} onValueChange={setDifferentWeekendTimings} trackColor={{false: '#767577', true: Colors.primary}} />
                </View>
                {differentWeekendTimings && (
                  <View style={styles.rowInputs}>
                    <View style={styles.halfWidth}>
                      <InputField label="Weekend Opens" value={weekendOpensAt} onChangeText={setWeekendOpensAt} placeholder="08:00" />
                    </View>
                    <View style={styles.halfWidth}>
                      <InputField label="Weekend Closes" value={weekendClosesAt} onChangeText={setWeekendClosesAt} placeholder="20:00" />
                    </View>
                  </View>
                )}
                
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Peak Hour Pricing</Text>
                  <Switch value={peakHourPricing} onValueChange={setPeakHourPricing} trackColor={{false: '#767577', true: Colors.primary}} />
                </View>
                {peakHourPricing && (
                  <>
                    <View style={styles.rowInputs}>
                      <View style={styles.halfWidth}>
                        <InputField label="Peak Start" value={peakStartTime} onChangeText={setPeakStartTime} placeholder="18:00" />
                      </View>
                      <View style={styles.halfWidth}>
                        <InputField label="Peak End" value={peakEndTime} onChangeText={setPeakEndTime} placeholder="21:00" />
                      </View>
                    </View>
                    <InputField label="Peak Multiplier" value={peakPriceMultiplier} onChangeText={setPeakPriceMultiplier} placeholder="1.5" keyboardType="decimal-pad" />
                  </>
                )}
                
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Weekend Pricing</Text>
                  <Switch value={weekendPricing} onValueChange={setWeekendPricing} trackColor={{false: '#767577', true: Colors.primary}} />
                </View>
                {weekendPricing && (
                  <InputField label="Weekend Multiplier" value={weekendPriceMultiplier} onChangeText={setWeekendPriceMultiplier} placeholder="1.3" keyboardType="decimal-pad" />
                )}
              </View>
            )}
          </ScrollView>

          {/* Modal Actions */}
          <View style={styles.modalFooter}>
            {currentStep === 'sport' ? (
              <Button title="Next: Booking Config" onPress={handleCreateOrUpdate} loading={creating} style={{flex: 1}} />
            ) : (
              <View style={styles.footerButtons}>
                <Button title="Back" onPress={() => setCurrentStep('sport')} variant="outline" style={{flex: 1}} />
                <Button title="Save Sport" onPress={handleCreateOrUpdate} loading={creating} style={{flex: 1}} />
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* View Config Modal */}
      <Modal visible={viewConfigModal} animationType="slide" transparent={true} onRequestClose={() => setViewConfigModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.configModalContainer}>
            <View style={styles.configModalHeader}>
              <Text style={styles.configModalTitle}>{selectedSport?.name} - Booking Configuration</Text>
              <TouchableOpacity onPress={() => setViewConfigModal(false)}>
                <Icon name="times" size={24} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.configModalContent}>
              {loadingConfig ? (
                <Loading />
              ) : bookingConfig ? (
                <>
                  <View style={styles.configSection}>
                    <Text style={styles.configSectionTitle}>Operating Hours</Text>
                    <View style={styles.configRow}>
                      <Text style={styles.configLabel}>Weekdays:</Text>
                      <Text style={styles.configValue}>{bookingConfig.opens_at} - {bookingConfig.closes_at}</Text>
                    </View>
                    {bookingConfig.different_weekend_timings && (
                      <View style={styles.configRow}>
                        <Text style={styles.configLabel}>Weekends:</Text>
                        <Text style={styles.configValue}>{bookingConfig.weekend_opens_at} - {bookingConfig.weekend_closes_at}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.configSection}>
                    <Text style={styles.configSectionTitle}>Slot Settings</Text>
                    <View style={styles.configRow}>
                      <Text style={styles.configLabel}>Slot Duration:</Text>
                      <Text style={styles.configValue}>{bookingConfig.slot_duration} minutes</Text>
                    </View>
                    <View style={styles.configRow}>
                      <Text style={styles.configLabel}>Buffer Time:</Text>
                      <Text style={styles.configValue}>{bookingConfig.buffer_time} minutes</Text>
                    </View>
                    <View style={styles.configRow}>
                      <Text style={styles.configLabel}>Advance Booking:</Text>
                      <Text style={styles.configValue}>{bookingConfig.advance_booking_days} days</Text>
                    </View>
                  </View>

                  <View style={styles.configSection}>
                    <Text style={styles.configSectionTitle}>Duration Limits</Text>
                    <View style={styles.configRow}>
                      <Text style={styles.configLabel}>Min Duration:</Text>
                      <Text style={styles.configValue}>{bookingConfig.min_booking_duration} hour(s)</Text>
                    </View>
                    <View style={styles.configRow}>
                      <Text style={styles.configLabel}>Max Duration:</Text>
                      <Text style={styles.configValue}>{bookingConfig.max_booking_duration} hour(s)</Text>
                    </View>
                  </View>

                  {bookingConfig.peak_hour_pricing && (
                    <View style={styles.configSection}>
                      <Text style={styles.configSectionTitle}>Peak Hour Pricing</Text>
                      <View style={styles.configRow}>
                        <Text style={styles.configLabel}>Peak Hours:</Text>
                        <Text style={styles.configValue}>{bookingConfig.peak_start_time} - {bookingConfig.peak_end_time}</Text>
                      </View>
                      <View style={styles.configRow}>
                        <Text style={styles.configLabel}>Multiplier:</Text>
                        <Text style={styles.configValue}>{bookingConfig.peak_price_multiplier}x</Text>
                      </View>
                    </View>
                  )}

                  {bookingConfig.weekend_pricing && (
                    <View style={styles.configSection}>
                      <Text style={styles.configSectionTitle}>Weekend Pricing</Text>
                      <View style={styles.configRow}>
                        <Text style={styles.configLabel}>Multiplier:</Text>
                        <Text style={styles.configValue}>{bookingConfig.weekend_price_multiplier}x</Text>
                      </View>
                    </View>
                  )}

                  <Button 
                    title="Edit Configuration" 
                    onPress={() => {
                      setViewConfigModal(false);
                      if (selectedSport) openEditModal(selectedSport);
                    }} 
                    style={{marginTop: 16}}
                  />
                </>
              ) : (
                <View style={styles.noConfigContainer}>
                  <Icon name="exclamation-circle" size={48} color={Colors.text.secondary} />
                  <Text style={styles.noConfigText}>No booking configuration found</Text>
                  <Button 
                    title="Create Configuration" 
                    onPress={() => {
                      setViewConfigModal(false);
                      if (selectedSport) openEditModal(selectedSport);
                    }} 
                    style={{marginTop: 16}}
                  />
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.light,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.text.light,
    opacity: 0.9,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  refreshTouchable: {
    padding: 8,
  },
  refreshText: {
    color: Colors.primary,
    fontWeight: '700',
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  sportInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sportName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeActive: {
    backgroundColor: '#DEF7EC',
  },
  badgeInactive: {
    backgroundColor: '#FEE2E2',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  badgeTextActive: {
    color: '#03543F',
  },
  badgeTextInactive: {
    color: '#991B1B',
  },
  description: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 12,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
    marginTop: 8,
  },
  quickActionButton: {
    alignItems: 'center',
    gap: 4,
  },
  quickActionText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  // Full Screen Modal Styles
  fullScreenModal: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.primary,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    color: Colors.text.light,
    fontSize: 16,
    fontWeight: '600',
    width: 60,
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.light,
    flex: 1,
    textAlign: 'center',
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.surface,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepCircleActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  stepNumberActive: {
    color: Colors.text.light,
  },
  stepLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  stepLine: {
    width: 60,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
    marginBottom: 24,
  },
  modalScroll: {
    flex: 1,
  },
  stepContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
    marginTop: 16,
    marginBottom: 12,
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 15,
    color: Colors.text.primary,
    flex: 1,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  optionButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionText: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  optionTextActive: {
    color: Colors.text.light,
    fontWeight: '600',
  },
  modalFooter: {
    padding: 16,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  configModalContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    maxHeight: '80%',
    width: '90%',
    overflow: 'hidden',
  },
  configModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.primary,
  },
  configModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.light,
    flex: 1,
  },
  configModalContent: {
    padding: 16,
  },
  configSection: {
    marginBottom: 20,
  },
  configSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  configRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  configLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  configValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  noConfigContainer: {
    alignItems: 'center',
    padding: 32,
  },
  noConfigText: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginTop: 16,
  },
});

export default ManageSportsScreen;
