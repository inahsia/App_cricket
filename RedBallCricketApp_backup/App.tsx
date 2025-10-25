import React, {useEffect} from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import Navigation from './src/navigation';
import {LogBox} from 'react-native';

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
      return null; // Return null to allow React Native's error screen to show
    }
    return this.props.children;
  }
}

const App = () => {
  useEffect(() => {
    // Add any initialization logic here
    console.log('App initialized');
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <Navigation />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
};

export default App;
