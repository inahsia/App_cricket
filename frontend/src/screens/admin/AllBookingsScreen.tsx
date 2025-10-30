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
import Colors from '../../config/colors';
import Card from '../../components/Card';
import Loading from '../../components/Loading';
import { AdminService } from '../../services/admin.service';
import { formatDate, formatTime, formatCurrency } from '../../utils/helpers';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Booking } from '../../types';
import { useRoute, RouteProp } from '@react-navigation/native';

type AllBookingsRouteParams = {
  AllBookings: {
    sportId?: number;
    sportName?: string;
  };
};

const AllBookingsScreen = () => {
  const route = useRoute<RouteProp<AllBookingsRouteParams, 'AllBookings'>>();
  const { sportId, sportName } = route.params || {};
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await AdminService.getAllBookings();
      const allBookings = Array.isArray(response) ? response : [];
      
      // Filter by sport if sportId is provided
      if (sportId) {
        const filtered = allBookings.filter(
          (booking: Booking) => booking.slot_details?.sport === sportId
        );
        setBookings(filtered);
      } else {
        setBookings(allBookings);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load bookings');
      setBookings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              await AdminService.cancelBooking(bookingId);
              Alert.alert('Success', 'Booking cancelled successfully');
              loadBookings();
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel booking');
            }
          },
        },
      ],
    );
  };

  const getBookingStatus = (booking: Booking): string => {
    if (booking.is_cancelled) return 'cancelled';
    if (booking.payment_verified) return 'confirmed';
    return 'pending';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      confirmed: Colors.success,
      pending: Colors.warning,
      cancelled: Colors.error,
    };
    return colors[status] || Colors.text.secondary;
  };

  const renderItem = ({ item }: { item: Booking }) => {
    const status = getBookingStatus(item);
    const userName = item.user_details?.first_name && item.user_details?.last_name
      ? `${item.user_details.first_name} ${item.user_details.last_name}`
      : item.user_details?.username || 'Unknown User';
    
    return (
    <Card style={styles.bookingCard}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.bookingId}>Booking #{item.id}</Text>
          <Text style={[styles.status, { color: getStatusColor(status) }]}>
            {status.toUpperCase()}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleCancelBooking(item.id)}
          disabled={item.is_cancelled}>
          <Icon name="trash" size={20} color={Colors.error} />
        </TouchableOpacity>
      </View>

      {/* Prominent User and Sport Info */}
      <View style={styles.prominentInfo}>
        <View style={styles.infoItem}>
          <Icon name="user" size={16} color={Colors.primary} style={styles.infoIcon} />
          <View>
            <Text style={styles.infoLabel}>Customer</Text>
            <Text style={styles.infoValue}>{userName}</Text>
            {item.user_details?.email && (
              <Text style={styles.infoSubtext}>{item.user_details.email}</Text>
            )}
          </View>
        </View>

        <View style={styles.infoItem}>
          <Icon name="futbol-o" size={16} color={Colors.primary} style={styles.infoIcon} />
          <View>
            <Text style={styles.infoLabel}>Sport</Text>
            <Text style={styles.infoValue}>{item.slot_details?.sport_name || 'N/A'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.details}>
        <View style={styles.row}>
          <Text style={styles.label}>Date:</Text>
          <Text style={styles.value}>
            {formatDate(item.slot_details?.date)}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Time:</Text>
          <Text style={styles.value}>
            {formatTime(item.slot_details?.start_time)} - {formatTime(item.slot_details?.end_time)}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Players:</Text>
          <Text style={styles.value}>{item.player_count || 0}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Amount:</Text>
          <Text style={styles.value}>{formatCurrency(item.amount_paid || '0')}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Organizer Check-In Count:</Text>
          <Text style={styles.value}>{item.organizer_check_in_count ?? 'N/A'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Organizer Status:</Text>
          <Text style={styles.value}>{item.organizer_status ?? (item.organizer_check_in_count === 0 ? 'Registered' : item.organizer_check_in_count === 1 ? 'Checked In' : item.organizer_check_in_count === 2 ? 'Checked Out' : 'N/A')}</Text>
        </View>
      </View>

      {!item.is_cancelled && (
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: Colors.error }]}
          onPress={() => handleCancelBooking(item.id)}>
          <Text style={styles.buttonText}>Cancel Booking</Text>
        </TouchableOpacity>
      )}
    </Card>
    );
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      {sportName && (
        <View style={styles.filterHeader}>
          <Icon name="filter" size={16} color={Colors.primary} />
          <Text style={styles.filterText}>Showing bookings for: {sportName}</Text>
        </View>
      )}
      <FlatList
      style={styles.container}
      data={bookings || []}
      renderItem={renderItem}
      keyExtractor={item => item.id.toString()}
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
    backgroundColor: Colors.background.default,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '15',
    padding: 12,
    gap: 8,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  bookingCard: {
    margin: 16,
    marginBottom: 8,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  bookingId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionButton: {
    padding: 8,
  },
  prominentInfo: {
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  infoSubtext: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 12,
  },
  details: {
    marginBottom: 16,
  },
  row: {
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
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.text.light,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
});

export default AllBookingsScreen;
