import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  RefreshControl,
} from 'react-native';
import Card from '../../components/Card';
import Loading from '../../components/Loading';
import Colors from '../../config/colors';
import {formatCurrency, formatDate, formatTime} from '../../utils/helpers';
import SlotsService from '../../services/slots.service';
import {Slot} from '../../types';

interface Props {
  navigation: any;
  route: any;
}

const SlotsListScreen: React.FC<Props> = ({navigation, route}) => {
  const {sportId, sportName} = route.params;
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSlots();
  }, [sportId]);

  const fetchSlots = async () => {
    try {
      const data = await SlotsService.getAllSlots({
        sport: sportId,
        available: true,
      });
      setSlots(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load slots');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchSlots();
  };

  const handleBookSlot = (slot: Slot) => {
    navigation.navigate('Booking', {slot});
  };

  const renderSlot = ({item}: {item: Slot}) => (
    <Card onPress={() => handleBookSlot(item)} style={styles.card}>
      <View style={styles.slotHeader}>
        <Text style={styles.date}>{formatDate(item.date)}</Text>
        <View
          style={[
            styles.statusBadge,
            {backgroundColor: item.is_available ? Colors.available : Colors.booked},
          ]}>
          <Text style={styles.statusText}>
            {item.is_available ? 'Available' : 'Booked'}
          </Text>
        </View>
      </View>

      <View style={styles.timeContainer}>
        <Text style={styles.timeLabel}>Time:</Text>
        <Text style={styles.time}>
          {formatTime(item.start_time)} - {formatTime(item.end_time)}
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.price}>{formatCurrency(item.price)}</Text>
        <Text style={styles.players}>Max {item.max_players} players</Text>
      </View>
    </Card>
  );

  if (loading) return <Loading />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{sportName}</Text>
        <Text style={styles.headerSubtitle}>
          {slots.length} available slots
        </Text>
      </View>

      {slots.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No available slots found</Text>
        </View>
      ) : (
        <FlatList
          data={slots}
          renderItem={renderSlot}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
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
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  date: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.light,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginRight: 8,
  },
  time: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  players: {
    fontSize: 14,
    color: Colors.text.secondary,
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
});

export default SlotsListScreen;
