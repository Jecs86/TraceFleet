/**
 * LoadingOverlay — Capa semitransparente con ActivityIndicator centrado
 *
 * Cubre toda la pantalla con un fondo semitransparente y muestra un
 * indicador de carga centrado. Todos los colores vienen de useTheme().
 *
 * Validates: Requirements 10.3
 */

import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTheme } from '../hooks/useTheme';

export function LoadingOverlay(): React.ReactElement {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.overlay,
        { backgroundColor: theme.background + 'CC' }, // ~80% opacity
      ]}
      testID="loading-overlay"
    >
      <ActivityIndicator
        size="large"
        color={theme.primary}
        testID="loading-indicator"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
});
