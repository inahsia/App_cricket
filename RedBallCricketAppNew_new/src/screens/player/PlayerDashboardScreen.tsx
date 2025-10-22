import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, ScrollView, Alert} from 'react-native';
import PlayersService from '../../services/players.service';
import AuthService from '../../services/auth.service';
import Card from '../../components/Card';
import Loading from '../../components/Loading';
import Colors from '../../config/colors';

const PlayerDashboardScreen = () => {
  const [loading, setLoading] = useState(true);
  const [playerInfo, setPlayerInfo] = useState<any>(null);

  useEffect(() => {
    loadPlayerData();
  }, []);

  const loadPlayerData = async () => {
    try {
      setLoading(true);
      const user = await AuthService.getCurrentUser();
      if (!user) {
        throw new Error('Not authenticated');
      }
      const myPlayer = await PlayersService.getMyProfile();
      setPlayerInfo(myPlayer);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load player data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.header}>
        <Text style={styles.welcomeText}>Welcome, Player!</Text>
        <Text style={styles.playerName}>{playerInfo?.name || 'Player'}</Text>
      </Card>

      {playerInfo && (
        <Card style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Player Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Player ID:</Text>
            <Text style={styles.value}>#{playerInfo.id}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{playerInfo.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Sport:</Text>
            <Text style={styles.value}>{playerInfo?.booking_details?.sport}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>{playerInfo?.booking_details?.slot_date}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Time:</Text>
            <Text style={styles.value}>{playerInfo?.booking_details?.start_time} - {playerInfo?.booking_details?.end_time}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>QR Code Status:</Text>
            <Text style={[styles.value, {color: Colors.success}]}>Active</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Current Status:</Text>
            <Text style={[styles.value]}>{playerInfo?.status}</Text>
          </View>
        </Card>
      )}

      <Card style={styles.instructionCard}>
        <Text style={styles.sectionTitle}>📱 How to Check In/Out</Text>
        <View style={styles.instruction}>
          <Text style={styles.stepNumber}>1.</Text>
          <Text style={styles.stepText}>
            Go to the QR Code tab to view your unique QR code
          </Text>
        </View>
        <View style={styles.instruction}>
          <Text style={styles.stepNumber}>2.</Text>
          <Text style={styles.stepText}>
            Show your QR code to the admin at the academy
          </Text>
        </View>
        <View style={styles.instruction}>
          <Text style={styles.stepNumber}>3.</Text>
          <Text style={styles.stepText}>
            Admin will scan for check-in when you arrive
          </Text>
        </View>
        <View style={styles.instruction}>
          <Text style={styles.stepNumber}>4.</Text>
          <Text style={styles.stepText}>
            Scan again when leaving for check-out
          </Text>
        </View>
      </Card>

      <Card style={styles.noteCard}>
        <Text style={styles.noteTitle}>⚠️ Important Notes</Text>
        <Text style={styles.noteText}>
          • QR code only works on your booking date{'\n'}
          • Two scans required: Check-in and Check-out{'\n'}
          • Keep your QR code ready when arriving at the academy
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
    margin: 16,
    padding: 20,
    backgroundColor: Colors.primary,
  },
  welcomeText: {
    fontSize: 16,
    color: Colors.text.light,
    marginBottom: 4,
  },
  playerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.light,
  },
  infoCard: {
    margin: 16,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  infoRow: {
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
  instructionCard: {
    margin: 16,
    marginTop: 0,
  },
  instruction: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    marginRight: 12,
    width: 24,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.primary,
    lineHeight: 20,
  },
  noteCard: {
    margin: 16,
    marginTop: 0,
    backgroundColor: Colors.surface,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  noteText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
});

export default PlayerDashboardScreen;
