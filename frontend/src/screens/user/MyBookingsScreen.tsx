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
  Clipboard,
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
  const [showOrganizerQR, setShowOrganizerQR] = useState(false);
  const [selectedOrganizerBooking, setSelectedOrganizerBooking] = useState<any>(null);

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

  const showOrganizerQRModal = (booking: any) => {
    setSelectedOrganizerBooking(booking);
    setShowOrganizerQR(true);
  };

  const copyOrganizerToken = () => {
    if (selectedOrganizerBooking?.organizer_qr_token) {
      Clipboard.setString(selectedOrganizerBooking.organizer_qr_token);
      Alert.alert('Copied!', 'Organizer QR token copied to clipboard');
    }
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
          <View style={styles.sportNameContainer}>
            <Text style={styles.sportIcon}>🏏</Text>
            <Text style={styles.sportName}>
              {item.slot_details?.sport_name || 'Sport'}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              {backgroundColor: getStatusColor(status)},
            ]}>
            <Text style={styles.statusText}>{getStatusText(status)}</Text>
          </View>
        </View>

        <View style={styles.dateTimeRow}>
          <Text style={styles.dateIcon}>📅</Text>
          <Text style={styles.date}>{formatDate(item.slot_details?.date)}</Text>
        </View>
        <View style={styles.dateTimeRow}>
          <Text style={styles.timeIcon}>🕐</Text>
          <Text style={styles.time}>
            {item.slot_details?.start_time} - {item.slot_details?.end_time}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <Text style={styles.label}>👥 Players:</Text>
          <Text style={styles.value}>{item.players?.length || 0} {item.players?.length === 1 ? 'Player' : 'Players'}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>💰 Total Amount:</Text>
          <Text style={styles.price}>
            {formatCurrency(item.amount_paid || '0')}
          </Text>
        </View>

        {/* Organizer & Player QR Buttons for confirmed bookings */}
        {status === 'confirmed' && (
          <>
            {/* Organizer QR Button */}
            {item.organizer_qr_token && (
              <TouchableOpacity
                style={[styles.qrButton, {backgroundColor: Colors.primary}]}
                onPress={() => showOrganizerQRModal(item)}>
                <Text style={styles.qrButtonText}>🎫 My Organizer QR</Text>
                <Text style={styles.qrButtonHint}>Scan this to check-in</Text>
              </TouchableOpacity>
            )}
            
            {/* Player QR Codes Button */}
            {item.players && item.players.length > 0 && (
              <TouchableOpacity
                style={styles.qrButton}
                onPress={() => showQRCodes(item)}>
                <Text style={styles.qrButtonText}>� Player QR Codes ({item.players.length})</Text>
                <Text style={styles.qrButtonHint}>View all player tickets</Text>
              </TouchableOpacity>
            )}
          </>
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

  if (bookings.length === 0 && !loading) {
    return (
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🏏</Text>
          <Text style={styles.emptyText}>No Bookings Yet!</Text>
          <Text style={styles.emptySubtext}>
            Ready to play? Book your favorite sport now!
          </Text>
          <Text style={styles.emptyHint}>
            📍 Browse Sports → Pick a Slot → Play! 🎾🏏⚽
          </Text>
        </View>
      </ScrollView>
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
            <Text style={styles.modalTitle}>🎟️ Player QR Codes</Text>
            <Text style={styles.modalSubtitle}>
              Each player needs their own QR code for entry
            </Text>
            <Text style={styles.modalHint}>
              💡 Tap QR code to copy token • Admin will scan these
            </Text>
            
            <ScrollView style={styles.qrScrollView}>
              {selectedBooking?.players?.map((player: any, index: number) => (
                <View key={player.id || index} style={styles.playerQRContainer}>
                  <View style={styles.playerHeaderRow}>
                    <Text style={styles.playerBadge}>Player {index + 1}</Text>
                  </View>
                  <Text style={styles.playerName}>👤 {player.name}</Text>
                  <Text style={styles.playerEmail}>📧 {player.email}</Text>
                  
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
                  
                  <View style={styles.playerStatusContainer}>
                    <View style={[styles.playerStatusDot, {
                      backgroundColor: player.is_in ? Colors.success : Colors.error
                    }]} />
                    <Text style={[styles.playerStatus, {
                      color: player.is_in ? Colors.success : Colors.error
                    }]}>
                      {player.is_in ? '✓ CHECKED IN' : '○ CHECKED OUT'}
                    </Text>
                  </View>
                  <Text style={styles.playerCheckInCount}>
                    Scans: {player.check_in_count || 0}/2
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

      {/* Organizer QR Modal */}
      <Modal
        visible={showOrganizerQR}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowOrganizerQR(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🎫 Organizer Entry Pass</Text>
            <Text style={styles.modalSubtitle}>
              🏏 {selectedOrganizerBooking?.slot_details?.sport_name || 'Sport'}
            </Text>
            <Text style={styles.modalDate}>
              📅 {formatDate(selectedOrganizerBooking?.slot_details?.date)}
            </Text>
            <Text style={styles.modalTime}>
              🕐 {selectedOrganizerBooking?.slot_details?.start_time} - {selectedOrganizerBooking?.slot_details?.end_time}
            </Text>
            
            <ScrollView style={styles.qrScrollView} contentContainerStyle={styles.centerContent}>
              <View style={styles.userQRCodeContainer}>
                <View style={styles.qrContainer}>
                  {selectedOrganizerBooking?.organizer_qr_token && (
                    <QRCode
                      value={selectedOrganizerBooking.organizer_qr_token}
                      size={220}
                      color="black"
                      backgroundColor="white"
                    />
                  )}
                </View>
                
                <View style={styles.statusIndicator}>
                  <View style={[styles.statusDot, {
                    backgroundColor: selectedOrganizerBooking?.organizer_is_in ? Colors.success : Colors.error
                  }]} />
                  <Text style={styles.statusLabel}>
                    {selectedOrganizerBooking?.organizer_is_in ? 'CHECKED IN' : 'CHECKED OUT'}
                  </Text>
                </View>

                <Text style={styles.checkInCount}>
                  Check-in Count: {selectedOrganizerBooking?.organizer_check_in_count || 0}/2
                </Text>

                {selectedOrganizerBooking?.organizer_qr_token && (
                  <TouchableOpacity 
                    style={styles.copyTokenButton}
                    onPress={copyOrganizerToken}>
                    <Text style={styles.copyTokenText}>📋 Copy Token</Text>
                  </TouchableOpacity>
                )}

                <Text style={styles.qrHint}>
                  🎯 YOUR ENTRY TICKET
                </Text>
                <Text style={styles.qrInstructions}>
                  1️⃣ Show this QR to admin at venue
                  {"\n"}2️⃣ First scan = CHECK IN ✓
                  {"\n"}3️⃣ Second scan = CHECK OUT ✓
                  {"\n"}💡 Each booking has unique organizer QR
                </Text>
              </View>
            </ScrollView>
            
            <Button
              title="Close"
              onPress={() => setShowOrganizerQR(false)}
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
  // User QR Card Styles
  userQRCard: {
    marginBottom: 16,
    backgroundColor: Colors.primary + '10',
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  userQRHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userQRTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  userQRSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  viewQRButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewQRButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  userQRHint: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  userQRCodeContainer: {
    alignItems: 'center',
    padding: 16,
  },
  centerContent: {
    alignItems: 'center',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  checkInCount: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 8,
    marginBottom: 16,
  },
  copyTokenButton: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  copyTokenText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  qrHint: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  qrInstructions: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  // New styles for enhanced UI
  sportNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sportIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dateIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  timeIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  emptyHint: {
    fontSize: 14,
    color: Colors.primary,
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 20,
  },
  qrButtonHint: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
    fontStyle: 'italic',
  },
  modalHint: {
    fontSize: 12,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  modalDate: {
    fontSize: 14,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  modalTime: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  playerHeaderRow: {
    width: '100%',
    marginBottom: 8,
  },
  playerBadge: {
    backgroundColor: Colors.primary,
    color: 'white',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 11,
    fontWeight: '600',
    alignSelf: 'flex-start',
    textTransform: 'uppercase',
  },
  playerStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  playerStatusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  playerCheckInCount: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontStyle: 'italic',
  },
});

export default MyBookingsScreen;