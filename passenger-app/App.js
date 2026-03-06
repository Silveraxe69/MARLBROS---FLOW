import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { BusProvider } from './src/context/BusContext';

// Tamil Nadu State Transport Corporation Theme - Official Colors
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1565C0', // TNSTC Official Blue
    secondary: '#0D47A1', // Dark Blue
    tertiary: '#1976D2', // Medium Blue
    surface: '#FFFFFF',
    background: '#F5F5F5',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onSurface: '#000000',
    onBackground: '#000000',
  },
};

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <BusProvider>
          <NavigationContainer>
            <AppNavigator />
            <StatusBar style="light" backgroundColor="#1565C0" />
          </NavigationContainer>
        </BusProvider>
      </AuthProvider>
    </PaperProvider>
  );
}
