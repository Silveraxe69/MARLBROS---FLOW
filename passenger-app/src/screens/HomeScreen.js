import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  Searchbar,
  Card,
  Title,
  Paragraph,
  Chip,
  ActivityIndicator,
  Text,
} from 'react-native-paper';
import { useBus } from '../context/BusContext';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const { buses, stops, fetchBuses, fetchStops, loading } = useBus();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([fetchBuses(), fetchStops()]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filteredStops = stops.filter((stop) =>
    stop.stop_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStopPress = (stop) => {
    navigation.navigate('StopArrivals', { stop });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.headerTitle}>🚌 Tamil Nadu State Transport</Title>
        <Paragraph style={styles.headerSubtitle}>
          Official TNSTC Real-time Bus Tracking
        </Paragraph>
      </View>

      <Searchbar
        placeholder="Search bus stops..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Card.Content>
              <Text style={styles.statNumber}>{buses.length}</Text>
              <Text style={styles.statLabel}>Active Buses</Text>
            </Card.Content>
          </Card>
          <Card style={styles.statCard}>
            <Card.Content>
              <Text style={styles.statNumber}>{stops.length}</Text>
              <Text style={styles.statLabel}>Bus Stops</Text>
            </Card.Content>
          </Card>
        </View>

        {/* Nearby Stops */}
        <Title style={styles.sectionTitle}>Nearby Stops</Title>

        {loading && !refreshing ? (
          <ActivityIndicator size="large" style={styles.loader} />
        ) : (
          filteredStops.map((stop) => (
            <TouchableOpacity
              key={stop.stop_id}
              onPress={() => handleStopPress(stop)}
            >
              <Card style={styles.stopCard}>
                <Card.Content>
                  <View style={styles.stopHeader}>
                    <Ionicons name="location" size={24} color="#2196F3" />
                    <View style={styles.stopInfo}>
                      <Title style={styles.stopName}>{stop.stop_name}</Title>
                      <Paragraph style={styles.stopCity}>{stop.city}</Paragraph>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="#999" />
                  </View>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))
        )}

        {!loading && filteredStops.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No stops found</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#1565C0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    color: '#BBDEFB',
    opacity: 0.95,
    fontSize: 13,
  },
  searchBar: {
    margin: 15,
    elevation: 4,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 5,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1565C0',
    textAlign: 'center',
  },
  statLabel: {
    textAlign: 'center',
    color: '#666',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  stopCard: {
    marginBottom: 10,
  },
  stopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stopInfo: {
    flex: 1,
    marginLeft: 15,
  },
  stopName: {
    fontSize: 16,
    marginBottom: 2,
  },
  stopCity: {
    fontSize: 14,
    color: '#666',
  },
  loader: {
    marginTop: 50,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});
