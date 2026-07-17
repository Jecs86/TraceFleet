/**
 * GastosStack — Stack Navigator para la sección de Gastos Extra
 *
 * Pantallas:
 *   Gastos      → Lista/historial de gastos extra
 *   GastoForm   → Formulario de creación/edición de gasto
 *
 * Validates: Requirements 9.5, 9.6
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GastosScreen } from '../screens/GastosScreen';
import { GastoFormScreen } from '../screens/GastoFormScreen';
import type { GastosStackParamList } from './types';

const Stack = createNativeStackNavigator<GastosStackParamList>();

export function GastosStack(): React.ReactElement {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Gastos"
        component={GastosScreen}
        options={{ title: 'Gastos Extra' }}
      />
      <Stack.Screen
        name="GastoForm"
        component={GastoFormScreen}
        options={{ title: 'Registrar Gasto' }}
      />
    </Stack.Navigator>
  );
}
