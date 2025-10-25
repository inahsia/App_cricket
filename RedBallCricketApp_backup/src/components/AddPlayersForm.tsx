/**
 * AddPlayersForm Component
 * 
 * A comprehensive form for adding multiple players to a confirmed booking.
 * Features:
 * - Dynamic form fields (add/remove players)
 * - Input validation
 * - Error handling
 * - Success feedback
 * - Email format validation
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BookingsService } from '../services/bookings.service';
import Colors from '../config/colors';

interface PlayerFormData {
  name: string;
  email: string;
  phone: string;
}

interface AddPlayersFormProps {
  bookingId: number;
  maxPlayers: number;
  currentPlayerCount: number;
  onSuccess: (playersAdded: number) => void;
  onCancel: () => void;
}

const AddPlayersForm: React.FC<AddPlayersFormProps> = ({
  bookingId,
  maxPlayers,
  currentPlayerCount,
  onSuccess,
  onCancel,
}) => {
  const [players, setPlayers] = useState<PlayerFormData[]>([
    { name: '', email: '', phone: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const availableSlots = maxPlayers - currentPlayerCount;

  // Add a new player form
  const addPlayerForm = () => {
    if (players.length < availableSlots) {
      setPlayers([...players, { name: '', email: '', phone: '' }]);
    }
  };

  // Remove player form
  const removePlayerForm = (index: number) => {
    if (players.length > 1) {
      const newPlayers = players.filter((_, i) => i !== index);
      setPlayers(newPlayers);
      
      // Clear errors for removed index
      const newErrors = { ...errors };
      delete newErrors[`name_${index}`];
      delete newErrors[`email_${index}`];
      setErrors(newErrors);
    }
  };

  // Update player data
  const updatePlayer = (index: number, field: keyof PlayerFormData, value: string) => {
    const newPlayers = [...players];
    newPlayers[index][field] = value;
    setPlayers(newPlayers);

    // Clear error when user starts typing
    const errorKey = `${field}_${index}`;
    if (errors[errorKey]) {
      const newErrors = { ...errors };
      delete newErrors[errorKey];
      setErrors(newErrors);
    }
  };

  // Validate email format
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    let isValid = true;

    players.forEach((player, index) => {
      // Check name
      if (!player.name.trim()) {
        newErrors[`name_${index}`] = 'Name is required';
        isValid = false;
      }

      // Check email
      if (!player.email.trim()) {
        newErrors[`email_${index}`] = 'Email is required';
        isValid = false;
      } else if (!isValidEmail(player.email.trim())) {
        newErrors[`email_${index}`] = 'Invalid email format';
        isValid = false;
      }
    });

    // Check for duplicate emails
    const emails = players.map(p => p.email.trim().toLowerCase()).filter(email => email);
    const duplicates = emails.filter((email, index) => emails.indexOf(email) !== index);
    
    if (duplicates.length > 0) {
      players.forEach((player, index) => {
        if (duplicates.includes(player.email.trim().toLowerCase())) {
          newErrors[`email_${index}`] = 'Duplicate email address';
          isValid = false;
        }
      });
    }

    setErrors(newErrors);
    return isValid;
  };

  // Submit form
  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors and try again.');
      return;
    }

    setLoading(true);
    try {
      const playersData = players.map(player => ({
        name: player.name.trim(),
        email: player.email.trim().toLowerCase(),
        phone: player.phone.trim() || undefined,
      }));

      const response = await BookingsService.addPlayers(bookingId, {
        players: playersData,
      });

      if (response.success) {
        Alert.alert(
          'Success!',
          `${response.created_count} player(s) added successfully. Welcome emails have been sent.`,
          [
            {
              text: 'OK',
              onPress: () => onSuccess(response.created_count),
            },
          ]
        );
      } else if (response.errors && response.errors.length > 0) {
        const errorMessages = response.errors.map(err => err.error).join('\n');
        Alert.alert('Partial Success', 
          `${response.created_count} players added, but there were some errors:\n\n${errorMessages}`
        );
      }
    } catch (error: any) {
      console.error('Add players error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to add players. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Add Players</Text>
        <Text style={styles.subtitle}>
          Add up to {availableSlots} more player{availableSlots !== 1 ? 's' : ''} to this booking
        </Text>
      </View>

      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
        {players.map((player, index) => (
          <View key={index} style={styles.playerForm}>
            <View style={styles.playerHeader}>
              <Text style={styles.playerNumber}>Player {index + 1}</Text>
              {players.length > 1 && (
                <TouchableOpacity
                  onPress={() => removePlayerForm(index)}
                  style={styles.removeButton}
                >
                  <Icon name="close" size={20} color={Colors.error} />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={[
                  styles.input,
                  errors[`name_${index}`] && styles.inputError
                ]}
                value={player.name}
                onChangeText={(value) => updatePlayer(index, 'name', value)}
                placeholder="Enter full name"
                placeholderTextColor={Colors.text.secondary}
              />
              {errors[`name_${index}`] && (
                <Text style={styles.errorText}>{errors[`name_${index}`]}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address *</Text>
              <TextInput
                style={[
                  styles.input,
                  errors[`email_${index}`] && styles.inputError
                ]}
                value={player.email}
                onChangeText={(value) => updatePlayer(index, 'email', value)}
                placeholder="Enter email address"
                placeholderTextColor={Colors.text.secondary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors[`email_${index}`] && (
                <Text style={styles.errorText}>{errors[`email_${index}`]}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={player.phone}
                onChangeText={(value) => updatePlayer(index, 'phone', value)}
                placeholder="Enter phone number (optional)"
                placeholderTextColor={Colors.text.secondary}
                keyboardType="phone-pad"
              />
            </View>
          </View>
        ))}

        {players.length < availableSlots && (
          <TouchableOpacity
            onPress={addPlayerForm}
            style={styles.addPlayerButton}
          >
            <Icon name="add" size={24} color={Colors.primary} />
            <Text style={styles.addPlayerText}>Add Another Player</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={onCancel}
          style={[styles.button, styles.cancelButton]}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSubmit}
          style={[styles.button, styles.submitButton]}
          disabled={loading || players.some(p => !p.name.trim() || !p.email.trim())}
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>
              Add {players.length} Player{players.length !== 1 ? 's' : ''}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    padding: 20,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  playerForm: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  playerNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  removeButton: {
    padding: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: 'white',
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    marginTop: 4,
  },
  addPlayerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: 12,
    marginTop: 8,
  },
  addPlayerText: {
    fontSize: 16,
    color: colors.primary,
    marginLeft: 8,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  cancelButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  submitButton: {
    backgroundColor: colors.primary,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default AddPlayersForm;