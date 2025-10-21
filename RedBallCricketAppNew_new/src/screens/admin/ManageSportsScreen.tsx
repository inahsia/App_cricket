import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  RefreshControl,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import Card from '../../components/Card';
import Loading from '../../components/Loading';
import Button from '../../components/Button';
import InputField from '../../components/InputField';
import Colors from '../../config/colors';
import SportsService from '../../services/sports.service';
import {Sport} from '../../types';

const ManageSportsScreen = () => {
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingSport, setEditingSport] = useState<Sport | null>(null);

  // form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [pricePerHour, setPricePerHour] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('60');
  const [maxPlayers, setMaxPlayers] = useState('10');

  useEffect(() => {
    fetchSports();
  }, []);

  const fetchSports = async () => {
    try {
      const data = await SportsService.getAllSports();
      setSports(Array.isArray(data) ? data : []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load sports');
      setSports([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchSports();
  };

  const openCreateModal = () => {
    setEditingSport(null);
    setName('');
    setDescription('');
    setPricePerHour('');
    setDurationMinutes('60');
    setMaxPlayers('10');
    setModalVisible(true);
  };

  const openEditModal = (sport: Sport) => {
    setEditingSport(sport);
    setName(sport.name || '');
    setDescription(sport.description || '');
    setPricePerHour(sport.price_per_hour?.toString() || '');
    setDurationMinutes(sport.duration?.toString() || '60');
    setMaxPlayers(sport.max_players?.toString() || '10');
    setModalVisible(true);
  };

  const handleCreateOrUpdate = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Please enter sport name');
      return;
    }

    const payload: Partial<Sport> = {
      name: name.trim(),
      description: description.trim(),
      price_per_hour: pricePerHour || '0',
      duration: parseInt(durationMinutes, 10),
      max_players: parseInt(maxPlayers, 10),
      is_active: true,
    };

    try {
      setCreating(true);
      if (editingSport) {
        const updated = await SportsService.updateSport(editingSport.id, payload);
        setSports(prev => prev.map(s => s.id === updated.id ? updated : s));
        Alert.alert('Success', 'Sport updated successfully');
      } else {
        const created = await SportsService.createSport(payload);
        setSports(prev => [created, ...prev]);
        Alert.alert('Success', 'Sport created successfully');
      }
      setModalVisible(false);
      setEditingSport(null);
    } catch (error) {
      Alert.alert('Error', editingSport ? 'Failed to update sport' : 'Failed to create sport');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = (sport: Sport) => {
    Alert.alert('Delete Sport', `Delete "${sport.name}"?`, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await SportsService.deleteSport(sport.id);
            setSports(prev => prev.filter(s => s.id !== sport.id));
          } catch (error) {
            Alert.alert('Error', 'Failed to delete sport');
          }
        },
      },
    ]);
  };

  const renderSport = ({item}: {item: Sport}) => (
    <Card style={styles.card} title={item.name} subtitle={item.is_active ? 'Active' : 'Inactive'}>
      <Text style={styles.description}>{item.description}</Text>
      <View style={styles.row}>
        <Text style={styles.price}>{`₹ ${item.price_per_hour}/hour`}</Text>
        <View style={styles.actions}>
          <Button title="Edit" onPress={() => openEditModal(item)} size="small" variant="outline" style={{marginRight: 8}} />
          <Button title="Delete" onPress={() => handleDelete(item)} size="small" variant="danger" />
        </View>
      </View>
    </Card>
  );

  if (loading) return <Loading />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Manage Sports</Text>
        <Text style={styles.headerSubtitle}>Add, edit or remove sports</Text>
      </View>

      <View style={styles.toolbar}>
        <Button title="Add Sport" onPress={openCreateModal} />
        <TouchableOpacity onPress={onRefresh} style={styles.refreshTouchable}>
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={sports || []}
        renderItem={renderSport}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No sports found</Text>
            </View>
          ) : null
        }
      />

      <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{editingSport ? 'Edit Sport' : 'Create Sport'}</Text>
            <InputField label="Name" value={name} onChangeText={setName} placeholder="e.g. Cricket" />
            <InputField label="Description" value={description} onChangeText={setDescription} placeholder="Short description" />
            <InputField label="Price per hour" value={pricePerHour} onChangeText={setPricePerHour} placeholder="0" keyboardType="numeric" />
            <InputField label="Duration (minutes)" value={durationMinutes} onChangeText={setDurationMinutes} placeholder="60" keyboardType="numeric" />
            <InputField label="Max players" value={maxPlayers} onChangeText={setMaxPlayers} placeholder="10" keyboardType="numeric" />

            <View style={styles.modalActions}>
              <Button title="Cancel" onPress={() => { setModalVisible(false); setEditingSport(null); }} variant="outline" />
              <Button title={editingSport ? 'Update' : 'Create'} onPress={handleCreateOrUpdate} loading={creating} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.light,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.text.light,
    opacity: 0.9,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  refreshTouchable: {
    padding: 8,
  },
  refreshText: {
    color: Colors.primary,
    fontWeight: '700',
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 12,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
});

export default ManageSportsScreen;
