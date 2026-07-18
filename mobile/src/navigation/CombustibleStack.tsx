/**
 * CombustibleStack — Stack Navigator para la sección de Combustible
 *
 * Pantallas:
 *   Combustible      → Lista/historial de registros de combustible
 *   CombustibleForm  → Formulario de creación/edición de registro
 *
 * Validates: Requirements 9.4, 9.6
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CombustibleScreen } from '../screens/CombustibleScreen';
import { CombustibleFormScreen } from '../screens/CombustibleFormScreen';
import type { CombustibleStackParamList } from './types';

const Stack = createNativeStackNavigator<CombustibleStackParamList>();

export function CombustibleStack(): React.ReactElement {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Combustible"
        component={CombustibleScreen}
        options={{ title: 'Combustible' }}
      />
      <Stack.Screen
        name="CombustibleForm"
        component={CombustibleFormScreen}
        options={{ title: 'Registro de Combustible' }}
      />
    </Stack.Navigator>
  );
}
