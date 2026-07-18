/**
 * AppTabs — Bottom Tab Navigator con 4 pestañas
 *
 * Tabs:
 *   RutasTab         → RutasStack  (ícono: map-marker-path)
 *   CombustibleTab   → CombustibleStack  (ícono: gas-station)
 *   GastosTab        → GastosStack  (ícono: receipt)
 *   ConfiguracionTab → ConfiguracionScreen  (ícono: cog)
 *
 * Los colores de la barra provienen de useTheme() — sin colores hardcodeados.
 *
 * Validates: Requirements 9.1
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RutasStack } from './RutasStack';
import { CombustibleStack } from './CombustibleStack';
import { GastosStack } from './GastosStack';
import { ConfiguracionScreen } from '../screens/ConfiguracionScreen';
import { useTheme } from '../hooks/useTheme';
import type { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

// Tipo para los nombres de iconos de MaterialCommunityIcons
type MCIName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

export function AppTabs(): React.ReactElement {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.tabBar,
        },
        tabBarActiveTintColor: theme.tabBarActive,
        tabBarInactiveTintColor: theme.tabBarInactive,
      }}
    >
      <Tab.Screen
        name="RutasTab"
        component={RutasStack}
        options={{
          tabBarLabel: 'Rutas',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <MaterialCommunityIcons
              name={'map-marker-path' as MCIName}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tab.Screen
        name="CombustibleTab"
        component={CombustibleStack}
        options={{
          tabBarLabel: 'Combustible',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <MaterialCommunityIcons
              name={'gas-station' as MCIName}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tab.Screen
        name="GastosTab"
        component={GastosStack}
        options={{
          tabBarLabel: 'Gastos',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <MaterialCommunityIcons
              name={'receipt' as MCIName}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tab.Screen
        name="ConfiguracionTab"
        component={ConfiguracionScreen}
        options={{
          tabBarLabel: 'Configuración',
          headerShown: true,
          title: 'Configuración',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <MaterialCommunityIcons
              name={'cog' as MCIName}
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
