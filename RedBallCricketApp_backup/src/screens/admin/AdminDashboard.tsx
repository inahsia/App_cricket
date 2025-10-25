import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Card } from 'react-native-elements';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useNavigation } from '@react-navigation/native';

const AdminDashboard = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = React.useState(false);
  const [stats, setStats] = React.useState({
    totalBookings: 0,
    activeUsers: 0,
    totalRevenue: 0,
    activeSports: 0,
    totalSlots: 0,
    upcomingBookings: 0
  });

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Fetch your data here
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Add your API call here
      // const response = await api.getDashboardStats();
      // setStats(response.data);
      setRefreshing(false);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setRefreshing(false);
    }
  };

  const StatCard = ({ title, value, icon, onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.cardContainer}>
      <Card containerStyle={styles.card}>
        <View style={styles.cardContent}>
          <Icon name={icon} size={24} color="#4B5563" />
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardValue}>{value}</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <DashboardLayout title="Dashboard">
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Bookings"
            value={stats.totalBookings}
            icon="calendar"
            onPress={() => navigation.navigate('Bookings')}
          />
          <StatCard
            title="Active Users"
            value={stats.activeUsers}
            icon="users"
            onPress={() => navigation.navigate('Users')}
          />
          <StatCard
            title="Revenue"
            value={`₹${stats.totalRevenue}`}
            icon="money"
            onPress={() => navigation.navigate('Bookings')}
          />
          <StatCard
            title="Active Sports"
            value={stats.activeSports}
            icon="futbol-o"
            onPress={() => navigation.navigate('Sports')}
          />
        </View>

        {/* Quick Actions */}
        <Card containerStyle={styles.actionsCard}>
          <Card.Title>Quick Actions</Card.Title>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('SportsManagement')}
            >
              <Icon name="futbol-o" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Sports</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#10B981' }]}
              onPress={() => navigation.navigate('ManageSlots')}
            >
              <Icon name="clock-o" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Slots</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#F59E0B', marginTop: 12 }]}
              onPress={() => navigation.navigate('AllBookings')}
            >
              <Icon name="calendar" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Bookings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#8B5CF6', marginTop: 12 }]}
              onPress={() => navigation.navigate('BookingHistory')}
            >
              <Icon name="users" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Players</Text>
            </TouchableOpacity>
          </View>
        </Card>
      </ScrollView>
    </DashboardLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  cardContainer: {
    width: '50%',
    padding: 8,
  },
  card: {
    margin: 0,
    borderRadius: 8,
    elevation: 2,
  },
  cardContent: {
    alignItems: 'center',
    padding: 16,
  },
  cardTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 4,
  },
  actionsCard: {
    margin: 16,
    borderRadius: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  actionButtonText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: '500',
  },
});

export default AdminDashboard;