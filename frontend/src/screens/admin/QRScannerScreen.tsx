/**
 * QR Scanner Screen for Admin
 * 
 * Allows admins to scan player QR codes for check-in/check-out
 * Features:
 * - Camera-based QR scanning
 * - Manual QR input option
 * - Real-time status updates
 * - Check-in/out confirmation
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Linking,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Camera, CameraType } from 'react-native-camera-kit';
import ApiService from '../../services/api.service';
import Colors from '../../config/colors';
import Card from '../../components/Card';
import Button from '../../components/Button';

interface ScanResult {
  type: 'USER' | 'PLAYER';
  user?: {
    id: number;
    email: string;
    is_in: boolean;
    check_in_count: number;
  };
  player?: {
    id: number;
    name: string;
    email: string;
    status: string;
    is_in: boolean;
    booking_details?: {
      sport: string;
      slot_date: string;
      start_time: string;
      end_time: string;
    };
  };
  message: string;
  action: 'IN' | 'OUT';
}

const QRScannerScreen = () => {
  const [manualQR, setManualQR] = useState('');
  const [lastScan, setLastScan] = useState<ScanResult | null>(null);
  const [processing, setProcessing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [scannedCode, setScannedCode] = useState<string>('');
  const [hasPermission, setHasPermission] = useState(false);

  // Request camera permission on mount
  useEffect(() => {
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'This app needs access to your camera to scan QR codes.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        setHasPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            'Camera Permission Required',
            'Please enable camera permission in your device settings to use the QR scanner.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
            ]
          );
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      // iOS permissions are handled automatically
      setHasPermission(true);
    }
  };

  const handleBarCodeRead = (event: any) => {
    if (processing || !event?.nativeEvent?.codeStringValue) return;
    
    const qrData = event.nativeEvent.codeStringValue;
    if (qrData && qrData !== scannedCode) {
      setScannedCode(qrData);
      handleScan(qrData);
    }
  };

  const handleScan = async (qrData: string) => {

    try {
      setProcessing(true);
      console.log('Scanning QR code:', qrData);

      let scanResult: ScanResult | null = null;

      // Try player QR first
      try {
        const playerResponse = await ApiService.post<{
          message: string;
          player: any;
          action?: 'IN' | 'OUT';
        }>('/players/scan_qr/', {
          token: qrData,
        });

        console.log('Player scan response:', playerResponse);

        const action = playerResponse.player.is_in ? 'IN' : 'OUT';

        scanResult = {
          type: 'PLAYER',
          player: playerResponse.player,
          message: playerResponse.message,
          action,
        };

        Alert.alert(
          '✅ Player Check-In',
          `Player: ${playerResponse.player.name}\n${playerResponse.message}\nStatus: ${
            playerResponse.player.is_in ? 'CHECKED IN ✓' : 'CHECKED OUT ✓'
          }`,
          [{ text: 'OK' }]
        );
      } catch (playerError: any) {
        // If player scan fails, try organizer QR
        console.log('Player scan failed, trying organizer scan...');
        console.log('Player error:', playerError.response?.data || playerError.message);
        
        try {
          const organizerResponse = await ApiService.post<{
            message: string;
            booking: any;
            action?: 'IN' | 'OUT';
          }>('/bookings/scan_organizer_qr/', {
            token: qrData,
          });

          console.log('Organizer scan response:', organizerResponse);

          // If response is an error object (backend may return error as plain object)
          if (typeof organizerResponse === 'object' && organizerResponse !== null && 'error' in organizerResponse) {
            Alert.alert('Scan Failed', (organizerResponse as any).error, [{ text: 'OK' }]);
            return;
          }

          // Defensive: check for booking in response
          if (!organizerResponse.booking) {
            Alert.alert('Scan Failed', 'No booking info in response', [{ text: 'OK' }]);
            return;
          }

          const action = organizerResponse.booking.organizer_is_in ? 'IN' : 'OUT';

          scanResult = {
            type: 'USER',
            user: {
              id: organizerResponse.booking.user,
              email: organizerResponse.booking.user_email || 'Organizer',
              is_in: organizerResponse.booking.organizer_is_in,
              check_in_count: organizerResponse.booking.organizer_check_in_count,
            },
            message: organizerResponse.message,
            action,
          };

          Alert.alert(
            '✅ Organizer Check-In',
            `Organizer Booking: ${organizerResponse.booking.slot?.sport?.name || 'Sport'}\n${organizerResponse.message}\nStatus: ${
              organizerResponse.booking.organizer_is_in ? 'CHECKED IN ✓' : 'CHECKED OUT ✓'
            }`,
            [{ text: 'OK' }]
          );
        } catch (organizerError: any) {
          // Both failed - invalid QR
          console.log('Organizer scan error:', organizerError.response?.data || organizerError.message);
          console.log('Full organizer error:', organizerError);
          // Show backend error if present
          const backendError = organizerError.response?.data?.error || organizerError.message || 'Invalid QR code - not a player or organizer token';
          Alert.alert('Scan Failed', backendError, [{ text: 'OK' }]);
          return;
        }
      }

      if (scanResult) {
        setLastScan(scanResult);
      }
    } catch (error: any) {
      console.error('QR Scan error:', error);
      Alert.alert(
        'Scan Failed',
        error.response?.data?.error ||
          error.message ||
          'Failed to process QR code',
        [{ text: 'OK' }]
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleManualSubmit = () => {
    if (!manualQR.trim()) {
      Alert.alert('Error', 'Please enter a QR code');
      return;
    }
    handleScan(manualQR.trim());
    setManualQR('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Show camera scanner
  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <Camera
          style={styles.camera}
          cameraType={CameraType.Back}
          scanBarcode={true}
          onReadCode={handleBarCodeRead}
          showFrame={true}
          laserColor="rgba(255, 0, 0, 0.5)"
          frameColor="white"
        />
        <View style={styles.cameraOverlay}>
          <View style={styles.topOverlay}>
            <Text style={styles.scanTitle}>Scan QR Code</Text>
            <Text style={styles.scanSubtitle}>Position the QR code within the frame</Text>
          </View>
          
          <View style={styles.middleOverlay}>
            <View style={styles.sideOverlay} />
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            <View style={styles.sideOverlay} />
          </View>
          
          <View style={styles.bottomOverlay}>
            {processing && (
              <View style={styles.processingBanner}>
                <Text style={styles.processingText}>Processing...</Text>
              </View>
            )}
            <TouchableOpacity 
              style={styles.manualInputButton}
              onPress={() => {
                setShowCamera(false);
                setScannedCode('');
              }}
            >
              <Icon name="keyboard" size={24} color="white" />
              <Text style={styles.manualInputText}>Enter Manually</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <Card style={styles.headerCard}>
        <Icon name="qr-code-scanner" size={48} color="white" />
        <Text style={styles.headerTitle}>QR Code Scanner</Text>
        <Text style={styles.headerSubtitle}>
          Scan player or organizer QR codes for check-in/check-out
        </Text>
      </Card>

      {/* Camera Scanner Button */}
      <Card style={styles.inputCard}>
        <Text style={styles.sectionTitle}>Scan with Camera</Text>
        <Text style={styles.sectionSubtitle}>
          Use your device camera to scan QR codes
        </Text>
        <Button
          title="Open Camera Scanner"
          onPress={() => setShowCamera(true)}
          icon={<Icon name="camera" size={20} color="white" />}
          style={styles.cameraButton}
        />
      </Card>

      {/* Manual Input Section */}
      <Card style={styles.inputCard}>
        <Text style={styles.sectionTitle}>Or Enter Manually</Text>
        <Text style={styles.sectionSubtitle}>
          Copy and paste the QR token from the player's screen
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Paste QR code token here..."
          placeholderTextColor={Colors.text.secondary}
          value={manualQR}
          onChangeText={setManualQR}
          multiline
          numberOfLines={3}
        />

        <Button
          title="Scan QR Code"
          onPress={handleManualSubmit}
          loading={processing}
          disabled={!manualQR.trim() || processing}
          style={styles.scanButton}
        />
      </Card>

      {/* Last Scan Result */}
      {lastScan && (
        <Card style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <Icon
              name={lastScan.action === 'IN' ? 'login' : 'logout'}
              size={32}
              color={lastScan.action === 'IN' ? Colors.success : Colors.warning}
            />
            <Text style={styles.resultTitle}>
              {lastScan.type === 'USER' ? 'Organizer Scan' : 'Player Scan'}
            </Text>
          </View>

          <View style={styles.statusBadge}>
            <View
              style={[
                styles.statusIndicator,
                {
                  backgroundColor: (lastScan.player?.is_in || lastScan.user?.is_in)
                    ? Colors.success
                    : Colors.error,
                },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                {
                  color: (lastScan.player?.is_in || lastScan.user?.is_in) ? Colors.success : Colors.error,
                },
              ]}>
              {(lastScan.player?.is_in || lastScan.user?.is_in) ? 'CHECKED IN' : 'CHECKED OUT'}
            </Text>
          </View>

          {lastScan.type === 'PLAYER' && lastScan.player && (
            <>
              <View style={styles.resultInfo}>
                <Text style={styles.resultLabel}>Player:</Text>
                <Text style={styles.resultValue}>{lastScan.player.name}</Text>
              </View>

              <View style={styles.resultInfo}>
                <Text style={styles.resultLabel}>Email:</Text>
                <Text style={styles.resultValue}>{lastScan.player.email}</Text>
              </View>

              {lastScan.player.booking_details && (
                <>
                  <View style={styles.resultInfo}>
                    <Text style={styles.resultLabel}>Sport:</Text>
                    <Text style={styles.resultValue}>
                      {lastScan.player.booking_details.sport}
                    </Text>
                  </View>

                  <View style={styles.resultInfo}>
                    <Text style={styles.resultLabel}>Date:</Text>
                    <Text style={styles.resultValue}>
                      {formatDate(lastScan.player.booking_details.slot_date)}
                    </Text>
                  </View>

                  <View style={styles.resultInfo}>
                    <Text style={styles.resultLabel}>Time:</Text>
                    <Text style={styles.resultValue}>
                      {formatTime(lastScan.player.booking_details.start_time)} -{' '}
                      {formatTime(lastScan.player.booking_details.end_time)}
                    </Text>
                  </View>
                </>
              )}
            </>
          )}

          {lastScan.type === 'USER' && lastScan.user && (
            <>
              <View style={styles.resultInfo}>
                <Text style={styles.resultLabel}>Organizer:</Text>
                <Text style={styles.resultValue}>{lastScan.user.email}</Text>
              </View>

              <View style={styles.resultInfo}>
                <Text style={styles.resultLabel}>Check-in Count:</Text>
                <Text style={styles.resultValue}>{lastScan.user.check_in_count}/2</Text>
              </View>
            </>
          )}

          <View style={styles.messageBanner}>
            <Text style={styles.messageText}>{lastScan.message}</Text>
          </View>
        </Card>
      )}

      {/* Instructions */}
      <Card style={styles.instructionsCard}>
        <Text style={styles.instructionsTitle}>📖 How to Use</Text>
        <View style={styles.instruction}>
          <Text style={styles.stepNumber}>1.</Text>
          <Text style={styles.stepText}>
            Ask the player or organizer to show their QR code from the app
          </Text>
        </View>
        <View style={styles.instruction}>
          <Text style={styles.stepNumber}>2.</Text>
          <Text style={styles.stepText}>
            Long-press the QR code and copy the token value
          </Text>
        </View>
        <View style={styles.instruction}>
          <Text style={styles.stepNumber}>3.</Text>
          <Text style={styles.stepText}>
            Paste the token in the input field above
          </Text>
        </View>
        <View style={styles.instruction}>
          <Text style={styles.stepNumber}>4.</Text>
          <Text style={styles.stepText}>
            Tap "Scan QR Code" to process check-in/out
          </Text>
        </View>
        <View style={styles.instruction}>
          <Text style={styles.stepNumber}>5.</Text>
          <Text style={styles.stepText}>
            First scan = Check IN, Second scan = Check OUT (max 2 scans per QR)
          </Text>
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 32,
  },
  centerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  centerText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  settingsButton: {
    marginTop: 16,
    minWidth: 200,
  },
  manualButton: {
    marginTop: 12,
    minWidth: 200,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  sideOverlay: {
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  cameraButton: {
    backgroundColor: Colors.primary,
  },
  marker: {
    borderColor: Colors.primary,
    borderWidth: 3,
    borderRadius: 16,
  },
  topContent: {
    paddingTop: 40,
    paddingBottom: 20,
    alignItems: 'center',
  },
  bottomContent: {
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  topOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  scanTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  scanSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  middleOverlay: {
    flex: 2,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 280,
    height: 280,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: Colors.primary,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  bottomOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  processingBanner: {
    position: 'absolute',
    top: 20,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  processingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  manualInputButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'white',
  },
  manualInputText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  manualContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerCard: {
    margin: 16,
    padding: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 12,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  noteCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    flexDirection: 'row',
    backgroundColor: Colors.primary + '10',
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  noteContent: {
    flex: 1,
    marginLeft: 12,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  noteText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  inputCard: {
    margin: 16,
    marginTop: 0,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.primary + '10',
  },
  switchButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: Colors.text.primary,
    backgroundColor: Colors.surface,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  scanButton: {
    backgroundColor: Colors.primary,
  },
  resultCard: {
    margin: 16,
    marginTop: 0,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginLeft: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    marginBottom: 16,
  },
  statusIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  resultLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  resultValue: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  messageBanner: {
    marginTop: 16,
    padding: 12,
    backgroundColor: Colors.success + '20',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.success,
  },
  messageText: {
    fontSize: 14,
    color: Colors.success,
    fontWeight: '600',
    textAlign: 'center',
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
  setupCard: {
    margin: 16,
    marginTop: 0,
    marginBottom: 32,
    backgroundColor: Colors.surface,
  },
  setupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  setupText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
});

export default QRScannerScreen;
