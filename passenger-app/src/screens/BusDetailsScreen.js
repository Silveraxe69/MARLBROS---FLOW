import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Chip,
  Button,
  ActivityIndicator,
  Text,
} from 'react-native-paper';
import { busAPI, crowdAPI } from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import socketService from '../services/socketService';
import { useAuth } from '../context/AuthContext';

export default function BusDetailsScreen({ route }) {
  const { busId } = route.params;
  const [bus, setBus] = useState(null);
  const [location, setLocation] = useState(null);
  const [eta, setEta] = useState([]);
  const [crowdLevel, setCrowdLevel] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadBusDetails();
    socketService.joinBus(busId);

    // Listen for real-time updates
    const handleLocationUpdate = (data) => {
      if (data.bus_id === busId) {
        setLocation({
          latitude: data.latitude,
          longitude: data.longitude,
          speed: data.speed,
        });
      }
    };

    const handleETAUpdate = (data) => {
      if (data.bus_id === busId) {
        setEta(data.eta || data);
      }
    };

    const handleCrowdUpdate = (data) => {
      if (data.bus_id === busId) {
        setCrowdLevel(data.crowd_level);
      }
    };

    socketService.onBusLocationUpdate(handleLocationUpdate);
    socketService.onBusETAUpdate(handleETAUpdate);
    socketService.onCrowdUpdate(handleCrowdUpdate);

    return () => {
      socketService.off('bus_location_update', handleLocationUpdate);
      socketService.off('bus_eta_update', handleETAUpdate);
      socketService.off('crowd_update', handleCrowdUpdate);
    };
  }, [busId]);

  const loadBusDetails = async () => {
    try {
      const [busRes, locRes, etaRes, crowdRes] = await Promise.all([
        busAPI.getBusById(busId),
        busAPI.getBusLocation(busId),
        busAPI.getBusETA(busId),
        crowdAPI.getCrowdStatus(busId),
      ]);

      setBus(busRes.data.bus);
      setLocation(locRes.data.location);
      setEta(etaRes.data.eta);
      setCrowdLevel(crowdRes.data.crowdStatus.crowd_level);
    } catch (error) {
      console.error('Error loading bus details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCrowdReport = async (level) => {
    try {
      await crowdAPI.updateCrowdStatus({
        bus_id: busId,
        crowd_level: level,
        user_id: user?.userId,
      });
      setCrowdLevel(level);
      Alert.alert('Success', 'Crowd status updated!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update crowd status');
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Bus Info Card */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <View
              style={[
                styles.busColorDot,
                { backgroundColor: bus?.bus_color || '#2196F3' },
              ]}
            />
            <View style={styles.busInfo}>
              <Title style={styles.busId}>{bus?.bus_id}</Title>
              <Paragraph style={styles.routeName}>{bus?.route_name}</Paragraph>
            </View>
          </View>

          <View style={styles.chipContainer}>
            <Chip icon="train-car" style={styles.chip}>
              {bus?.service_type}
            </Chip>
            {bus?.women_bus && (
              <Chip icon="human-female" style={styles.chip}>
                Women Only
              </Chip>
            )}
            {bus?.accessible && (
              <Chip icon="wheelchair-accessibility" style={styles.chip}>
                Accessible
              </Chip>
            )}
          </View>

          <Paragraph style={styles.routeDetail}>
            {bus?.start_stop} → {bus?.end_stop}
          </Paragraph>
          <Paragraph style={styles.distance}>
            Distance: {bus?.distance_km} km
          </Paragraph>
        </Card.Content>
      </Card>

      {/* Live Location Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>
            <Ionicons name="location" size={20} /> Live Location
          </Title>
          {location && (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Speed:</Text>
                <Text style={styles.value}>{location.speed?.toFixed(1)} km/h</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Coordinates:</Text>
                <Text style={styles.value}>
                  {location.latitude?.toFixed(6)}, {location.longitude?.toFixed(6)}
                </Text>
              </View>
            </>
          )}
        </Card.Content>
      </Card>

      {/* Crowd Status Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>
            <Ionicons name="people" size={20} /> Crowd Status
          </Title>

          <View style={styles.crowdInfo}>
            <Text style={styles.currentCrowdLabel}>Current Status:</Text>
            <Chip
              style={[
                styles.crowdChip,
                {
                  backgroundColor:
                    crowdLevel === 'Low'
                      ? '#4CAF50'
                      : crowdLevel === 'Medium'
                      ? '#FF9800'
                      : '#F44336',
                },
              ]}
              textStyle={{ color: '#fff', fontWeight: 'bold' }}
            >
              {crowdLevel || 'Unknown'}
            </Chip>
          </View>

          <Title style={styles.reportTitle}>Report Crowd Level:</Title>
          <View style={styles.crowdButtons}>
            <Button
              mode="contained"
              onPress={() => handleCrowdReport('Low')}
              style={[styles.crowdButton, { backgroundColor: '#4CAF50' }]}
            >
              Low
            </Button>
            <Button
              mode="contained"
              onPress={() => handleCrowdReport('Medium')}
              style={[styles.crowdButton, { backgroundColor: '#FF9800' }]}
            >
              Medium
            </Button>
            <Button
              mode="contained"
              onPress={() => handleCrowdReport('Full')}
              style={[styles.crowdButton, { backgroundColor: '#F44336' }]}
            >
              Full
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* ETA Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>
            <Ionicons name="time" size={20} /> Upcoming Stops
          </Title>
          {eta && eta.length > 0 ? (
            eta.slice(0, 5).map((stop, index) => (
              <View key={index} style={styles.etaRow}>
                <View style={styles.etaStop}>
                  <Text style={styles.etaStopName}>{stop.stop_name}</Text>
                  <Text style={styles.etaDistance}>
                    {stop.distance_km?.toFixed(2)} km
                  </Text>
                </View>
                <View style={styles.etaBadge}>
                  <Text style={styles.etaMinutes}>{stop.eta_minutes} min</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noData}>No ETA data available</Text>
          )}
        </Card.Content>
      </Card>
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
  card: {
    margin: 15,
    marginBottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  busColorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  busInfo: {
    flex: 1,
  },
  busId: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  routeName: {
    color: '#666',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  chip: {
    marginRight: 5,
    marginBottom: 5,
  },
  routeDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  distance: {
    fontSize: 14,
    color: '#666',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  crowdInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  currentCrowdLabel: {
    fontSize: 16,
    marginRight: 10,
  },
  crowdChip: {
    paddingHorizontal: 10,
  },
  reportTitle: {
    fontSize: 16,
    marginBottom: 10,
  },
  crowdButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  crowdButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  etaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  etaStop: {
    flex: 1,
  },
  etaStopName: {
    fontSize: 15,
    fontWeight: '500',
  },
  etaDistance: {
    fontSize: 12,
    color: '#666',
  },
  etaBadge: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  etaMinutes: {
    color: '#fff',
    fontWeight: 'bold',
  },
  noData: {
    textAlign: 'center',
    color: '#999',
    paddingVertical: 20,
  },
});
