import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Alert, Image} from 'react-native';
import AuthService from '../../services/auth.service';
import PlayersService from '../../services/players.service';
import Card from '../../components/Card';
import Loading from '../../components/Loading';
import Colors from '../../config/colors';

const PlayerQRScreen = () => {
  const [loading, setLoading] = useState(true);
  const [playerInfo, setPlayerInfo] = useState<any>(null);
  const [qrUrl, setQrUrl] = useState<string>('');

  useEffect(() => {
    loadPlayerQR();
  }, []);

  const loadPlayerQR = async () => {
    try {
      setLoading(true);
      const user = await AuthService.getCurrentUser();
      if (!user) throw new Error('Not authenticated');
      const myPlayer = await PlayersService.getMyProfile();
      setPlayerInfo(myPlayer);
      if (myPlayer?.qr_code_url) setQrUrl(myPlayer.qr_code_url);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load QR code');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!qrUrl) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>QR Code not available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Your QR Code</Text>
        <Text style={styles.subtitle}>
          Show this to the admin for check-in/out
        </Text>

        <View style={styles.qrContainer}>
          <Image source={{uri: qrUrl}} style={{width: 250, height: 250}} resizeMode="contain" />
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>Player Name:</Text>
          <Text style={styles.infoValue}>{playerInfo?.name}</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>Sport & Date:</Text>
          <Text style={styles.infoValue}>
            {playerInfo?.booking_details?.sport} | {playerInfo?.booking_details?.slot_date}
          </Text>
        </View>
      </Card>

      <Card style={styles.instructionCard}>
        <Text style={styles.instructionTitle}>📱 Instructions</Text>
        <Text style={styles.instructionText}>
          • QR code is valid only on your booking date{'\n'}
          • First scan: Check-in when you arrive{'\n'}
          • Second scan: Check-out when you leave{'\n'}
          • Keep your phone brightness high for better scanning
        </Text>
      </Card>

      <Card style={styles.noteCard}>
        <Text style={styles.noteText}>
          ⚠️ This QR code is unique to you. Do not share it with others.
        </Text>
      </Card>
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
    alignItems: 'center',
    padding: 24,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  qrContainer: {
    padding: 20,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  instructionCard: {
    marginBottom: 16,
    padding: 16,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  noteCard: {
    padding: 16,
    backgroundColor: '#FFF4E5',
    marginBottom: 16,
  },
  noteText: {
    fontSize: 14,
    color: '#F57C00',
    textAlign: 'center',
  },
  error: {
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default PlayerQRScreen;
