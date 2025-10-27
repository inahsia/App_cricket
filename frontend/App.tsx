/**
 * Red Ball Cricket Academy App
 * @format
 */

import React, {useEffect} from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import Navigation from './src/navigation';
import {LogBox, StyleSheet} from 'react-native';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Sending `onAnimatedValueUpdate`',
  'Non-serializable values were found in the navigation state',
]);

// Error Boundary Component
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {hasError: false, error: null};

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {hasError: true, error};
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error);
    console.error('Error Info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

const App = () => {
  useEffect(() => {
    console.log('🏏 Red Ball Cricket Academy App initialized');
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <ErrorBoundary>
        <SafeAreaProvider>
          <Navigation />
        </SafeAreaProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
