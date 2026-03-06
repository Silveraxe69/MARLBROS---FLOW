import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { FAB, Portal, Provider, Chip } from 'react-native-paper';
import * as Location from 'expo-location';
import { useBus } from '../context/BusContext';
import socketService from '../services/socketService';
import { Ionicons } from '@expo/vector-icons';

export default function LiveMapScreen({ navigation }) {
  const [userLocation, setUserLocation] = useState(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 19.0760,
    longitude: 72.8777,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });
  const { buses, fetchBuses } = useBus();
  const [busLocations, setBusLocations] = useState({});

  useEffect(() => {
    getUserLocation();
    loadBuses();

    // Listen for real-time bus location updates
    const handleLocationUpdate = (data) => {
      setBusLocations((prev) => ({
        ...prev,
        [data.bus_id]: {
          latitude: data.latitude,
          longitude: data.longitude,
          speed: data.speed,
        },
      }));
    };

    socketService.onBusLocationUpdate(handleLocationUpdate);

    return () => {
      socketService.off('bus_location_update', handleLocationUpdate);
    };
  }, []);

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const userLoc = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setUserLocation(userLoc);
      setMapRegion({
        ...userLoc,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const loadBuses = async () => {
    const result = await fetchBuses();
    if (result.success) {
      // Initialize bus locations from fetched data
      const locations = {};
      result.data.forEach((bus) => {
        if (bus.latitude && bus.longitude) {
          locations[bus.bus_id] = {
            latitude: bus.latitude,
            longitude: bus.longitude,
            speed: bus.speed || 0,
          };
        }
      });
      setBusLocations(locations);
    }
  };

  const getBusMarkerColor = (bus) => {
    return bus.bus_color || '#2196F3';
  };

  const handleBusPress = (bus) => {
    navigation.navigate('BusDetails', { busId: bus.bus_id });
  };

  const centerOnUser = () => {
    if (userLocation) {
      setMapRegion({
        ...userLocation,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  };

  return (
    <Provider>
      <View style={styles.container}>
        <MapView
          provider={PROVIDER_DEFAULT}
          style={styles.map}
          region={mapRegion}
          onRegionChangeComplete={setMapRegion}
          showsUserLocation
          showsMyLocationButton={false}
        >
          {/* User Location Marker */}
          {userLocation && (
            <Marker
              coordinate={userLocation}
              title="You are here"
              pinColor="blue"
            />
          )}

          {/* Bus Markers */}
          {buses.map((bus) => {
            const location = busLocations[bus.bus_id];
            if (!location) return null;

            return (
              <Marker
                key={bus.bus_id}
                coordinate={location}
                title={bus.bus_id}
                description={bus.route_name}
                onPress={() => handleBusPress(bus)}
              >
                <View style={styles.busMarker}>
                  <Ionicons name="bus" size={24} color="#fff" />
                  <View
                    style={[
                      styles.busMarkerDot,
                      { backgroundColor: getBusMarkerColor(bus) },
                    ]}
                  />
                </View>
              </Marker>
            );
          })}
        </MapView>

        {/* Live Count Chip */}
        <Chip
          icon="bus"
          style={styles.countChip}
          textStyle={styles.countText}
        >
          {buses.length} buses live
        </Chip>

        {/* Center on User Button */}
        <FAB
          icon="crosshairs-gps"
          style={styles.fab}
          onPress={centerOnUser}
          small
        />
      </View>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  busMarker: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  busMarkerDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  countChip: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: '#fff',
    elevation: 4,
  },
  countText: {
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#2196F3',
  },
});
