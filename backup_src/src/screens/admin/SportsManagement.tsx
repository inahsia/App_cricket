import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Card } from 'react-native-elements';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useNavigation } from '@react-navigation/native';

const SportsManagement = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [sports, setSports] = useState([]);

  useEffect(() => {
    loadSports();
  }, []);

  const loadSports = async () => {
    try {
      setRefreshing(true);
      // Add your API call here
      // const response = await api.getSports();
      // setSports(response.data);
      setRefreshing(false);
    } catch (error) {
      console.error('Error loading sports:', error);
      setRefreshing(false);
      Alert.alert('Error', 'Failed to load sports');
    }
  };

  const handleToggleActive = async (sportId, currentStatus) => {
    try {
      // Add your API call here
      // await api.updateSport(sportId, { is_active: !currentStatus });
      await loadSports();
    } catch (error) {
      console.error('Error updating sport:', error);
      Alert.alert('Error', 'Failed to update sport status');
    }
  };

  const handleDelete = (sportId) => {
    Alert.alert(
      'Delete Sport',
      'Are you sure you want to delete this sport?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Add your API call here
              // await api.deleteSport(sportId);
              await loadSports();
            } catch (error) {
              console.error('Error deleting sport:', error);
              Alert.alert('Error', 'Failed to delete sport');
            }
          },
        },
      ]
    );
  };

  const renderSportItem = ({ item }) => (
    <Card containerStyle={styles.sportCard}>
      <View style={styles.sportHeader}>
        <Text style={styles.sportName}>{item.name}</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.statusButton,
              item.is_active ? styles.activeButton : styles.inactiveButton,
            ]}
            onPress={() => handleToggleActive(item.id, item.is_active)}
          >
            <Text style={styles.statusButtonText}>
              {item.is_active ? 'Active' : 'Inactive'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('EditSport', { sportId: item.id })}
          >
            <Icon name="edit" size={20} color="#4B5563" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => handleDelete(item.id)}
          >
            <Icon name="trash" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.sportDetails}>
        <View style={styles.detailItem}>
          <Icon name="money" size={16} color="#6B7280" />
          <Text style={styles.detailText}>₹{item.price_per_hour}/hour</Text>
        </View>
        <View style={styles.detailItem}>
          <Icon name="users" size={16} color="#6B7280" />
          <Text style={styles.detailText}>Max {item.max_players} players</Text>
        </View>
        <View style={styles.detailItem}>
          <Icon name="clock-o" size={16} color="#6B7280" />
          <Text style={styles.detailText}>{item.duration_minutes} minutes</Text>
        </View>
      </View>
    </Card>
  );

  return (
    <DashboardLayout title="Sports Management">
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddSport')}
        >
          <Icon name="plus" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add New Sport</Text>
        </TouchableOpacity>

        <FlatList
          data={sports || []}
          renderItem={renderSportItem}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={loadSports} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No sports available. Add your first sport to get started.
              </Text>
            </View>
          }
        />
      </View>
    </DashboardLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    margin: 16,
  },
  addButtonText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  sportCard: {
    borderRadius: 8,
    padding: 16,
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  sportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sportName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginRight: 8,
  },
  activeButton: {
    backgroundColor: '#D1FAE5',
  },
  inactiveButton: {
    backgroundColor: '#FEE2E2',
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  iconButton: {
    padding: 8,
  },
  sportDetails: {
    marginTop: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  detailText: {
    marginLeft: 8,
    color: '#6B7280',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  emptyText: {
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default SportsManagement;