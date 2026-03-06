// Logo Component for Passenger App
import React, { useState } from 'react';
import { Image, Text, View } from 'react-native';

export default function Logo({ size = 100, style }) {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    // Fallback to emoji if logo image not found
    return (
      <Text style={{ fontSize: size * 0.7, ...style }}>
        🚌
      </Text>
    );
  }

  try {
    return (
      <Image 
        source={require('../../assets/images/tnstc-logo.png')}
        style={[{ width: size, height: size }, style]}
        resizeMode="contain"
        onError={() => setImageError(true)}
      />
    );
  } catch (error) {
    // If require fails, show emoji
    return (
      <Text style={{ fontSize: size * 0.7, ...style }}>
        🚌
      </Text>
    );
  }
}
