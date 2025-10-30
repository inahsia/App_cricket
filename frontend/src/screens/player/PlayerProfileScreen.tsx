import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import AuthService from '../../services/auth.service';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import Colors from '../../config/colors';

const PlayerProfileScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [player, setPlayer] = useState<any>(null);

  useEffect(() => {
    loadPlayerData();
  }, []);

  const loadPlayerData = async () => {
    try {
      setLoading(true);
      const userData = await AuthService.getCurrentUser();
      setPlayer(userData);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      '🚪 Logout',
      'Are you sure you want to logout?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AuthService.logout();
              navigation.reset({
                index: 0,
                routes: [{name: 'Login' as never}],
              });
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ],
    );
  };

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword' as never);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>🎾</Text>
        </View>
        <Text style={styles.name}>
          {player?.first_name || player?.email?.split('@')[0] || 'Player'}
        </Text>
        <Text style={styles.email}>{player?.email || ''}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>🏏 Player</Text>
        </View>
      </View>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>⚙️ Account Settings</Text>
        
        <TouchableOpacity
          style={styles.menuItem}
          onPress={handleChangePassword}>
          <Text style={styles.menuIcon}>🔑</Text>
          <Text style={styles.menuText}>Change Password</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>👤</Text>
          <Text style={styles.menuText}>Edit Profile</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>ℹ️ About</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>App Version</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Role</Text>
          <Text style={styles.infoValue}>Player</Text>
        </View>
      </Card>

      <Button
        title="🚪 Logout"
        onPress={handleLogout}
        style={styles.logoutButton}
        variant="outline"
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          🏏 Red Ball Cricket Academy 🎾
        </Text>
        <Text style={styles.footerSubtext}>
          Play. Practice. Perfect.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    padding: 32,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 48,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 12,
  },
  roleBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
  },
  menuArrow: {
    fontSize: 24,
    color: Colors.text.secondary,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  logoutButton: {
    margin: 16,
    marginTop: 8,
    borderColor: Colors.error,
  },
  footer: {
    alignItems: 'center',
    padding: 32,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontStyle: 'italic',
  },
});

export default PlayerProfileScreen;
