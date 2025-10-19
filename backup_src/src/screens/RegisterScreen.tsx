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

const RegisterScreen = () => {
  const navigation = useNavigation<any>();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
  });
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const newErrors: any = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await AuthService.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
      });

      Alert.alert('Success', 'Account created successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.reset({index: 0, routes: [{name: 'UserTab'}]}),
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        'Registration Failed',
        error.response?.data?.message || 'Unable to create account. Please try again.',
      );
    } finally {
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
        <Text style={styles.title}>Create Account</Text>

        <View style={styles.form}>
          <InputField
            label="Username *"
            value={formData.username}
            onChangeText={text => setFormData({...formData, username: text})}
            error={errors.username}
            placeholder="Choose a username"
            autoCapitalize="none"
          />

          <InputField
            label="Email *"
            value={formData.email}
            onChangeText={text => setFormData({...formData, email: text})}
            error={errors.email}
            placeholder="your@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <InputField
            label="First Name"
            value={formData.first_name}
            onChangeText={text => setFormData({...formData, first_name: text})}
            placeholder="First name (optional)"
          />

          <InputField
            label="Last Name"
            value={formData.last_name}
            onChangeText={text => setFormData({...formData, last_name: text})}
            placeholder="Last name (optional)"
          />

          <InputField
            label="Password *"
            value={formData.password}
            onChangeText={text => setFormData({...formData, password: text})}
            error={errors.password}
            placeholder="Minimum 6 characters"
            secureTextEntry
          />

          <InputField
            label="Confirm Password *"
            value={formData.confirmPassword}
            onChangeText={text => setFormData({...formData, confirmPassword: text})}
            error={errors.confirmPassword}
            placeholder="Re-enter password"
            secureTextEntry
          />

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
            style={styles.button}
          />

          <Button
            title="Already have an account? Login"
            onPress={() => navigation.goBack()}
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
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 24,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  button: {
    marginTop: 8,
  },
});

export default RegisterScreen;
