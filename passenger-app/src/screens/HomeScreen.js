import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, ScrollView, Animated, Easing } from 'react-native';
import { Button, Text, Card } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { colors } from '../utils/theme';
import { loadMultipleCSV } from '../utils/csvParser';
import PassengerNavbar from '../components/PassengerNavbar';

const HomeScreen = ({ navigation }) => {
  const { user, preferWomenBuses } = useAuth();
  const [fromStop, setFromStop] = useState(null);
  const [toStop, setToStop] = useState(null);
  const [routes, setRoutes] = useState([]);
  
  // State for data loaded from public folder
  const [routesData, setRoutesData] = useState([]);
  const [busStopSequenceData, setBusStopSequenceData] = useState([]);
  const [busesData, setBusesData] = useState([]);
  const [liveBusLocations, setLiveBusLocations] = useState([]);
  const aiPulseValue = useRef(new Animated.Value(0)).current;

  // Load data from public folder on component mount
  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(aiPulseValue, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(aiPulseValue, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, [aiPulseValue]);

  const loadAllData = useCallback(async () => {
    try {
      const data = await loadMultipleCSV([
        'bus_stops.csv',
        'routes.csv',
        'bus_stop_sequence.csv',
        'buses.csv',
        'live_bus_location.csv'
      ]);
      
      setRoutesData(data.routes || []);
      setBusStopSequenceData(data.bus_stop_sequence || []);
      setBusesData(data.buses || []);
      
      // Merge bus data with location data
      const locations = data.live_bus_location || [];
      const buses = data.buses || [];
      const busesWithLocation = locations.map(location => {
        const bus = buses.find(b => b.bus_id === location.bus_id);
        return {
          ...bus,
          ...location,
        };
      });
      setLiveBusLocations(busesWithLocation);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, []);

  const findConnectingRoutes = useCallback((fromStopId, toStopId) => {
    const results = [];

    const normalizeId = (value) => String(value || '').trim();
    const fromId = normalizeId(fromStopId);
    const toId = normalizeId(toStopId);

    const getStopOrder = (sequence) => {
      const raw = sequence?.stop_order ?? sequence?.stop_sequence ?? '0';
      const parsed = Number(raw);
      return Number.isFinite(parsed) ? parsed : 0;
    };

    // Get all unique route IDs
    const allRouteIds = [...new Set(busStopSequenceData.map(seq => normalizeId(seq.route_id)).filter(Boolean))];

    allRouteIds.forEach(routeId => {
      const routeStops = busStopSequenceData
        .filter(seq => normalizeId(seq.route_id) === routeId)
        .sort((a, b) => getStopOrder(a) - getStopOrder(b));

      const fromIndex = routeStops.findIndex(s => normalizeId(s.stop_id) === fromId);
      const toIndex = routeStops.findIndex(s => normalizeId(s.stop_id) === toId);

      if (fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex) {
        const route = routesData.find(r => normalizeId(r.route_id) === routeId);
        const busesOnRoute = busesData.filter((b) => {
          if (normalizeId(b.route_id) !== routeId) return false;
          const status = String(b.status || '').toLowerCase();
          return status !== 'stopped';
        });

        // Sort buses - women buses first if preference is enabled
        let sortedBuses = busesOnRoute;
        if (preferWomenBuses) {
          sortedBuses = [
            ...busesOnRoute.filter(b => b.women_bus === 'Yes'),
            ...busesOnRoute.filter(b => b.women_bus === 'No'),
          ];
        }

        results.push({
          routeId,
          route,
          buses: sortedBuses,
          stopCount: toIndex - fromIndex + 1,
        });
      }
    });

    return results;
  }, [busStopSequenceData, routesData, busesData, preferWomenBuses]);

  const handleSearch = useCallback(() => {
    if (!fromStop || !toStop) {
      alert('Please select both From and To stops');
      return;
    }

    if (fromStop.stop_id === toStop.stop_id) {
      alert('From and To stops cannot be the same');
      return;
    }

    // Find routes that connect these stops
    const foundRoutes = findConnectingRoutes(fromStop.stop_id, toStop.stop_id);
    setRoutes(foundRoutes);

    if (foundRoutes.length === 0) {
      alert('No buses found for the selected start and destination points');
      return;
    }

    const routeIds = [...new Set(foundRoutes.map(r => r.routeId).filter(Boolean))];
    const busIdsFromRoutes = foundRoutes
      .flatMap(r => r.buses || [])
      .map(bus => bus.bus_id)
      .filter(Boolean);

    const busIdsFromLiveLocation = liveBusLocations
      .filter((bus) => routeIds.includes(bus.route_id))
      .map((bus) => bus.bus_id)
      .filter(Boolean);

    const busIds = [...new Set([...busIdsFromRoutes, ...busIdsFromLiveLocation])];

    navigation.navigate('LiveMap', {
      filterRouteIds: routeIds,
      filterBusIds: busIds,
      fromStopId: fromStop.stop_id,
      toStopId: toStop.stop_id,
      fromStopName: fromStop.stop_name,
      toStopName: toStop.stop_name,
    });
  }, [fromStop, toStop, findConnectingRoutes, liveBusLocations, navigation]);

  return (
    <View style={styles.container}>
      <PassengerNavbar
        navigation={navigation}
        rightIcon="account-circle"
        onRightPress={() => navigation.navigate('Settings')}
      />

      <View style={styles.welcomeStrip}>
        <Text variant="titleMedium" style={styles.greeting}>
          Hello, {user?.name || 'Passenger'}
        </Text>
        <Text variant="bodySmall" style={styles.subtitle}>
          Where would you like to go today?
        </Text>
      </View>

      <ScrollView 
        style={styles.mainScroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        scrollEnabled={true}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
      >
        {/* Search Card */}
        <Card style={styles.searchCard}>
          <Card.Content>
            <View style={styles.searchContainer}>
              <Text variant="titleMedium" style={styles.searchTitle}>
                Plan Your Journey
              </Text>

              <View style={styles.inputContainer}>
                <Text variant="labelMedium" style={styles.label}>From</Text>
                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate('StopSelection', {
                    onSelect: (stop) => setFromStop(stop),
                    title: 'Select Starting Stop',
                  })}
                  style={styles.selectButton}
                  contentStyle={styles.selectButtonContent}
                  icon="map-marker"
                >
                  {fromStop ? fromStop.stop_name : 'Select Stop'}
                </Button>
              </View>

              <View style={styles.inputContainer}>
                <Text variant="labelMedium" style={styles.label}>To</Text>
                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate('StopSelection', {
                    onSelect: (stop) => setToStop(stop),
                    title: 'Select Destination Stop',
                  })}
                  style={styles.selectButton}
                  contentStyle={styles.selectButtonContent}
                  icon="map-marker-check"
                >
                  {toStop ? toStop.stop_name : 'Select Stop'}
                </Button>
              </View>

              <Button
                mode="contained"
                onPress={handleSearch}
                style={styles.searchButton}
                contentStyle={styles.searchButtonContent}
                icon="magnify"
              >
                Search Buses
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Results */}
        {routes.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text variant="titleLarge" style={styles.resultsTitle}>
              Available Routes ({routes.length})
            </Text>
            
            {routes.map((routeInfo, index) => (
              <Card key={index} style={styles.routeCard}>
                <Card.Content>
                  <Text variant="titleMedium" style={styles.routeName}>
                    {routeInfo.route.start_stop} → {routeInfo.route.end_stop}
                  </Text>
                  <Text variant="bodySmall" style={styles.routeDetails}>
                    {routeInfo.stopCount} stops • {routeInfo.route.distance_km} km
                  </Text>
                  <Text variant="bodyMedium" style={styles.busCount}>
                    {routeInfo.buses.length} buses available
                  </Text>
                  
                  <View style={styles.busPreview}>
                    {routeInfo.buses.slice(0, 3).map(bus => (
                      <View key={bus.bus_id} style={styles.busTag}>
                        <Text variant="bodySmall">
                          {bus.bus_id} {bus.women_bus === 'Yes' ? '💗' : ''}
                        </Text>
                      </View>
                    ))}
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        )}
        
        {routes.length === 0 && fromStop && toStop && (
          <Card style={styles.noResultsCard}>
            <Card.Content>
              <Text variant="bodyLarge" style={styles.noResults}>
                No direct routes found
              </Text>
              <Text variant="bodySmall" style={styles.noResultsHint}>
                Try selecting different stops or check individual stops for next buses
              </Text>
            </Card.Content>
          </Card>
        )}

        <Card style={styles.aiRouteCard}>
          <Card.Content>
            <View style={styles.aiRouteHeader}>
              <View style={styles.aiRouteTitleContainer}>
                <Text variant="titleLarge" style={styles.aiRouteTitle}>
                  AI Route Assistant
                </Text>
                <View style={styles.aiBadge}>
                  <Animated.View
                    style={[
                      styles.aiPulseDot,
                      {
                        transform: [
                          {
                            scale: aiPulseValue.interpolate({
                              inputRange: [0, 1],
                              outputRange: [1, 1.15],
                            }),
                          },
                        ],
                        opacity: aiPulseValue.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 0.75],
                        }),
                      },
                    ]}
                  />
                  <Text variant="bodySmall" style={styles.aiBadgeText}>SMART</Text>
                </View>
              </View>
            </View>

            <Text variant="bodyMedium" style={styles.aiDescription}>
              Get fastest route suggestions using stop network and simulated traffic.
            </Text>

            <Button
              mode="contained"
              icon="creation"
              style={styles.openAiButton}
              contentStyle={styles.openAiButtonContent}
              onPress={() => navigation.navigate('RouteRecommendation')}
            >
              Open AI Route
            </Button>
          </Card.Content>
        </Card>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexShrink: 0,
  },
  welcomeStrip: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 2,
  },
  greeting: {
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  subtitle: {
    color: colors.textSecondary,
    marginTop: 4,
  },
  searchCard: {
    margin: 16,
    elevation: 4,
  },
  searchContainer: {
    gap: 16,
  },
  searchTitle: {
    fontWeight: 'bold',
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    color: colors.textSecondary,
  },
  selectButton: {
    justifyContent: 'flex-start',
  },
  selectButtonContent: {
    justifyContent: 'flex-start',
  },
  searchButton: {
    marginTop: 8,
  },
  searchButtonContent: {
    paddingVertical: 8,
  },
  results: {
    flex: 1,
  },
  resultsTitle: {
    padding: 16,
    fontWeight: 'bold',
  },
  routeCard: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  routeName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  routeDetails: {
    color: colors.textSecondary,
    marginBottom: 8,
  },
  busCount: {
    marginBottom: 8,
  },
  busPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  busTag: {
    backgroundColor: colors.chipBlue,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  noResultsCard: {
    margin: 16,
  },
  noResults: {
    textAlign: 'center',
    marginBottom: 8,
  },
  noResultsHint: {
    textAlign: 'center',
    color: colors.textSecondary,
  },
  mainScroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  resultsContainer: {
    marginTop: 0,
  },
  aiRouteCard: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    elevation: 4,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.chipBlue,
  },
  aiRouteHeader: {
    marginBottom: 10,
  },
  aiRouteTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aiRouteTitle: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.chipBlue,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  aiPulseDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  aiBadgeText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 10,
  },
  aiDescription: {
    color: colors.textSecondary,
    marginBottom: 16,
  },
  openAiButton: {
    marginTop: 0,
  },
  openAiButtonContent: {
    paddingVertical: 8,
  },
});

export default HomeScreen;
