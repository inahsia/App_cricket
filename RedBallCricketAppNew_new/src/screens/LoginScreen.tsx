import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import InputField from '../components/InputField';
import Button from '../components/Button';
import Colors from '../config/colors';
import AuthService from '../services/auth.service';
import {validateEmail} from '../utils/helpers';

const LoginScreen = () => {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const newErrors: {email?: string; password?: string} = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    try {
      console.log('=== Starting Login Process ===');
      console.log('Validating input...');
      
      if (!validate()) {
        console.log('Validation failed');
        return;
      }
      
      console.log('Input validation passed');
      console.log('Credentials being used:', { email, password: '****' });
      
      setLoading(true);
      console.log('Loading state set to true');
      
      // Add a small delay to ensure all native modules are initialized
      console.log('Waiting for modules initialization...');
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Delay completed, attempting login...');

      const response = await AuthService.login({email, password});
      console.log('Login response received:', {
        success: true,
        hasToken: !!response.token,
        userData: response.user ? {
          id: response.user.id,
          email: response.user.email,
          isStaff: response.user.is_staff
        } : null
      });
      
      // Navigate based on user role
      console.log('Getting user role...');
      const role = await AuthService.getUserRole();
      console.log('User role retrieved:', role);

      console.log('Navigating to dashboard...');
      if (role === 'admin') {
        navigation.reset({index: 0, routes: [{name: 'AdminTab'}]});
      } else if (role === 'player') {
        navigation.reset({index: 0, routes: [{name: 'PlayerTab'}]});
      } else {
        navigation.reset({index: 0, routes: [{name: 'UserTab'}]});
      }
      console.log('Navigation completed successfully');

    } catch (error: any) {
      console.log('=== Login Error Details ===');
      console.log('Error type:', error.constructor.name);
      console.log('Error message:', error.message);
      console.log('Response status:', error.response?.status);
      console.log('Response data:', error.response?.data);
      console.log('Request config:', {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
        headers: error.config?.headers
      });
      
      Alert.alert(
        'Login Failed',
        error.response?.data?.error || error.response?.data?.message || error.message || 'Invalid credentials. Please try again.',
      );
    } finally {
      console.log('=== Login Process Completed ===');
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Red Ball Cricket Academy</Text>
          <Text style={styles.subtitle}>Welcome Back!</Text>
        </View>

        <View style={styles.form}>
          <InputField
            label="Email"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            placeholder="Enter your email"
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <InputField
            label="Password"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            placeholder="Enter your password"
            secureTextEntry
          />

          <Button
            title="Forgot Password?"
            onPress={() => navigation.navigate('ForgotPassword')}
            variant="text"
            style={styles.forgotButton}
          />

          <Button
            title="Login"
            onPress={handleLogin}
            loading={loading}
            style={styles.button}
          />

          <Button
            title="Create Account"
            onPress={() => navigation.navigate('Register')}
            variant="outline"
            style={styles.button}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  forgotButton: {
    marginTop: -8,
    marginBottom: 8,
  },
  button: {
    marginTop: 8,
  },
});

export default LoginScreen;
