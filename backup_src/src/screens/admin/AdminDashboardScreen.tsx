import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, ScrollView, Alert} from 'react-native';
import DashboardService from '../../services/dashboard.service';
import AuthService from '../../services/auth.service';
import Card from '../../components/Card';
import Loading from '../../components/Loading';
import Colors from '../../config/colors';
import {formatCurrency} from '../../utils/helpers';

const AdminDashboardScreen = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [admin, setAdmin] = useState<any>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [statsData, userData] = await Promise.all([
        DashboardService.getStats(),
        AuthService.getCurrentUser(),
      ]);
      setStats(statsData);
      setAdmin(userData);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcome}>Admin Dashboard</Text>
        <Text style={styles.name}>{admin?.username}</Text>
      </View>

      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{stats?.total_bookings || 0}</Text>
          <Text style={styles.statLabel}>Total Bookings</Text>
        </Card>

        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{stats?.total_sports || 0}</Text>
          <Text style={styles.statLabel}>Sports</Text>
        </Card>

        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{stats?.total_slots || 0}</Text>
          <Text style={styles.statLabel}>Time Slots</Text>
        </Card>

        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{stats?.total_players || 0}</Text>
          <Text style={styles.statLabel}>Players</Text>
        </Card>
      </View>

      {stats?.total_revenue !== undefined && (
        <Card style={styles.revenueCard}>
          <Text style={styles.revenueLabel}>Total Revenue</Text>
          <Text style={styles.revenueValue}>
            {formatCurrency(stats.total_revenue)}
          </Text>
        </Card>
      )}

      <Card style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <Text style={styles.actionItem}>📊 View All Bookings</Text>
        <Text style={styles.actionItem}>🏏 Manage Sports</Text>
        <Text style={styles.actionItem}>⏰ Manage Time Slots</Text>
        <Text style={styles.actionItem}>
          📷 QR Scanner (Coming Soon)
        </Text>
      </Card>
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
  },
  statCard: {
    width: '48%',
    margin: '1%',
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  revenueCard: {
    margin: 16,
    marginTop: 8,
    padding: 20,
    alignItems: 'center',
    backgroundColor: Colors.primary,
  },
  revenueLabel: {
    fontSize: 16,
    color: Colors.text.light,
    marginBottom: 8,
  },
  revenueValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.text.light,
  },
  quickActions: {
    margin: 16,
    marginTop: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  actionItem: {
    fontSize: 16,
    color: Colors.text.primary,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
});

export default AdminDashboardScreen;
