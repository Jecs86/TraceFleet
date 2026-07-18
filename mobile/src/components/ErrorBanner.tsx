/**
 * ErrorBanner — Banner de error con mensaje y botón "Reintentar" opcional
 *
 * Muestra un mensaje de error con fondo/borde en theme.error.
 * Si se pasa onRetry, muestra un botón "Reintentar".
 *
 * Validates: Requirements 2.6, 3.9, 4.11, 6.11, 10.3
 */

import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorBanner({
  message,
  onRetry,
}: ErrorBannerProps): React.ReactElement {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.error + '1A', // ~10% opacity tint
          borderColor: theme.error,
        },
      ]}
      testID="error-banner"
    >
      <Text
        style={[styles.message, { color: theme.error }]}
        testID="error-message"
      >
        {message}
      </Text>

      {onRetry && (
        <TouchableOpacity
          style={[styles.retryButton, { borderColor: theme.error }]}
          onPress={onRetry}
          testID="retry-button"
          accessibilityRole="button"
          accessibilityLabel="Reintentar"
        >
          <Text style={[styles.retryText, { color: theme.error }]}>
            Reintentar
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  message: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    marginRight: 8,
  },
  retryButton: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  retryText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
