/**
 * PlayerBookingsScreen - Shows all bookings for the logged-in player
 * 
 * This screen displays:
 * - List of all bookings where the player is registered
 * - Booking details: date, time, sport, organizer
 * - Player's check-in status for each booking
 * - QR code for each booking
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import ApiService from '../../services/api.service';
import Colors from '../../config/colors';
import Card from '../../components/Card';
import Loading from '../../components/Loading';
import { Player } from '../../types';

interface PlayerBooking extends Player {
  booking_details: {
    id: number;
    slot_date: string;
    sport: string;
    start_time: string;
    end_time: string;
    organizer?: string;
    organizer_name?: string;
  };
}

const PlayerBookingsScreen: React.FC = () => {
  const [bookings, setBookings] = useState<PlayerBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      // Get player profiles which include booking details
      const playerData = await ApiService.get<PlayerBooking[]>('/players/me/');
      
      // API now returns an array of player records
      setBookings(Array.isArray(playerData) ? playerData : []);
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to load bookings'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string): string => {
    if (!timeString) return 'N/A';
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusColor = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'checked in':
        return Colors.success;
      case 'checked out':
        return Colors.warning;
      case 'registered':
        return Colors.primary;
      default:
        return Colors.text.secondary;
    }
  };

  const getStatusIcon = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'checked in':
        return 'check-circle';
      case 'checked out':
        return 'exit-to-app';
      case 'registered':
        return 'person';
      default:
        return 'help';
    }
  };

  const isUpcoming = (dateString: string): boolean => {
    const bookingDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return bookingDate >= today;
  };

  const isPast = (dateString: string): boolean => {
    const bookingDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return bookingDate < today;
  };

  const isToday = (dateString: string): boolean => {
    const bookingDate = new Date(dateString).toDateString();
    const today = new Date().toDateString();
    return bookingDate === today;
  };

  if (loading && bookings.length === 0) {
    return <Loading />;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <Text style={styles.headerSubtitle}>
          View all your registered sports bookings
        </Text>
      </View>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Icon name="event-busy" size={64} color={Colors.text.secondary} />
          <Text style={styles.emptyTitle}>No Bookings Found</Text>
          <Text style={styles.emptyText}>
            You don't have any active bookings yet.{'\n'}
            Your bookings will appear here once the organizer adds you.
          </Text>
        </Card>
      ) : (
        bookings.map((booking) => (
          <Card key={booking.id} style={styles.bookingCard}>
            {/* Date Badge */}
            {isToday(booking.booking_details.slot_date) && (
              <View style={styles.todayBadge}>
                <Text style={styles.todayBadgeText}>TODAY</Text>
              </View>
            )}

            {/* Sport & Status */}
            <View style={styles.bookingHeader}>
              <View style={styles.sportContainer}>
                <Icon name="sports-cricket" size={24} color={Colors.primary} />
                <Text style={styles.sportName}>
                  {booking.booking_details.sport}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(booking.status) + '20' },
                ]}
              >
                <Icon
                  name={getStatusIcon(booking.status)}
                  size={16}
                  color={getStatusColor(booking.status)}
                />
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(booking.status) },
                  ]}
                >
                  {booking.status || 'Registered'}
                </Text>
              </View>
            </View>

            {/* Date & Time */}
            <View style={styles.detailRow}>
              <Icon name="event" size={20} color={Colors.text.secondary} />
              <Text style={styles.detailText}>
                {formatDate(booking.booking_details.slot_date)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Icon name="access-time" size={20} color={Colors.text.secondary} />
              <Text style={styles.detailText}>
                {formatTime(booking.booking_details.start_time)} -{' '}
                {formatTime(booking.booking_details.end_time)}
              </Text>
            </View>

            {/* Organizer Info */}
            {booking.booking_details.organizer && (
              <>
                <View style={styles.detailRow}>
                  <Icon name="person" size={20} color={Colors.text.secondary} />
                  <Text style={styles.detailText}>
                    Booked by: {booking.booking_details.organizer_name || booking.booking_details.organizer}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon name="email" size={20} color={Colors.text.secondary} />
                  <Text style={styles.detailText}>
                    {booking.booking_details.organizer}
                  </Text>
                </View>
              </>
            )}

            {/* Booking ID */}
            <View style={styles.detailRow}>
              <Icon name="confirmation-number" size={20} color={Colors.text.secondary} />
              <Text style={styles.detailText}>
                Booking #{booking.booking}
              </Text>
            </View>

            {/* Check-in Info */}
            {booking.last_check_in && (
              <View style={styles.checkInInfo}>
                <Text style={styles.checkInLabel}>Last Check-in:</Text>
                <Text style={styles.checkInValue}>
                  {new Date(booking.last_check_in).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            )}

            {booking.last_check_out && (
              <View style={styles.checkInInfo}>
                <Text style={styles.checkInLabel}>Last Check-out:</Text>
                <Text style={styles.checkInValue}>
                  {new Date(booking.last_check_out).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            )}

            {/* Action Button */}
            {isUpcoming(booking.booking_details.slot_date) && (
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>View QR Code</Text>
                <Icon name="qr-code" size={20} color={Colors.primary} />
              </TouchableOpacity>
            )}

            {/* Past Booking Indicator */}
            {isPast(booking.booking_details.slot_date) && (
              <View style={styles.pastIndicator}>
                <Icon name="history" size={16} color={Colors.text.secondary} />
                <Text style={styles.pastText}>Completed</Text>
              </View>
            )}
          </Card>
        ))
      )}

      {/* Info Card */}
      <Card style={styles.infoCard}>
        <Text style={styles.infoTitle}>💡 Quick Tips</Text>
        <Text style={styles.infoText}>
          • Your bookings are created when an organizer adds you{'\n'}
          • Use your QR code for check-in on the booking date{'\n'}
          • Default password is "redball" - change it in settings{'\n'}
          • Contact support if you have any questions
        </Text>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 20,
    backgroundColor: Colors.primary,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  bookingCard: {
    margin: 16,
    marginBottom: 8,
    position: 'relative',
  },
  todayBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: Colors.error,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  todayBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sportContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sportName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginLeft: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: Colors.text.primary,
    marginLeft: 12,
    flex: 1,
  },
  checkInInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  checkInLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  checkInValue: {
    fontSize: 12,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: Colors.primary + '10',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginRight: 8,
  },
  pastIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  pastText: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginLeft: 4,
  },
  emptyCard: {
    margin: 20,
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  infoCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 32,
    backgroundColor: Colors.surface,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
});

export default PlayerBookingsScreen;
