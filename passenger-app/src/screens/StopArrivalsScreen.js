import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Chip,
  ActivityIndicator,
  Text,
} from 'react-native-paper';
import { stopAPI } from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import socketService from '../services/socketService';

export default function StopArrivalsScreen({ route, navigation }) {
  const { stop } = route.params;
  const [arrivals, setArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadArrivals();
    socketService.joinStop(stop.stop_id);

    // Listen for real-time updates
    const handleETAUpdate = (data) => {
      loadArrivals(); // Reload arrivals when ETA updates
    };

    socketService.onBusETAUpdate(handleETAUpdate);

    return () => {
      socketService.off('bus_eta_update', handleETAUpdate);
    };
  }, [stop.stop_id]);

  const loadArrivals = async () => {
    try {
      const response = await stopAPI.getStopArrivals(stop.stop_id);
      setArrivals(response.data.arrivals);
    } catch (error) {
      console.error('Error loading arrivals:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadArrivals();
  };

  const getCrowdColor = (level) => {
    switch (level) {
      case 'Low':
        return '#4CAF50';
      case 'Medium':
        return '#FF9800';
      case 'Full':
        return '#F44336';
      default:
        return '#999';
    }
  };

  const handleBusPress = (busId) => {
    navigation.navigate('BusDetails', { busId });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Stop Info */}
      <Card style={styles.stopCard}>
        <Card.Content>
          <Title style={styles.stopName}>{stop.stop_name}</Title>
          <Paragraph style={styles.stopCity}>{stop.city}</Paragraph>
        </Card.Content>
      </Card>

      {/* Arrivals List */}
      <Title style={styles.sectionTitle}>Upcoming Arrivals</Title>

      {arrivals.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="bus-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No buses arriving soon</Text>
        </View>
      ) : (
        arrivals.map((arrival, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleBusPress(arrival.bus_id)}
          >
            <Card style={styles.arrivalCard}>
              <Card.Content>
                <View style={styles.arrivalHeader}>
                  <View style={styles.busInfo}>
                    <View
                      style={[
                        styles.busColorDot,
                        { backgroundColor: arrival.bus_color || '#2196F3' },
                      ]}
                    />
                    <View>
                      <Title style={styles.busId}>{arrival.bus_id}</Title>
                      <Paragraph style={styles.routeName}>
                        {arrival.route_name}
                      </Paragraph>
                    </View>
                  </View>
                  <View style={styles.etaContainer}>
                    <Text style={styles.etaNumber}>
                      {arrival.eta_minutes}
                    </Text>
                    <Text style={styles.etaLabel}>min</Text>
                  </View>
                </View>

                <View style={styles.chipContainer}>
                  <Chip
                    icon="train-car"
                    style={styles.chip}
                    textStyle={styles.chipText}
                  >
                    {arrival.service_type}
                  </Chip>

                  {arrival.crowd_level && (
                    <Chip
                      icon="account-group"
                      style={[
                        styles.chip,
                        { backgroundColor: getCrowdColor(arrival.crowd_level) },
                      ]}
                      textStyle={[styles.chipText, { color: '#fff' }]}
                    >
                      {arrival.crowd_level}
                    </Chip>
                  )}

                  {arrival.women_bus && (
                    <Chip
                      icon="human-female"
                      style={styles.chip}
                      textStyle={styles.chipText}
                    >
                      Women
                    </Chip>
                  )}

                  {arrival.accessible && (
                    <Chip
                      icon="wheelchair-accessibility"
                      style={styles.chip}
                      textStyle={styles.chipText}
                    >
                      Accessible
                    </Chip>
                  )}
                </View>

                <Paragraph style={styles.routeDetail}>
                  {arrival.start_stop} → {arrival.end_stop}
                </Paragraph>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopCard: {
    margin: 15,
  },
  stopName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  stopCity: {
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 15,
    marginTop: 10,
    marginBottom: 10,
  },
  arrivalCard: {
    marginHorizontal: 15,
    marginBottom: 10,
  },
  arrivalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  busInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  busColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  busId: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  routeName: {
    fontSize: 14,
    color: '#666',
  },
  etaContainer: {
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
  },
  etaNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  etaLabel: {
    fontSize: 12,
    color: '#fff',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 10,
  },
  chip: {
    marginRight: 5,
    marginBottom: 5,
  },
  chipText: {
    fontSize: 12,
  },
  routeDetail: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 20,
  },
});
