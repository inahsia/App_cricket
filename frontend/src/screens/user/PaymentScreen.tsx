import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, Alert} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import BookingsService from '../../services/bookings.service';
import PaymentsService from '../../services/payments.service';
import RazorpayCheckout from 'react-native-razorpay';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Colors from '../../config/colors';
import {formatCurrency} from '../../utils/helpers';

const PaymentScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {booking, players}: any = route.params || {};

  const [loading, setLoading] = useState(false);
  const [fullBooking, setFullBooking] = useState<any>(booking);

  useEffect(() => {
    // Always fetch the latest booking details from backend
    if (booking?.id) {
      BookingsService.getBookingById(booking.id)
        .then((data) => setFullBooking(data))
        .catch(() => setFullBooking(booking));
    }
  }, [booking?.id]);

  const getAmount = () => {
    // Try booking.amount_paid, booking.total_amount, or booking.slot.price
    return (
      Number(fullBooking?.amount_paid) ||
      Number(fullBooking?.total_amount) ||
      Number(fullBooking?.slot?.price) ||
      0
    );
  };

  const handlePayment = async () => {
    try {
      setLoading(true);
      const amount = getAmount();
      if (!amount || amount <= 0) {
        Alert.alert('Error', 'Invalid booking amount.');
        setLoading(false);
        return;
      }
      // 1. Create Razorpay order from backend
      const order = await PaymentsService.createOrder({
        booking_id: booking.id,
        amount: amount,
      });
      // 2. Launch Razorpay Checkout
      const options = {
        description: 'Booking Payment',
        image: '',
        currency: order.currency,
        key: order.razorpay_key,
        amount: order.amount, // in paise
        name: 'Red Ball Cricket Academy',
        order_id: order.order_id,
        prefill: {
          email: booking.user_details?.email,
          contact: '',
          name: booking.user_details?.first_name || '',
        },
        theme: { color: Colors.primary },
      };
      RazorpayCheckout.open(options)
        .then(async (data: any) => {
          console.log('Razorpay response:', data);
          if (
            data.razorpay_order_id &&
            data.razorpay_payment_id &&
            data.razorpay_signature
          ) {
            // 3. On success, verify payment with backend
            await PaymentsService.verifyPayment({
              razorpay_order_id: data.razorpay_order_id,
              razorpay_payment_id: data.razorpay_payment_id,
              razorpay_signature: data.razorpay_signature,
              booking_id: booking.id,
            });
            Alert.alert('Success', 'Payment successful! Your booking is confirmed.', [
              {
                text: 'OK',
                onPress: () => {
                  (navigation as any).reset({
                    index: 0,
                    routes: [{ name: 'UserTabs' }],
                  });
                  (navigation as any).navigate('My Bookings');
                },
              },
            ]);
          } else {
            Alert.alert('Payment Cancelled', 'Payment was not completed.');
          }
        })
        .catch((error: any) => {
          console.error('Razorpay error:', error);
          Alert.alert('Payment Cancelled', 'Payment was not completed.');
        })
        .finally(() => setLoading(false));
    } catch (error: any) {
      setLoading(false);
      console.error('Payment error:', error);
      Alert.alert('Error', error.response?.data?.error || 'Payment failed. Please try again.');
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
            <Text style={styles.value}>{fullBooking.slot_details?.sport_name || fullBooking.slot?.sport_name || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>{fullBooking.slot_details?.date || fullBooking.slot?.date || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Time:</Text>
            <Text style={styles.value}>
              {fullBooking.slot_details?.start_time && fullBooking.slot_details?.end_time
                ? `${fullBooking.slot_details.start_time} - ${fullBooking.slot_details.end_time}`
                : fullBooking.slot?.start_time && fullBooking.slot?.end_time
                ? `${fullBooking.slot.start_time} - ${fullBooking.slot.end_time}`
                : '-'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Players:</Text>
            <Text style={styles.value}>{players?.length || booking.player_count || 0}</Text>
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
            {formatCurrency(getAmount())}
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
    marginBottom: 20, // increased for more separation
    borderRadius: 12,
    padding: 12,
    elevation: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  section: {
    marginBottom: 18, // more space between sections
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
    marginBottom: 10, // more space between rows
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
    paddingVertical: 16, // more vertical space
  },
  totalLabel: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 4,
    marginBottom: 8,
  },
  infoCard: {
    marginBottom: 20,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 10,
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
    marginBottom: 18,
    marginTop: 8,
    borderRadius: 8,
  },
  cancelButton: {
    marginBottom: 24,
    borderRadius: 8,
  },
  error: {
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default PaymentScreen;
