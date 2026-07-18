/**
 * RutasStack — Stack Navigator para la sección de Rutas / Viajes
 *
 * Pantallas:
 *   Rutas        → Lista de viajes del chofer
 *   ViajeDetail  → Detalle de un viaje específico
 *
 * Validates: Requirements 9.3, 9.6
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RutasScreen } from '../screens/RutasScreen';
import { ViajeDetailScreen } from '../screens/ViajeDetailScreen';
import type { RutasStackParamList } from './types';

const Stack = createNativeStackNavigator<RutasStackParamList>();

export function RutasStack(): React.ReactElement {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Rutas"
        component={RutasScreen}
        options={{ title: 'Mis Rutas' }}
      />
      <Stack.Screen
        name="ViajeDetail"
        component={ViajeDetailScreen}
        options={{ title: 'Detalle del Viaje' }}
      />
    </Stack.Navigator>
  );
}
