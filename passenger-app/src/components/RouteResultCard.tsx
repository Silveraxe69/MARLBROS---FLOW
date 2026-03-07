import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, Chip } from 'react-native-paper';
import { colors } from '../utils/theme';
import { ComputedRoute } from '../ai/routeEngine';

interface RouteResultCardProps {
  bestRoute?: ComputedRoute;
  alternativeRoute?: ComputedRoute;
  message?: string;
}

const RouteResultCard: React.FC<RouteResultCardProps> = ({ bestRoute, alternativeRoute, message }) => {
  if (!bestRoute) {
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Route Result
          </Text>
          <Text variant="bodyMedium" style={styles.messageText}>
            {message || 'Select two stops and tap "Find Best Route" to get recommendations.'}
          </Text>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Best Route
        </Text>

        <Text variant="bodyLarge" style={styles.valueText}>
          Bus: {bestRoute.recommendedBus}
        </Text>

        <Text variant="bodyMedium" style={styles.detailText}>
          Stops: {bestRoute.stops.join(' -> ')}
        </Text>

        <View style={styles.metaRow}>
          <Chip style={styles.metaChip} icon="swap-horizontal">
            Transfers: {bestRoute.transfers}
          </Chip>
          <Chip style={styles.metaChip} icon="clock-outline">
            ETA: {bestRoute.estimatedTravelTimeMinutes} min
          </Chip>
        </View>

        {alternativeRoute ? (
          <View style={styles.alternativeSection}>
            <Text variant="titleSmall" style={styles.alternativeTitle}>
              Alternative Route
            </Text>
            <Text variant="bodyMedium" style={styles.detailText}>
              Bus: {alternativeRoute.recommendedBus}
            </Text>
            <Text variant="bodySmall" style={styles.detailText}>
              Stops: {alternativeRoute.stops.join(' -> ')}
            </Text>
            <Text variant="bodySmall" style={styles.detailText}>
              Transfers: {alternativeRoute.transfers} | ETA: {alternativeRoute.estimatedTravelTimeMinutes} min
            </Text>
          </View>
        ) : null}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginTop: 12,
    elevation: 4,
    backgroundColor: colors.surface,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.textPrimary,
  },
  valueText: {
    fontWeight: '600',
    marginBottom: 8,
  },
  detailText: {
    color: colors.textSecondary,
    marginBottom: 6,
  },
  messageText: {
    color: colors.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  metaChip: {
    backgroundColor: colors.chipBlue,
  },
  alternativeSection: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  alternativeTitle: {
    fontWeight: 'bold',
    marginBottom: 6,
    color: colors.primary,
  },
});

export default RouteResultCard;
