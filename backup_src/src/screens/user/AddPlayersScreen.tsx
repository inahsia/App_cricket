/**
 * Add Players Screen
 * 
 * A standalone screen that displays booking details and allows adding players.
 * This screen is typically navigated to from the booking details or booking list.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BookingsService } from '../services/bookings.service';
import AddPlayersForm from '../components/AddPlayersForm';
import Card from '../components/Card';
import Loading from '../components/Loading';
import Colors from '../config/colors';

interface RouteParams {
  bookingId: number;
}

interface BookingDetails {
  id: number;
  status: string;
  payment_verified: boolean;
  amount_paid: string;
  slot: {
    id: number;
    sport_name: string;
    date: string;
    start_time: string;
    end_time: string;
    price: string;
    max_players: number;
  };
  players: Array<{
    id: number;
    name: string;
    email: string;
    status: string;
  }>;
}

const AddPlayersScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { bookingId } = route.params as RouteParams;

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Load booking details
  const loadBookingDetails = async () => {
    try {
      setLoading(true);
      const bookingData = await BookingsService.getBookingById(bookingId);
      const playersData = await BookingsService.getBookingPlayers(bookingId);
      
      setBooking({
        ...bookingData,
        players: playersData,
      });
    } catch (error: any) {
      console.error('Load booking error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to load booking details',
        [
          { text: 'Go Back', onPress: () => navigation.goBack() }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle successful player addition
  const handlePlayersAdded = (playersAdded: number) => {
    setShowForm(false);
    loadBookingDetails(); // Refresh the data
    
    // Navigate back with success message
    Alert.alert(
      'Success!',
      `${playersAdded} player(s) have been added to your booking. Welcome emails have been sent to all players.`,
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // Format time
  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return timeString;
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'checked in':
        return Colors.success;
      case 'checked out':
        return Colors.primary;
      case 'not checked in':
        return Colors.warning;
      default:
        return Colors.text.primary.secondary;
    }
  };

  useEffect(() => {
    loadBookingDetails();
  }, [bookingId]);

  if (loading) {
    return <Loading />;
  }

  if (!booking) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error-outline" size={64} color={Colors.error} />
        <Text style={styles.errorTitle}>Booking Not Found</Text>
        <Text style={styles.errorMessage}>
          Unable to load booking details. Please try again.
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => loadBookingDetails()}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Check if payment is verified
  if (!booking.payment_verified) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="payment" size={64} color={Colors.warning} />
        <Text style={styles.errorTitle}>Payment Required</Text>
        <Text style={styles.errorMessage}>
          Please complete payment verification before adding players to your booking.
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const availableSlots = booking.slot.max_players - booking.players.length;

  if (showForm) {
    return (
      <AddPlayersForm
        bookingId={booking.id}
        maxPlayers={booking.slot.max_players}
        currentPlayerCount={booking.players.length}
        onSuccess={handlePlayersAdded}
        onCancel={() => setShowForm(false)}
      />
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Add Players</Text>
          <Text style={styles.subtitle}>Booking #{booking.id}</Text>
        </View>
      </View>

      {/* Booking Details */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>🎯 Booking Details</Text>
        
        <View style={styles.bookingHeader}>
          <Text style={styles.sportName}>{booking.slot.sport_name}</Text>
          <View style={styles.paymentBadge}>
            <Icon name="check-circle" size={16} color={Colors.success} />
            <Text style={styles.paymentText}>Paid</Text>
          </View>
        </View>

        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Icon name="event" size={20} color={Colors.primary} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{formatDate(booking.slot.date)}</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Icon name="schedule" size={20} color={Colors.primary} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailValue}>
                {formatTime(booking.slot.start_time)} - {formatTime(booking.slot.end_time)}
              </Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Icon name="attach-money" size={20} color={Colors.primary} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Amount Paid</Text>
              <Text style={styles.detailValue}>₹{booking.amount_paid}</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Icon name="group" size={20} color={Colors.primary} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Players</Text>
              <Text style={styles.detailValue}>
                {booking.players.length} / {booking.slot.max_players}
              </Text>
            </View>
          </View>
        </View>
      </Card>

      {/* Current Players */}
      {booking.players.length > 0 && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>👥 Current Players</Text>
          
          {booking.players.map((player, index) => (
            <View key={player.id} style={styles.playerItem}>
              <View style={styles.playerInfo}>
                <Icon name="person" size={20} color={Colors.primary} />
                <View style={styles.playerDetails}>
                  <Text style={styles.playerName}>{player.name}</Text>
                  <Text style={styles.playerEmail}>{player.email}</Text>
                </View>
              </View>
              <Text style={[
                styles.playerStatus,
                { color: getStatusColor(player.status) }
              ]}>
                {player.status}
              </Text>
            </View>
          ))}
        </Card>
      )}

      {/* Available Slots Info */}
      <Card style={styles.card}>
        <View style={styles.slotsInfo}>
          <View style={styles.slotsLeft}>
            <Text style={styles.slotsNumber}>{availableSlots}</Text>
            <Text style={styles.slotsLabel}>
              slot{availableSlots !== 1 ? 's' : ''} available
            </Text>
          </View>
          
          {availableSlots > 0 ? (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowForm(true)}
            >
              <Icon name="add" size={24} color="white" />
              <Text style={styles.addButtonText}>Add Players</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.fullBadge}>
              <Icon name="group" size={16} color={Colors.text.primary.secondary} />
              <Text style={styles.fullText}>Booking Full</Text>
            </View>
          )}
        </View>
      </Card>

      {/* Instructions */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>ℹ️ What Happens Next?</Text>
        
        <View style={styles.instructionsList}>
          <View style={styles.instructionItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.instructionText}>
              Each player will receive an email with their login credentials
            </Text>
          </View>
          
          <View style={styles.instructionItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.instructionText}>
              Players can log in with their email and password "redball"
            </Text>
          </View>
          
          <View style={styles.instructionItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.instructionText}>
              Each player will see their unique QR code for check-in/out
            </Text>
          </View>
          
          <View style={styles.instructionItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>4</Text>
            </View>
            <Text style={styles.instructionText}>
              Players show their QR code at the academy for attendance
            </Text>
          </View>
        </View>
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
    backgroundColor: Colors.primary,
    padding: 20,
    paddingTop: 40,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  card: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sportName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  paymentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  paymentText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.success,
    marginLeft: 4,
  },
  detailsGrid: {
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailContent: {
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.text.primary.secondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  playerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  playerDetails: {
    marginLeft: 12,
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  playerEmail: {
    fontSize: 14,
    color: Colors.text.primary.secondary,
  },
  playerStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  slotsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slotsLeft: {
    alignItems: 'center',
  },
  slotsNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  slotsLabel: {
    fontSize: 14,
    color: Colors.text.primary.secondary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  fullBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fullText: {
    fontSize: 14,
    color: Colors.text.primary.secondary,
    marginLeft: 6,
  },
  instructionsList: {
    gap: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.primary,
    lineHeight: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: Colors.background,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: Colors.text.primary.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default AddPlayersScreen;
