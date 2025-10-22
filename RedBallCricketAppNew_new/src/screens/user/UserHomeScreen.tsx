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
import DashboardService from '../../services/dashboard.service';
import BookingsService from '../../services/bookings.service';
import Card from '../../components/Card';
import Loading from '../../components/Loading';
import Colors from '../../config/colors';

const UserHomeScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);

      // Only admins should call admin dashboard stats endpoint
      try {
        const role = await AuthService.getUserRole();
        if (role === 'admin') {
          const adminStats = await DashboardService.getStats();
          setStats(adminStats);
        } else {
          // For non-admin users, compute lightweight stats from their own bookings
          const myBookings = await BookingsService.getMyBookings();
          const today = new Date();
          const upcomingCount = myBookings.filter((b: any) => {
            const dStr = b?.slot_details?.date;
            if (!dStr) return false;
            const d = new Date(`${dStr}T00:00:00`);
            // Consider future or same-day as upcoming
            return d >= new Date(today.getFullYear(), today.getMonth(), today.getDate());
          }).length;

          setStats({
            total_bookings: myBookings.length,
            upcoming_bookings: upcomingCount,
          });
        }
      } catch (err) {
        // Swallow expected errors quietly to avoid noisy logs in user flow
        console.log('Skipping admin stats for non-admin or stats unavailable');
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await AuthService.logout();
          navigation.reset({
            index: 0,
            routes: [{name: 'Login' as never}],
          });
        },
      },
    ]);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcome}>Welcome back!</Text>
        <Text style={styles.name}>{user?.email || user?.first_name || 'User'}</Text>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <Card style={styles.actionCard}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Sports' as never)}>
            <Text style={styles.actionIcon}>🏏</Text>
            <Text style={styles.actionTitle}>Browse Sports</Text>
            <Text style={styles.actionDesc}>View available sports</Text>
          </TouchableOpacity>
        </Card>

        <Card style={styles.actionCard}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('My Bookings' as never)}>
            <Text style={styles.actionIcon}>📅</Text>
            <Text style={styles.actionTitle}>My Bookings</Text>
            <Text style={styles.actionDesc}>View your bookings</Text>
          </TouchableOpacity>
        </Card>

        <Card style={styles.actionCard}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('ChangePassword' as never)}>
            <Text style={styles.actionIcon}>🔒</Text>
            <Text style={styles.actionTitle}>Change Password</Text>
            <Text style={styles.actionDesc}>Update your password</Text>
          </TouchableOpacity>
        </Card>
      </View>

      {stats && (
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Stats</Text>
          <Card>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.total_bookings || 0}</Text>
                <Text style={styles.statLabel}>Total Bookings</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {stats.upcoming_bookings || 0}
                </Text>
                <Text style={styles.statLabel}>Upcoming</Text>
              </View>
            </View>
          </Card>
        </View>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.default,
  },
  header: {
    padding: 20,
    backgroundColor: Colors.primary,
  },
  welcome: {
    fontSize: 16,
    color: Colors.text.light,
    marginBottom: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.light,
  },
  quickActions: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  actionCard: {
    marginBottom: 12,
  },
  actionButton: {
    alignItems: 'center',
    padding: 16,
  },
  actionIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  actionDesc: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  statsSection: {
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  logoutButton: {
    margin: 16,
    padding: 16,
    backgroundColor: Colors.error,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: Colors.text.light,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default UserHomeScreen;
