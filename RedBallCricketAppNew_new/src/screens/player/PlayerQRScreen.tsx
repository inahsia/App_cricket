import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Alert} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import AuthService from '../../services/auth.service';
import PlayersService from '../../services/players.service';
import Card from '../../components/Card';
import Loading from '../../components/Loading';
import Colors from '../../config/colors';

const PlayerQRScreen = () => {
  const [loading, setLoading] = useState(true);
  const [playerInfo, setPlayerInfo] = useState<any>(null);
  const [qrData, setQrData] = useState<string>('');

  useEffect(() => {
    loadPlayerQR();
  }, []);

  const loadPlayerQR = async () => {
    try {
      setLoading(true);
      const user = await AuthService.getCurrentUser();
      
      // Get player info
      const players = await PlayersService.getAllPlayers();
      const myPlayer = players.find((p: any) => p.name === user.username);
      
      if (myPlayer) {
        setPlayerInfo(myPlayer);
        // Generate QR data (player ID)
        setQrData(myPlayer.id.toString());
      } else {
        Alert.alert('Error', 'Player information not found');
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load QR code');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!qrData) {
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
          <QRCode value={qrData} size={250} />
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>Player Name:</Text>
          <Text style={styles.infoValue}>{playerInfo?.name}</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>Player ID:</Text>
          <Text style={styles.infoValue}>#{playerInfo?.id}</Text>
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
    backgroundColor: Colors.background.default,
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
    backgroundColor: Colors.background.paper,
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
