import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  Image,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import BookingsService from '../../services/bookings.service';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import Colors from '../../config/colors';
import {formatCurrency, formatDate} from '../../utils/helpers';

const MyBookingsScreen = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showQRModal, setShowQRModal] = useState(false);

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

  const showQRCodes = (booking: any) => {
    setSelectedBooking(booking);
    setShowQRModal(true);
  };

  const closeQRModal = () => {
    setShowQRModal(false);
    setSelectedBooking(null);
  };

  const handleCancelBooking = (bookingId: number) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        {text: 'No', style: 'cancel'},
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await BookingsService.cancelBooking(bookingId);
              Alert.alert('Success', 'Booking cancelled successfully');
              loadBookings(); // Refresh the list
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

  const getBookingStatus = (booking: any) => {
    // Check cancellation first
    if (booking.is_cancelled) {
      return 'cancelled';
    }
    
    // Then check payment verification
    if (!booking.payment_verified) {
      return 'pending';
    }
    
    // If payment verified and not cancelled, it's confirmed
    return 'confirmed';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'CONFIRMED';
      case 'pending':
        return 'PENDING';
      case 'cancelled':
        return 'CANCELLED';
      default:
        return 'UNKNOWN';
    }
  };

  const renderBooking = ({item}: {item: any}) => {
    const status = getBookingStatus(item);

    return (
      <Card style={styles.bookingCard}>
        <View style={styles.bookingHeader}>
          <Text style={styles.sportName}>
            {item.slot_details?.sport_name || 'N/A'}
          </Text>
          <View
            style={[
              styles.statusBadge,
              {backgroundColor: getStatusColor(status)},
            ]}>
            <Text style={styles.statusText}>{getStatusText(status)}</Text>
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
          <Text style={styles.price}>
            {formatCurrency(item.amount_paid || '0')}
          </Text>
        </View>

        {/* QR Code Button for confirmed bookings */}
        {status === 'confirmed' && item.players && item.players.length > 0 && (
          <TouchableOpacity
            style={styles.qrButton}
            onPress={() => showQRCodes(item)}>
            <Text style={styles.qrButtonText}>🔍 Show QR Codes</Text>
          </TouchableOpacity>
        )}

        {status === 'confirmed' && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancelBooking(item.id)}>
            <Text style={styles.cancelButtonText}>Cancel Booking</Text>
          </TouchableOpacity>
        )}
      </Card>
    );
  };

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
    <>
      <FlatList
        data={bookings || []}
        renderItem={renderBooking}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />

      {/* QR Code Modal */}
      <Modal
        visible={showQRModal}
        transparent={true}
        animationType="slide"
        onRequestClose={closeQRModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Player QR Codes</Text>
            <Text style={styles.modalSubtitle}>
              Show these QR codes to the admin for check-in/out
            </Text>
            
            <ScrollView style={styles.qrScrollView}>
              {selectedBooking?.players?.map((player: any, index: number) => (
                <View key={player.id || index} style={styles.playerQRContainer}>
                  <Text style={styles.playerName}>{player.name}</Text>
                  <Text style={styles.playerEmail}>{player.email}</Text>
                  
                  <View style={styles.qrContainer}>
                    {player.qr_code_url ? (
                      <Image
                        source={{ uri: player.qr_code_url }}
                        style={styles.qrImage}
                        resizeMode="contain"
                        onError={() => {
                          console.log('QR image failed for player:', player.name);
                        }}
                      />
                    ) : (
                      <QRCode
                        value={player.qr_code || player.qr_token || `player_${player.id}` || 'no-qr'}
                        size={150}
                        color="black"
                        backgroundColor="white"
                      />
                    )}
                  </View>
                  
                  <Text style={styles.playerStatus}>
                    Status: {player.is_in ? 'CHECKED IN' : 'CHECKED OUT'}
                  </Text>
                </View>
              ))}
            </ScrollView>
            
            <Button
              title="Close"
              onPress={closeQRModal}
              style={styles.closeButton}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: Colors.background,
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
  qrButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginTop: 8,
    alignItems: 'center',
  },
  qrButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  cancelButton: {
    marginTop: 8,
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
    backgroundColor: Colors.background,
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  qrScrollView: {
    maxHeight: 400,
  },
  playerQRContainer: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  playerEmail: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 12,
  },
  qrContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 8,
  },
  qrImage: {
    width: 150,
    height: 150,
  },
  playerStatus: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  closeButton: {
    marginTop: 16,
  },
});

export default MyBookingsScreen;