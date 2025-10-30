import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
  Image,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Modal,
  Clipboard,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ApiService from '../../services/api.service';
import Colors from '../../config/colors';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Loading from '../../components/Loading';

const { width } = Dimensions.get('window');

interface PlayerInfo {
  id: number;
  name: string;
  email: string;
  booking: number;
  qr_code: string;
  qr_token: string;
  qr_code_url?: string;
  is_in: boolean;
  booking_details?: {
    id: number;
    slot_date: string;
    sport: string;
    start_time: string;
    end_time: string;
    organizer: string;
    organizer_name: string;
  };
}

const PlayerDashboardScreen: React.FC = () => {
  const [playerInfo, setPlayerInfo] = useState<PlayerInfo[]>([]); // Array now
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [useImageQR, setUseImageQR] = useState<boolean>(true);
  const [showManualInput, setShowManualInput] = useState<boolean>(false);
  const [qrInput, setQrInput] = useState<string>('');

  useEffect(() => {
    loadPlayerData();
  }, []);

  useEffect(() => {
    // Auto-select first player if available
    if (playerInfo.length > 0 && !selectedPlayer) {
      setSelectedPlayer(playerInfo[0]);
    }
  }, [playerInfo]);

  const getAuthToken = async (): Promise<string | null> => {
    try {
      // Try multiple times with delays in case AsyncStorage is syncing
      for (let i = 0; i < 3; i++) {
        const token = await AsyncStorage.getItem('@redball_auth_token'); // Use correct key!
        if (token) {
          console.log('Auth token found on attempt', i + 1);
          return token;
        }
        if (i < 2) {
          console.log('No token yet, waiting... (attempt', i + 1, ')');
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      console.log('No auth token found after 3 attempts');
      return null;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  };

  const loadPlayerData = async (): Promise<void> => {
    try {
      setLoading(true);
      const token = await getAuthToken();
      
      if (!token) {
        console.log('No auth token found in AsyncStorage');
        // Don't show alert immediately - might be loading issue
        setLoading(false);
        return;
      }

      console.log('Loading player data with ApiService...');
      const response = await ApiService.get<PlayerInfo[]>('/players/me/'); // Array response

      console.log('Player data loaded:', response);
      setPlayerInfo(response);
      
      // Auto-select first player
      if (response.length > 0) {
        setSelectedPlayer(response[0]);
      }
    } catch (error: any) {
      console.error('Error loading player data:', error);
      console.error('Error response:', error.response?.data);
      Alert.alert(
        'Error', 
        error.response?.data?.error || error.response?.data?.detail || 'Failed to load player data. Please pull down to refresh.'
      );
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await loadPlayerData();
    setRefreshing(false);
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string): string => {
    if (!timeString) return 'N/A';
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleQRFallback = (): void => {
    setUseImageQR(false);
  };

  const copyQRToken = async (): Promise<void> => {
    const player = selectedPlayer || playerInfo[0];
    if (player?.qr_token) {
      await Clipboard.setString(player.qr_token);
      Alert.alert('Copied!', 'QR token copied to clipboard');
    }
  };

  const openManualInput = (): void => {
    setShowManualInput(true);
    setQrInput('');
  };

  const closeManualInput = (): void => {
    setShowManualInput(false);
    setQrInput('');
  };

  const handleManualQRSubmit = async (): Promise<void> => {
    if (!qrInput.trim()) {
      Alert.alert('Error', 'Please enter a QR code value');
      return;
    }
    
    closeManualInput();
    await handleQRScan(qrInput.trim());
  };

  const handleQRScan = async (qrData: string): Promise<void> => {
    try {
      const token = await getAuthToken();
      if (!token) {
        Alert.alert('Error', 'Authentication token not found');
        return;
      }

      // Call the scan QR endpoint
      const response = await axios.post(
        'http://10.0.2.2:8000/api/players/scan_qr/',
        { qr_data: qrData },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const { message, action, player } = response.data;
      
      // Update local player info if it's in the array
      if (playerInfo.some(p => p.id === player.id)) {
        setPlayerInfo(prevInfo => 
          prevInfo.map(p => p.id === player.id ? { ...p, is_in: player.is_in } : p)
        );
      }

      Alert.alert(
        'Scan Successful',
        `${message}\nPlayer: ${player.name}\nStatus: ${player.is_in ? 'CHECKED IN' : 'CHECKED OUT'}`,
        [{ text: 'OK' }]
      );

    } catch (error: any) {
      console.error('QR Scan error:', error);
      Alert.alert(
        'Scan Failed',
        error.response?.data?.error || 'Failed to process QR code scan'
      );
    }
  };

  const toggleMyStatus = async (): Promise<void> => {
    try {
      const token = await getAuthToken();
      if (!token) {
        Alert.alert('Error', 'Authentication token not found');
        return;
      }

      const player = selectedPlayer || playerInfo[0];
      if (!player?.qr_code) {
        Alert.alert('Error', 'QR code not found for your account');
        return;
      }

      // Scan own QR code to toggle status
      await handleQRScan(player.qr_code);
      
    } catch (error: any) {
      console.error('Toggle status error:', error);
      Alert.alert('Error', 'Failed to toggle status');
    }
  };

  if (loading && playerInfo.length === 0) {
    return <Loading />;
  }

  if (!loading && playerInfo.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error-outline" size={64} color={Colors.error} />
        <Text style={styles.errorTitle}>No Player Data</Text>
        <Text style={styles.errorText}>
          Could not load your player information.{'\n'}
          Pull down to refresh or check your login.
        </Text>
        <Button
          title="Refresh"
          onPress={onRefresh}
          loading={refreshing}
          style={styles.refreshButton}
        />
      </View>
    );
  }

  const player = selectedPlayer || playerInfo[0]; // Use selected or first

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header Card */}
      <Card style={styles.headerCard}>
        <Text style={styles.welcomeText}>Welcome, Player!</Text>
        <Text style={styles.playerName}>{player?.name || 'Player'}</Text>
        <Text style={styles.playerEmail}>{player?.email || ''}</Text>
        <Text style={styles.playerId}>Player ID: #{player?.id}</Text>
        {playerInfo.length > 1 && (
          <Text style={styles.bookingsCount}>
            {playerInfo.length} Active Bookings
          </Text>
        )}
      </Card>

      {/* Attendance Status Card */}
      <Card style={styles.statusCard}>
        <Text style={styles.statusTitle}>Current Status</Text>
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusIndicator,
            { backgroundColor: player?.is_in ? Colors.success : Colors.error }
          ]} />
          <Text style={[
            styles.statusText,
            { color: player?.is_in ? Colors.success : Colors.error }
          ]}>
            {player?.is_in ? 'CHECKED IN' : 'CHECKED OUT'}
          </Text>
        </View>
        <Text style={styles.statusSubtext}>
          {player?.is_in 
            ? 'You are currently at the academy' 
            : 'You are not at the academy'
          }
        </Text>
      </Card>

      {/* Booking Details Card */}
      {player?.booking_details && (
        <Card style={styles.bookingCard}>
          <Text style={styles.sectionTitle}>Booking Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Sport:</Text>
            <Text style={styles.detailValue}>{player.booking_details.sport}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date:</Text>
            <Text style={styles.detailValue}>
              {formatDate(player.booking_details.slot_date)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Time:</Text>
            <Text style={styles.detailValue}>
              {formatTime(player.booking_details.start_time)} - {formatTime(player.booking_details.end_time)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Booking ID:</Text>
            <Text style={styles.detailValue}>#{player.booking}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Booked By:</Text>
            <Text style={styles.detailValue}>{player.booking_details.organizer_name}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Organizer:</Text>
            <Text style={styles.detailValue}>{player.booking_details.organizer}</Text>
          </View>
        </Card>
      )}

      {/* QR Code Card */}
      <Card style={styles.qrCard}>
        <Text style={styles.sectionTitle}>Your QR Code</Text>
        <Text style={styles.qrSubtitle}>
          Show this QR code to the admin for check-in/check-out
        </Text>
        
        <View style={styles.qrContainer}>
          {useImageQR && player?.qr_code_url ? (
            <Image
              source={{ uri: player.qr_code_url }}
              style={styles.qrImage}
              resizeMode="contain"
              onError={handleQRFallback}
            />
          ) : (
            <QRCode
              value={player?.qr_token || `player_${player?.id}` || 'no-data'}
              size={200}
              color="black"
              backgroundColor="white"
            />
          )}
        </View>

        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setUseImageQR(!useImageQR)}
        >
          <Text style={styles.toggleButtonText}>
            {useImageQR ? 'Use Generated QR' : 'Use Backend QR Image'}
          </Text>
        </TouchableOpacity>

        {/* QR Token Display */}
        <View style={styles.tokenContainer}>
          <Text style={styles.tokenLabel}>QR Token (for manual entry):</Text>
          <TouchableOpacity 
            style={styles.tokenBox}
            onPress={copyQRToken}
            activeOpacity={0.7}
          >
            <Text style={styles.tokenText} numberOfLines={2}>
              {player?.qr_token || 'No token available'}
            </Text>
            <Icon name="content-copy" size={20} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.tokenHint}>
            Tap to copy • Share with admin if scanner doesn't work
          </Text>
        </View>
      </Card>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <Button
          title="Refresh Status"
          onPress={onRefresh}
          loading={refreshing}
          style={styles.refreshButton}
        />
        
        <Button
          title={player?.is_in ? "Toggle to Check Out" : "Toggle to Check In"}
          onPress={toggleMyStatus}
          style={[styles.actionButton, {
            backgroundColor: player?.is_in ? Colors.error : Colors.success
          }]}
        />
        
        <Button
          title="Enter QR Code Manually"
          onPress={openManualInput}
          variant="outline"
          style={styles.scanButton}
        />
      </View>

      {/* Manual QR Input Modal */}
      <Modal
        visible={showManualInput}
        transparent={true}
        animationType="slide"
        onRequestClose={closeManualInput}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter QR Code</Text>
            <Text style={styles.modalSubtitle}>
              Enter the QR code value manually
            </Text>
            
            <TextInput
              style={styles.qrInput}
              placeholder="Enter QR code value..."
              value={qrInput}
              onChangeText={setQrInput}
              multiline
              autoCapitalize="none"
            />
            
            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={closeManualInput}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title="Scan"
                onPress={handleManualQRSubmit}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Instructions Card */}
      <Card style={styles.instructionsCard}>
        <Text style={styles.instructionsTitle}>📱 How to Use</Text>
        <View style={styles.instruction}>
          <Text style={styles.stepNumber}>1.</Text>
          <Text style={styles.stepText}>
            Show your QR code above to the admin at the academy
          </Text>
        </View>
        <View style={styles.instruction}>
          <Text style={styles.stepNumber}>2.</Text>
          <Text style={styles.stepText}>
            Admin will scan for check-in when you arrive
          </Text>
        </View>
        <View style={styles.instruction}>
          <Text style={styles.stepNumber}>3.</Text>
          <Text style={styles.stepText}>
            Scan again when leaving for check-out
          </Text>
        </View>
        <View style={styles.instruction}>
          <Text style={styles.stepNumber}>4.</Text>
          <Text style={styles.stepText}>
            Use "Refresh Status" to update your current status
          </Text>
        </View>
      </Card>

      {/* Warning/Note Card */}
      <Card style={styles.noteCard}>
        <Text style={styles.noteTitle}>⚠️ Important Notes</Text>
        <Text style={styles.noteText}>
          • QR code only works on your booking date{'\n'}
          • Keep your QR code ready when arriving at the academy{'\n'}
          • Contact admin if you face any issues with check-in/out
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
  headerCard: {
    margin: 16,
    padding: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: 'white',
    marginBottom: 4,
  },
  playerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  playerEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  playerId: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  statusCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statusIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusSubtext: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  bookingCard: {
    margin: 16,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  qrCard: {
    margin: 16,
    marginTop: 0,
    alignItems: 'center',
  },
  qrSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  qrImage: {
    width: 200,
    height: 200,
  },
  toggleButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 6,
  },
  toggleButtonText: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  tokenContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  tokenLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  tokenBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  tokenText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'monospace',
    color: Colors.text.primary,
    marginRight: 8,
  },
  tokenHint: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  actionContainer: {
    margin: 16,
    marginTop: 0,
  },
  refreshButton: {
    marginBottom: 12,
  },
  actionButton: {
    marginBottom: 12,
  },
  scanButton: {
    marginBottom: 12,
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
  qrInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
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
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  instructionsCard: {
    margin: 16,
    marginTop: 0,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  instruction: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
    marginRight: 8,
    width: 20,
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
    marginBottom: 32,
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
