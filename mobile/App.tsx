/**
 * App.tsx — Punto de entrada de TraceFleet Mobile
 *
 * Monta los providers en el orden correcto:
 *   ThemeProvider → AuthProvider → NavigationContainer → RootNavigator
 *
 * Validates: Requirements 9.1, 10.3
 */

import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { ActiveViajeProvider } from './src/contexts/ActiveViajeContext';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ActiveViajeProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </ActiveViajeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
