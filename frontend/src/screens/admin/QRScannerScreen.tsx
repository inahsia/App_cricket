import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Colors from '../../config/colors';

const QRScannerScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>📷</Text>
      <Text style={styles.text}>QR Scanner</Text>
      <Text style={styles.subtext}>
        QR Scanner will be added in the next update
      </Text>
      <Text style={styles.note}>
        See QR_SCANNER_TODO.md for implementation details
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.default,
    padding: 32,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  text: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  subtext: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  note: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default QRScannerScreen;
