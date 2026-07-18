/**
 * AuthNavigator — Stack Navigator para el flujo de autenticación
 *
 * Contiene una única pantalla: LoginScreen.
 *
 * Validates: Requirements 9.2
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/LoginScreen';

type AuthStackParamList = {
  Login: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator(): React.ReactElement {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: 'Iniciar Sesión' }}
      />
    </Stack.Navigator>
  );
}
