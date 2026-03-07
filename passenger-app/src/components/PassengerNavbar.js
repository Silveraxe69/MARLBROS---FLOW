import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Appbar, Text } from 'react-native-paper';
import { colors } from '../utils/theme';

const PassengerNavbar = ({
  navigation,
  title = 'Tamil Nadu State Transport Corporation Ltd.',
  subtitle = 'FLOW - Real-Time Bus Management System',
  showBack = false,
  onBackPress,
  rightIcon = 'home',
  onRightPress,
}) => {
  const [showLogo, setShowLogo] = useState(true);

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
      return;
    }
    navigation.goBack();
  };

  const handleRight = () => {
    if (onRightPress) {
      onRightPress();
      return;
    }
    navigation.navigate('Home');
  };

  return (
    <Appbar.Header style={styles.header}>
      {showBack ? (
        <Appbar.BackAction onPress={handleBack} color="white" />
      ) : (
        <View style={styles.sideSpacer} />
      )}

      <View style={styles.brandContainer}>
        {showLogo ? (
          <Image
            source={{ uri: '/images/tnstc-logo.png' }}
            style={styles.logo}
            onError={() => setShowLogo(false)}
          />
        ) : (
          <Text style={styles.logoFallback}>BUS</Text>
        )}

        <View style={styles.textBlock}>
          <Text numberOfLines={1} style={styles.title}>
            {title}
          </Text>
          <Text numberOfLines={1} style={styles.subtitle}>
            {subtitle}
          </Text>
        </View>
      </View>

      <Appbar.Action icon={rightIcon} onPress={handleRight} color="white" />
    </Appbar.Header>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  sideSpacer: {
    width: 48,
  },
  brandContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },
  logo: {
    width: 34,
    height: 34,
    borderRadius: 4,
    marginRight: 10,
    backgroundColor: 'white',
  },
  logoFallback: {
    width: 34,
    textAlign: 'center',
    color: 'white',
    fontWeight: '700',
    marginRight: 10,
    fontSize: 10,
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: 'white',
    fontWeight: '700',
    fontSize: 13,
  },
  subtitle: {
    color: 'white',
    opacity: 0.9,
    fontSize: 10,
    marginTop: 1,
  },
});

export default PassengerNavbar;
