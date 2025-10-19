import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Card, SearchBar } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import ApiService from '../../services/api.service';
import { format } from 'date-fns';

const AdminBookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, [filterStatus]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const params = {
        status: filterStatus !== 'all' ? filterStatus : undefined,
        search: searchQuery || undefined,
      };
      const response = await ApiService.get('/bookings/', { params });
      setBookings(response);
      setLoading(false);
    } catch (error) {
      console.error('Error loading bookings:', error);
      Alert.alert('Error', 'Failed to load bookings');
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await ApiService.patch(`/bookings/${bookingId}/`, { status: newStatus });
      loadBookings(); // Reload the list
      Alert.alert('Success', 'Booking status updated successfully');
    } catch (error) {
      console.error('Error updating booking:', error);
      Alert.alert('Error', 'Failed to update booking status');
    }
  };

  const renderStatusBadge = (status) => {
    const statusColors = {
      pending: '#FCD34D',
      confirmed: '#34D399',
      cancelled: '#EF4444',
      completed: '#60A5FA',
    };

    return (
      <View
        style={[
          styles.statusBadge,
          { backgroundColor: statusColors[status] || '#6B7280' },
        ]}
      >
        <Text style={styles.statusText}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Text>
      </View>
    );
  };

  const renderBookingItem = ({ item }) => (
    <Card containerStyle={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View>
          <Text style={styles.sportName}>{item.sport.name}</Text>
          <Text style={styles.dateText}>
            {format(new Date(item.slot.date), 'MMM dd, yyyy')}
          </Text>
        </View>
        {renderStatusBadge(item.status)}
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <Icon name="user" size={16} color="#6B7280" />
          <Text style={styles.detailText}>
            {item.user.first_name} {item.user.last_name}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="clock-o" size={16} color="#6B7280" />
          <Text style={styles.detailText}>
            {item.slot.start_time} - {item.slot.end_time}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="inr" size={16} color="#6B7280" />
          <Text style={styles.detailText}>{item.amount_paid}</Text>
        </View>
      </View>

      {item.status === 'pending' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.confirmButton]}
            onPress={() => handleStatusChange(item.id, 'confirmed')}
          >
            <Icon name="check" size={16} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Confirm</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => handleStatusChange(item.id, 'cancelled')}
          >
            <Icon name="times" size={16} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </Card>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {['all', 'pending', 'confirmed', 'cancelled', 'completed'].map(
          (status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterButton,
                filterStatus === status && styles.filterButtonActive,
              ]}
              onPress={() => setFilterStatus(status)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filterStatus === status && styles.filterButtonTextActive,
                ]}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          )
        )}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <SearchBar
        placeholder="Search bookings..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        onSubmitEditing={loadBookings}
        platform="ios"
        containerStyle={styles.searchContainer}
        inputContainerStyle={styles.searchInputContainer}
      />

      {renderFilters()}

      <FlatList
        data={bookings}
        renderItem={renderBookingItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadBookings} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No bookings found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  searchContainer: {
    backgroundColor: 'transparent',
    borderBottomColor: 'transparent',
    borderTopColor: 'transparent',
    padding: 8,
  },
  searchInputContainer: {
    backgroundColor: '#FFFFFF',
  },
  filtersContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#F3F4F6',
  },
  filterButtonActive: {
    backgroundColor: '#2563EB',
  },
  filterButtonText: {
    color: '#6B7280',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  bookingCard: {
    borderRadius: 8,
    padding: 16,
    margin: 8,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sportName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  dateText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  bookingDetails: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  detailText: {
    marginLeft: 8,
    color: '#6B7280',
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginLeft: 8,
  },
  confirmButton: {
    backgroundColor: '#10B981',
  },
  cancelButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    color: '#FFFFFF',
    marginLeft: 4,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 16,
  },
});

export default AdminBookingHistory;