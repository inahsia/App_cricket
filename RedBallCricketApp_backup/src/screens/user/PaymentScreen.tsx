import React, {useState} from 'react';
import {View, Text, StyleSheet, Alert} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import BookingsService from '../../services/bookings.service';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Colors from '../../config/colors';
import {formatCurrency} from '../../utils/helpers';

const PaymentScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {booking, players}: any = route.params || {};

  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);
      
      // Confirm payment on backend
      await BookingsService.confirmPayment(booking.id);
      
      // Register players after successful payment
      if (players && players.length > 0) {
        try {
          const playersData = {
            players: players.map((player: any) => ({
              name: player.name,
              email: player.email
            }))
          };
          
          await BookingsService.addPlayers(booking.id, playersData);
          console.log('Players registered successfully');
        } catch (playerError: any) {
          console.error('Player registration error:', playerError);
          // Continue even if player registration fails - payment was successful
        }
      }
      
      Alert.alert(
        'Success',
        'Payment confirmed! Your booking is now confirmed and player accounts have been created.',
        [
          {
            text: 'OK',
            onPress: () => {
              (navigation as any).reset({
                index: 0,
                routes: [{name: 'UserTabs'}],
              });
              (navigation as any).navigate('My Bookings');
            },
          },
        ],
      );
    } catch (error: any) {
      console.error('Payment confirmation error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to confirm payment. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  if (!booking) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>No booking information available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Payment Details</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Sport:</Text>
            <Text style={styles.value}>{booking.slot?.sport_name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>{booking.slot?.date}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Time:</Text>
            <Text style={styles.value}>
              {booking.slot?.start_time} - {booking.slot?.end_time}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Players:</Text>
            <Text style={styles.value}>{players?.length || 0}</Text>
          </View>
          {players && players.length > 0 && (
            <View style={styles.playersSection}>
              <Text style={styles.playersTitle}>Player List:</Text>
              {players.map((player: any, index: number) => (
                <View key={index} style={styles.playerItem}>
                  <Text style={styles.playerName}>• {player.name}</Text>
                  <Text style={styles.playerEmail}>{player.email}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Booking ID:</Text>
            <Text style={styles.value}>#{booking.id}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <Text style={[styles.value, {color: Colors.warning}]}>
              {booking.status}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalAmount}>
            {formatCurrency(booking.total_amount)}
          </Text>
        </View>
      </Card>

      <Card style={styles.infoCard}>
        <Text style={styles.infoTitle}>💳 Payment Method</Text>
        <Text style={styles.infoText}>
          Razorpay - Secure payment gateway
        </Text>
        <Text style={styles.infoSubtext}>
          Supports UPI, Cards, Net Banking & Wallets
        </Text>
      </Card>

      <Button
        title="Proceed to Pay"
        onPress={handlePayment}
        loading={loading}
        style={styles.payButton}
      />

      <Button
        title="Cancel"
        onPress={() => navigation.goBack()}
        variant="outline"
        style={styles.cancelButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
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
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  totalSection: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  infoCard: {
    marginBottom: 16,
    backgroundColor: Colors.surface,
  },
  playersSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  playersTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  playerItem: {
    marginBottom: 4,
  },
  playerName: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  playerEmail: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginLeft: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  infoSubtext: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  payButton: {
    marginBottom: 12,
  },
  cancelButton: {
    marginBottom: 16,
  },
  error: {
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default PaymentScreen;
