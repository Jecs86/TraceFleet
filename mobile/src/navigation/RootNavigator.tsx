/**
 * RootNavigator — Punto de decisión raíz de la navegación
 *
 * Comportamiento:
 *   - isLoading === true  → muestra LoadingOverlay (validación inicial del token)
 *   - user === null       → monta AuthNavigator (flujo de login)
 *   - user !== null       → monta AppTabs (app principal autenticada)
 *
 * Validates: Requirements 9.1, 9.2, 1.10
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { AuthNavigator } from './AuthNavigator';
import { AppTabs } from './AppTabs';

export function RootNavigator(): React.ReactElement {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.fill}>
        <LoadingOverlay />
      </View>
    );
  }

  if (user === null) {
    return <AuthNavigator />;
  }

  return <AppTabs />;
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});
