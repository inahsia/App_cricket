import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import BookingsService from '../../services/bookings.service';
import Card from '../../components/Card';
import Loading from '../../components/Loading';
import Colors from '../../config/colors';
import {formatCurrency, formatDate} from '../../utils/helpers';

const MyBookingsScreen = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await BookingsService.getMyBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load bookings');
      setBookings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadBookings();
  };

  const handleCancelBooking = (bookingId: number) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        {text: 'No', style: 'cancel'},
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              await BookingsService.cancelBooking(bookingId);
              Alert.alert('Success', 'Booking cancelled successfully');
              loadBookings();
            } catch (error: any) {
              Alert.alert(
                'Error',
                error.response?.data?.error || 'Failed to cancel booking',
              );
            }
          },
        },
      ],
    );
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return Colors.success;
      case 'pending':
        return Colors.warning;
      case 'cancelled':
        return Colors.error;
      default:
        return Colors.text.secondary;
    }
  };

  const renderBooking = ({item}: {item: any}) => (
    <Card style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <Text style={styles.sportName}>{item.slot_details?.sport_name || 'N/A'}</Text>
        <View
          style={[
            styles.statusBadge,
            {backgroundColor: getStatusColor(item.status)},
          ]}>
          <Text style={styles.statusText}>{item.status || 'Confirmed'}</Text>
        </View>
      </View>

      <Text style={styles.date}>{formatDate(item.slot_details?.date)}</Text>
      <Text style={styles.time}>
        {item.slot_details?.start_time} - {item.slot_details?.end_time}
      </Text>

      <View style={styles.divider} />

      <View style={styles.detailRow}>
        <Text style={styles.label}>Players:</Text>
        <Text style={styles.value}>{item.players?.length || 0}</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.label}>Total Amount:</Text>
        <Text style={styles.price}>{formatCurrency(item.amount_paid || '0')}</Text>
      </View>

      {/* Payment status can be added here if available */}

      {item.status === 'confirmed' && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => handleCancelBooking(item.id)}>
          <Text style={styles.cancelButtonText}>Cancel Booking</Text>
        </TouchableOpacity>
      )}
    </Card>
  );

  if (loading) {
    return <Loading />;
  }

  if (bookings.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📅</Text>
        <Text style={styles.emptyText}>No bookings yet</Text>
        <Text style={styles.emptySubtext}>
          Start by browsing available sports
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={bookings || []}
      renderItem={renderBooking}
      keyExtractor={item => item.id.toString()}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: Colors.background.default,
  },
  bookingCard: {
    marginBottom: 16,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sportName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: Colors.text.light,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  date: {
    fontSize: 16,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  time: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  cancelButton: {
    marginTop: 12,
    padding: 12,
    backgroundColor: Colors.error,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: Colors.text.light,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.default,
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});

export default MyBookingsScreen;
