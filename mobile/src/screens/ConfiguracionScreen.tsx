/**
 * ConfiguracionScreen — Perfil del chofer, selector de tema y cierre de sesión
 *
 * - Muestra user.nombre y user.correo del perfil de AuthContext
 * - Switch para alternar entre tema claro y oscuro (ThemeContext.toggleTheme)
 * - Botón "Cerrar sesión" abre ConfirmDialog; al confirmar llama AuthContext.logout()
 *   y RootNavigator redirige automáticamente a LoginScreen
 * - Todos los colores provienen de useTheme() — ningún color hardcodeado
 *
 * Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 8.7, 8.8
 */

import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { ConfirmDialog } from '../components/ConfirmDialog';

// ─── Component ────────────────────────────────────────────────────────────────

export function ConfiguracionScreen(): React.ReactElement {
  const { user, logout } = useAuth();
  const { mode, theme, toggleTheme } = useTheme();

  const [dialogVisible, setDialogVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleLogoutPress = (): void => {
    setDialogVisible(true);
  };

  const handleDialogCancel = (): void => {
    setDialogVisible(false);
  };

  const handleDialogConfirm = async (): Promise<void> => {
    setIsLoggingOut(true);
    try {
      await logout();
      // RootNavigator detecta user === null y redirige a LoginScreen automáticamente
    } finally {
      setIsLoggingOut(false);
      setDialogVisible(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <View
      style={[styles.container, { backgroundColor: theme.background }]}
      testID="configuracion-screen"
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Sección Perfil ──────────────────────────────────────────────── */}
        <Text
          style={[styles.sectionTitle, { color: theme.textSecondary }]}
          testID="section-perfil"
        >
          PERFIL
        </Text>

        <View
          style={[
            styles.card,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
          testID="perfil-card"
        >
          {/* Avatar inicial */}
          <View
            style={[styles.avatarContainer, { backgroundColor: theme.primary }]}
            accessibilityRole="image"
            accessibilityLabel={`Inicial del nombre ${user?.nombre ?? ''}`}
          >
            <Text style={[styles.avatarText, { color: theme.textOnPrimary }]}>
              {user?.nombre?.charAt(0)?.toUpperCase() ?? '?'}
            </Text>
          </View>

          {/* Nombre */}
          <View
            style={[styles.profileRow, { borderBottomColor: theme.divider }]}
            testID="perfil-nombre-row"
          >
            <Text style={[styles.profileLabel, { color: theme.textSecondary }]}>
              Nombre
            </Text>
            <Text
              style={[styles.profileValue, { color: theme.textPrimary }]}
              testID="perfil-nombre"
            >
              {user?.nombre ?? '—'}
            </Text>
          </View>

          {/* Correo */}
          <View
            style={styles.profileRow}
            testID="perfil-correo-row"
          >
            <Text style={[styles.profileLabel, { color: theme.textSecondary }]}>
              Correo
            </Text>
            <Text
              style={[styles.profileValue, { color: theme.textPrimary }]}
              testID="perfil-correo"
            >
              {user?.correo ?? '—'}
            </Text>
          </View>
        </View>

        {/* ── Sección Apariencia ──────────────────────────────────────────── */}
        <Text
          style={[styles.sectionTitle, { color: theme.textSecondary }]}
          testID="section-apariencia"
        >
          APARIENCIA
        </Text>

        <View
          style={[
            styles.card,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
          testID="apariencia-card"
        >
          <View style={styles.themeRow}>
            <View style={styles.themeTextContainer}>
              <Text style={[styles.themeLabel, { color: theme.textPrimary }]}>
                Modo oscuro
              </Text>
              <Text
                style={[styles.themeSubLabel, { color: theme.textSecondary }]}
              >
                {mode === 'dark' ? 'Activado' : 'Desactivado'}
              </Text>
            </View>
            {/* Switch conectado a ThemeContext.toggleTheme — Req 8.2, 8.4, 8.5 */}
            <Switch
              value={mode === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{
                false: theme.border,
                true: theme.primary,
              }}
              thumbColor={mode === 'dark' ? theme.primaryVariant : theme.surface}
              ios_backgroundColor={theme.border}
              accessibilityRole="switch"
              accessibilityLabel="Activar modo oscuro"
              accessibilityState={{ checked: mode === 'dark' }}
              testID="theme-switch"
            />
          </View>
        </View>

        {/* ── Sección Cuenta ──────────────────────────────────────────────── */}
        <Text
          style={[styles.sectionTitle, { color: theme.textSecondary }]}
          testID="section-cuenta"
        >
          CUENTA
        </Text>

        <View
          style={[
            styles.card,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
          testID="cuenta-card"
        >
          {/* Botón Cerrar sesión — Req 8.7 */}
          <TouchableOpacity
            style={[styles.logoutButton, { borderColor: theme.error }]}
            onPress={handleLogoutPress}
            disabled={isLoggingOut}
            testID="logout-button"
            accessibilityRole="button"
            accessibilityLabel="Cerrar sesión"
          >
            <Text style={[styles.logoutText, { color: theme.error }]}>
              Cerrar sesión
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ConfirmDialog de cierre de sesión — Req 8.7, 8.8 */}
      <ConfirmDialog
        visible={dialogVisible}
        title="Cerrar sesión"
        message="¿Estás seguro de que deseas cerrar sesión? Tendrás que volver a iniciar sesión para acceder a la aplicación."
        onCancel={handleDialogCancel}
        onConfirm={() => {
          void handleDialogConfirm();
        }}
        isLoading={isLoggingOut}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  // Section titles
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 4,
  },

  // Card
  card: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 4,
  },

  // Profile section
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  profileLabel: {
    fontSize: 14,
    flex: 1,
  },
  profileValue: {
    fontSize: 14,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },

  // Theme toggle row
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  themeTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  themeLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  themeSubLabel: {
    fontSize: 12,
    marginTop: 2,
  },

  // Logout button
  logoutButton: {
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    margin: 12,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
  },
});

export default ConfiguracionScreen;
