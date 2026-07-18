/**
 * LoginScreen — Pantalla de inicio de sesión de TraceFleet Mobile
 *
 * Muestra un formulario con campos de correo y contraseña. Al enviar,
 * delega la autenticación a AuthContext.login() y gestiona los estados
 * de carga y error de forma local.
 *
 * Mapeo de errores de LoginResult:
 *   INVALID_CREDENTIALS → "Correo o contraseña incorrectos"
 *   NOT_CHOFER          → "Acceso denegado: esta aplicación es exclusiva para conductores"
 *   INACTIVE_ACCOUNT    → "Tu cuenta está inactiva. Contacta a tu administrador"
 *   NETWORK_ERROR       → "No se pudo conectar. Verifica tu conexión a internet"
 *
 * Validates: Requirements 1.1, 1.4, 1.5, 1.6, 1.7, 1.8, 10.3
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

// ─── Mapeo de códigos de error a mensajes UI ──────────────────────────────────

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: 'Correo o contraseña incorrectos',
  NOT_CHOFER:
    'Acceso denegado: esta aplicación es exclusiva para conductores',
  INACTIVE_ACCOUNT:
    'Tu cuenta está inactiva. Contacta a tu administrador',
  NETWORK_ERROR:
    'No se pudo conectar. Verifica tu conexión a internet',
};

// ─── Componente ───────────────────────────────────────────────────────────────

export function LoginScreen(): React.ReactElement {
  const { login } = useAuth();
  const { theme } = useTheme();

  // Estado local del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Estilos derivados del tema (sin colores hardcodeados)
  const styles = makeStyles(theme);

  /**
   * Maneja el envío del formulario:
   *  1. Limpia el error previo
   *  2. Activa el indicador de carga y deshabilita el botón
   *  3. Llama a AuthContext.login()
   *  4. Si falla, mapea el código de error al mensaje correspondiente
   *  5. Si tiene éxito, RootNavigator redirige automáticamente a AppTabs
   */
  async function handleSubmit(): Promise<void> {
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const result = await login(email.trim(), password);

      if (!result.success) {
        const message =
          ERROR_MESSAGES[result.error] ?? 'Ocurrió un error inesperado';
        setErrorMessage(message);
      }
      // Si result.success === true, AuthContext actualiza `user`
      // y RootNavigator redirige automáticamente sin acción adicional aquí.
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Encabezado */}
        <View style={styles.header}>
          <Text style={styles.appName}>TraceFleet</Text>
          <Text style={styles.subtitle}>Acceso exclusivo para conductores</Text>
        </View>

        {/* Tarjeta del formulario */}
        <View style={styles.card}>
          {/* Campo de correo electrónico — Req 1.1 */}
          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            placeholder="correo@ejemplo.com"
            placeholderTextColor={theme.textSecondary}
            editable={!isLoading}
            returnKeyType="next"
            accessibilityLabel="Campo de correo electrónico"
          />

          {/* Campo de contraseña — Req 1.1 */}
          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="password"
            placeholder="••••••••"
            placeholderTextColor={theme.textSecondary}
            editable={!isLoading}
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            accessibilityLabel="Campo de contraseña"
          />

          {/* Mensaje de error — Req 1.5, 1.6, 1.7 */}
          {errorMessage !== null && (
            <View style={styles.errorContainer} accessibilityRole="alert">
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* Botón "Iniciar sesión" con indicador de carga — Req 1.8 */}
          <TouchableOpacity
            style={[
              styles.button,
              isLoading && styles.buttonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.8}
            accessibilityLabel="Iniciar sesión"
            accessibilityRole="button"
            accessibilityState={{ disabled: isLoading, busy: isLoading }}
          >
            {isLoading ? (
              <ActivityIndicator
                color={theme.textOnPrimary}
                size="small"
                accessibilityLabel="Cargando..."
              />
            ) : (
              <Text style={styles.buttonText}>Iniciar sesión</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

/**
 * Todos los colores se derivan del tema recibido como parámetro.
 * Ningún valor de color está hardcodeado en este archivo.
 */
function makeStyles(theme: ReturnType<typeof useTheme>['theme']) {
  return StyleSheet.create({
    flex: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: 24,
      paddingVertical: 48,
    },

    // Encabezado
    header: {
      alignItems: 'center',
      marginBottom: 32,
    },
    appName: {
      fontSize: 36,
      fontWeight: 'bold',
      color: theme.primary,
      letterSpacing: 1,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: 'center',
    },

    // Tarjeta
    card: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 24,
      borderWidth: 1,
      borderColor: theme.border,
      // Sombra sutil en iOS
      shadowColor: theme.textPrimary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      // Sombra en Android
      elevation: 3,
    },

    // Etiquetas
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.textPrimary,
      marginBottom: 6,
    },

    // Inputs
    input: {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 16,
      color: theme.textPrimary,
      marginBottom: 16,
    },

    // Error
    errorContainer: {
      backgroundColor: theme.error + '1A', // 10% opacidad del color error
      borderWidth: 1,
      borderColor: theme.error,
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
    },
    errorText: {
      color: theme.error,
      fontSize: 13,
      textAlign: 'center',
      lineHeight: 18,
    },

    // Botón
    button: {
      backgroundColor: theme.primary,
      borderRadius: 10,
      paddingVertical: 14,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 50,
    },
    buttonDisabled: {
      backgroundColor: theme.primaryVariant,
      opacity: 0.7,
    },
    buttonText: {
      color: theme.textOnPrimary,
      fontSize: 16,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
  });
}
