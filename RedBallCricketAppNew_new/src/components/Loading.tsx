import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import Colors from '../config/colors';

interface LoadingProps {
  size?: 'small' | 'large';
  color?: string;
}

const Loading: React.FC<LoadingProps> = ({
  size = 'large',
  color = Colors.primary,
}) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});

export default Loading;
