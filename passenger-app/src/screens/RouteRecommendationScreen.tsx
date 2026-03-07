import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { colors } from '../utils/theme';
import RouteResultCard from '../components/RouteResultCard';
import { findBestRoute, primeRouteGraphCache, RouteRecommendationResult } from '../ai/routeEngine';
import { BusRecord, SequenceRecord, StopRecord } from '../ai/graphBuilder';
import { loadRouteRecommendationDataset } from '../ai/dataLoader';
import PassengerNavbar from '../components/PassengerNavbar';

const RouteRecommendationScreen = ({ navigation }: { navigation: any }) => {
  const [stops, setStops] = useState<StopRecord[]>([]);
  const [sequences, setSequences] = useState<SequenceRecord[]>([]);
  const [buses, setBuses] = useState<BusRecord[]>([]);

  const [startStopId, setStartStopId] = useState<string>('');
  const [destinationStopId, setDestinationStopId] = useState<string>('');
  const [result, setResult] = useState<RouteRecommendationResult | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isLoadingData, setIsLoadingData] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const dataset = await loadRouteRecommendationDataset();
      const loadedStops = dataset.stops;
      const loadedSequences = dataset.sequences;
      const loadedBuses = dataset.buses;

      setStops(loadedStops);
      setSequences(loadedSequences);
      setBuses(loadedBuses);

      primeRouteGraphCache({
        stops: loadedStops,
        sequences: loadedSequences,
        buses: loadedBuses,
      });

      if (loadedStops.length === 0 || loadedSequences.length === 0) {
        setStatusMessage('Unable to load route dataset. Please refresh and try again.');
      } else {
        setStatusMessage('');
      }
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const selectedStartStop = useMemo(
    () => stops.find((stop) => stop.stop_id === startStopId),
    [stops, startStopId]
  );

  const selectedDestinationStop = useMemo(
    () => stops.find((stop) => stop.stop_id === destinationStopId),
    [stops, destinationStopId]
  );

  const handleFindBestRoute = useCallback(() => {
    const recommendation = findBestRoute({
      startStopId,
      destinationStopId,
      stops,
      sequences,
      buses,
    });

    setResult(recommendation);
    setStatusMessage(recommendation.success ? '' : recommendation.message || 'Unable to calculate route.');
  }, [startStopId, destinationStopId, stops, sequences, buses]);

  const handleSelectStartStop = useCallback(() => {
    navigation.navigate('StopSelection', {
      title: 'Select Start Stop',
      onSelect: (stop: StopRecord) => setStartStopId(stop.stop_id),
    });
  }, [navigation]);

  const handleSelectDestinationStop = useCallback(() => {
    navigation.navigate('StopSelection', {
      title: 'Select Destination Stop',
      onSelect: (stop: StopRecord) => setDestinationStopId(stop.stop_id),
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <PassengerNavbar
        navigation={navigation}
        showBack
        onBackPress={() => navigation.navigate('Home')}
        title="Tamil Nadu State Transport Corporation Ltd."
        subtitle="FLOW - AI Route Recommendation"
        onRightPress={() => navigation.navigate('Home')}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.formCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.title}>
              Find the Fastest Route
            </Text>

            <View style={styles.fieldContainer}>
              <Text variant="labelMedium" style={styles.label}>
                Start Stop
              </Text>
              <Button
                mode="outlined"
                icon="map-marker"
                style={styles.selectButton}
                contentStyle={styles.selectButtonContent}
                onPress={handleSelectStartStop}
              >
                {selectedStartStop?.stop_name || 'Select Start Stop'}
              </Button>
            </View>

            <View style={styles.fieldContainer}>
              <Text variant="labelMedium" style={styles.label}>
                Destination Stop
              </Text>
              <Button
                mode="outlined"
                icon="map-marker-check"
                style={styles.selectButton}
                contentStyle={styles.selectButtonContent}
                onPress={handleSelectDestinationStop}
              >
                {selectedDestinationStop?.stop_name || 'Select Destination Stop'}
              </Button>
            </View>

            <Button
              mode="contained"
              icon="auto-fix"
              style={styles.findButton}
              contentStyle={styles.findButtonContent}
              onPress={handleFindBestRoute}
              disabled={isLoadingData}
            >
              Find Best Route
            </Button>

            {statusMessage ? (
              <Text variant="bodySmall" style={styles.statusMessage}>
                {statusMessage}
              </Text>
            ) : null}

            {statusMessage && stops.length === 0 ? (
              <Button
                mode="text"
                icon="refresh"
                onPress={loadData}
                style={styles.retryButton}
                loading={isLoadingData}
                disabled={isLoadingData}
              >
                Retry Data Load
              </Button>
            ) : null}
          </Card.Content>
        </Card>

        <RouteResultCard
          bestRoute={result?.bestRoute}
          alternativeRoute={result?.alternativeRoute}
          message={statusMessage}
        />
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
    backgroundColor: colors.primary,
  },
  content: {
    padding: 16,
    paddingBottom: 28,
  },
  formCard: {
    elevation: 4,
    backgroundColor: colors.surface,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  fieldContainer: {
    gap: 8,
    marginBottom: 14,
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
  findButton: {
    marginTop: 4,
  },
  findButtonContent: {
    paddingVertical: 8,
  },
  statusMessage: {
    marginTop: 12,
    color: colors.error,
  },
  retryButton: {
    alignSelf: 'flex-start',
    marginTop: 6,
  },
});

export default RouteRecommendationScreen;
