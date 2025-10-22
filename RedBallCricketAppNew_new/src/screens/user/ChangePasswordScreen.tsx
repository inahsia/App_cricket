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
import InputField from '../../components/InputField';
import Button from '../../components/Button';
import Colors from '../../config/colors';
import AuthService from '../../services/auth.service';

const ChangePasswordScreen = () => {
  const navigation = useNavigation<any>();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const newErrors: any = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.currentPassword && formData.newPassword && 
        formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await AuthService.changePassword({
        current_password: formData.currentPassword,
        new_password: formData.newPassword,
      });

      Alert.alert(
        'Success',
        'Your password has been changed successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (error: any) {
      const errorMessage = error.response?.data?.current_password?.[0] || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to change password. Please try again.';
      
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
          <Text style={styles.title}>Change Password</Text>
          <Text style={styles.subtitle}>
            Enter your current password and choose a new one
          </Text>
        </View>

        <View style={styles.form}>
          <InputField
            label="Current Password"
            value={formData.currentPassword}
            onChangeText={text => setFormData({...formData, currentPassword: text})}
            error={errors.currentPassword}
            placeholder="Enter current password"
            secureTextEntry
          />

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
            title="Change Password"
            onPress={handleChangePassword}
            loading={loading}
            style={styles.button}
          />

          <Button
            title="Cancel"
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

export default ChangePasswordScreen;
