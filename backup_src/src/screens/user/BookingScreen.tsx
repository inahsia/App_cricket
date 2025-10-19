import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import BookingsService from '../../services/bookings.service';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Colors from '../../config/colors';
import {formatCurrency, formatDate} from '../../utils/helpers';

const BookingScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {slot}: any = route.params || {};

  const [players, setPlayers] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);

  const addPlayerField = () => {
    setPlayers([...players, '']);
  };

  const updatePlayer = (index: number, value: string) => {
    const newPlayers = [...players];
    newPlayers[index] = value;
    setPlayers(newPlayers);
  };

  const removePlayer = (index: number) => {
    if (players.length > 1) {
      const newPlayers = players.filter((_, i) => i !== index);
      setPlayers(newPlayers);
    }
  };

  const handleBooking = async () => {
    try {
      // Validate players
      const validPlayers = players.filter(p => p.trim().length > 0);
      if (validPlayers.length === 0) {
        Alert.alert('Error', 'Please add at least one player');
        return;
      }

      setLoading(true);

      // Create booking
      const booking = await BookingsService.createBooking({
        slot: slot.id,
        players: validPlayers,
      });

      Alert.alert(
        'Success',
        'Booking created successfully! Please proceed to payment.',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('Payment' as never, {booking} as never);
            },
          },
        ],
      );
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to create booking',
      );
    } finally {
      setLoading(false);
    }
  };

  if (!slot) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>No slot selected</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.slotCard}>
        <Text style={styles.sportName}>{slot.sport_name}</Text>
        <Text style={styles.slotDate}>{formatDate(slot.date)}</Text>
        <Text style={styles.slotTime}>
          {slot.start_time} - {slot.end_time}
        </Text>
        <Text style={styles.price}>{formatCurrency(slot.price)}</Text>
      </Card>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Add Players</Text>
        <Text style={styles.sectionDesc}>
          Enter player names (auto-accounts will be created)
        </Text>

        {players.map((player, index) => (
          <View key={index} style={styles.playerRow}>
            <TextInput
              style={styles.playerInput}
              placeholder={`Player ${index + 1} Name`}
              value={player}
              onChangeText={value => updatePlayer(index, value)}
            />
            {players.length > 1 && (
              <Button
                title="Remove"
                onPress={() => removePlayer(index)}
                variant="outline"
                style={styles.removeButton}
              />
            )}
          </View>
        ))}

        <Button
          title="+ Add Another Player"
          onPress={addPlayerField}
          variant="outline"
          style={styles.addButton}
        />
      </View>

      <View style={styles.summary}>
        <Card>
          <Text style={styles.summaryTitle}>Booking Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Slot Price:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(slot.price)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Players:</Text>
            <Text style={styles.summaryValue}>
              {players.filter(p => p.trim()).length}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>{formatCurrency(slot.price)}</Text>
          </View>
        </Card>
      </View>

      <Button
        title="Proceed to Payment"
        onPress={handleBooking}
        loading={loading}
        style={styles.bookButton}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.default,
  },
  slotCard: {
    margin: 16,
    padding: 16,
  },
  sportName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  slotDate: {
    fontSize: 16,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  slotTime: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 16,
  },
  playerRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  playerInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: Colors.background.paper,
  },
  removeButton: {
    marginLeft: 8,
    paddingHorizontal: 12,
  },
  addButton: {
    marginTop: 8,
  },
  summary: {
    padding: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  summaryValue: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  bookButton: {
    margin: 16,
  },
  error: {
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default BookingScreen;
