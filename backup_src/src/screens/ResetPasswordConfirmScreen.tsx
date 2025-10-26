import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import InputField from '../components/InputField';
import Button from '../components/Button';
import Colors from '../config/colors';
import AuthService from '../services/auth.service';

const ResetPasswordConfirmScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  
  const [formData, setFormData] = useState({
    uid: '',
    token: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Parse uid and token from route params if provided
    if (route.params?.uid && route.params?.token) {
      setFormData(prev => ({
        ...prev,
        uid: route.params.uid,
        token: route.params.token,
      }));
    }
  }, [route.params]);

  const validate = (): boolean => {
    const newErrors: any = {};

    if (!formData.uid.trim()) {
      newErrors.uid = 'UID is required';
    }

    if (!formData.token.trim()) {
      newErrors.token = 'Token is required';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await AuthService.confirmPasswordReset({
        uid: formData.uid,
        token: formData.token,
        new_password: formData.newPassword,
      });

      Alert.alert(
        'Success',
        'Your password has been reset successfully! You can now login with your new password.',
        [
          {
            text: 'Go to Login',
            onPress: () => navigation.navigate('Login'),
          },
        ],
      );
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to reset password. The link may have expired. Please request a new reset link.';
      
      Alert.alert('Error', errorMessage);
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
        <View style={styles.header}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter the reset code from your email and choose a new password
          </Text>
        </View>

        <View style={styles.form}>
          {!route.params?.uid && (
            <InputField
              label="UID"
              value={formData.uid}
              onChangeText={text => setFormData({...formData, uid: text})}
              error={errors.uid}
              placeholder="Enter UID from email"
              autoCapitalize="none"
            />
          )}

          {!route.params?.token && (
            <InputField
              label="Token"
              value={formData.token}
              onChangeText={text => setFormData({...formData, token: text})}
              error={errors.token}
              placeholder="Enter token from email"
              autoCapitalize="none"
            />
          )}

          <InputField
            label="New Password"
            value={formData.newPassword}
            onChangeText={text => setFormData({...formData, newPassword: text})}
            error={errors.newPassword}
            placeholder="Minimum 6 characters"
            secureTextEntry
          />

          <InputField
            label="Confirm New Password"
            value={formData.confirmPassword}
            onChangeText={text => setFormData({...formData, confirmPassword: text})}
            error={errors.confirmPassword}
            placeholder="Re-enter new password"
            secureTextEntry
          />

          <Button
            title="Reset Password"
            onPress={handleResetPassword}
            loading={loading}
            style={styles.button}
          />

          <Button
            title="Back to Login"
            onPress={() => navigation.navigate('Login')}
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
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  form: {
    width: '100%',
  },
  button: {
    marginTop: 16,
  },
});

export default ResetPasswordConfirmScreen;
