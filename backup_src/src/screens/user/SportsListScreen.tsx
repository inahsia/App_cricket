import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import Card from '../../components/Card';
import Loading from '../../components/Loading';
import Button from '../../components/Button';
import Colors from '../../config/colors';
import {formatCurrency} from '../../utils/helpers';
import SportsService from '../../services/sports.service';
import {Sport} from '../../types';

interface Props {
  navigation: any;
}

const SportsListScreen: React.FC<Props> = ({navigation}) => {
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSports();
  }, []);

  const fetchSports = async () => {
    try {
      const data = await SportsService.getAllSports();
      setSports(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load sports');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchSports();
  };

  const handleViewSlots = (sport: Sport) => {
    navigation.navigate('Slots', {
      sportId: sport.id,
      sportName: sport.name,
    });
  };

  const renderSport = ({item}: {item: Sport}) => (
    <Card style={styles.card}>
      <View style={styles.sportContent}>
        <View style={styles.sportInfo}>
          <Text style={styles.sportName}>{item.name}</Text>
          {item.description && (
            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>
          )}
          <View style={styles.priceRow}>
            <Text style={styles.price}>
              {formatCurrency(item.price_per_hour)}/hour
            </Text>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor:
                    item.available_slots_count > 0
                      ? Colors.success
                      : Colors.error,
                },
              ]}>
              <Text style={styles.badgeText}>
                {item.available_slots_count} slots
              </Text>
            </View>
          </View>
        </View>

        <Button
          title="View Slots"
          onPress={() => handleViewSlots(item)}
          size="small"
          disabled={item.available_slots_count === 0}
        />
      </View>
    </Card>
  );

  if (loading) return <Loading />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Available Sports</Text>
        <Text style={styles.headerSubtitle}>
          Choose a sport to book your slot
        </Text>
      </View>

      {sports.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No sports available</Text>
        </View>
      ) : (
        <FlatList
          data={sports}
          renderItem={renderSport}
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
  sportContent: {
    flexDirection: 'column',
  },
  sportInfo: {
    marginBottom: 16,
  },
  sportName: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.light,
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

export default SportsListScreen;
