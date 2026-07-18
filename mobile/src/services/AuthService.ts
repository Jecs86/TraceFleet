/**
 * AuthService — Servicio de autenticación de TraceFleet Mobile
 *
 * Gestiona el ciclo completo de autenticación:
 *   1. Login vía Supabase Auth → verificación de rol/estado en GET /auth/me
 *   2. Persistencia del JWT con expo-secure-store
 *   3. Logout (Supabase + limpieza del token local)
 *
 * Validates: Requirements 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.9
 */

import * as SecureStore from 'expo-secure-store';
import { supabase } from './supabase';
import type { Usuario } from '../types/api';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type LoginResult =
  | { success: true; user: Usuario; token: string }
  | {
      success: false;
      error: 'INVALID_CREDENTIALS' | 'NOT_CHOFER' | 'INACTIVE_ACCOUNT' | 'NETWORK_ERROR';
    };

// ─── Constantes ───────────────────────────────────────────────────────────────

const TOKEN_KEY = 'tracefleet_jwt';
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

// ─── Implementación ───────────────────────────────────────────────────────────

/**
 * Obtiene el perfil del usuario autenticado desde el backend.
 * Recibe el JWT como parámetro para evitar dependencia circular
 * con getPersistedToken durante el flujo de login.
 */
async function getMe(token: string): Promise<Usuario> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`GET /auth/me falló con status ${response.status}`);
  }

  return response.json() as Promise<Usuario>;
}

/**
 * Persiste el JWT en el almacenamiento seguro del dispositivo.
 */
async function persistToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

/**
 * Recupera el JWT persistido. Retorna null si no existe.
 */
async function getPersistedToken(): Promise<string | null> {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  return token ?? null;
}

/**
 * Elimina el JWT del almacenamiento seguro.
 */
async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

/**
 * Cierra la sesión de Supabase Auth y elimina el token local.
 */
async function logout(): Promise<void> {
  await supabase.auth.signOut();
  await clearToken();
}

/**
 * Flujo completo de login:
 *   1. Autentica con Supabase Auth
 *   2. Verifica rol === 'CHOFER' mediante GET /auth/me
 *   3. Verifica estadoActivo === true
 *   4. Persiste el token si todo es correcto
 */
async function login(email: string, password: string): Promise<LoginResult> {
  try {
    // Paso 1: Autenticar con Supabase Auth
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !data.session) {
      // Req 1.7: credenciales inválidas → error genérico
      return { success: false, error: 'INVALID_CREDENTIALS' };
    }

    const token = data.session.access_token;

    // Paso 2: Verificar perfil en el backend
    let user: Usuario;
    try {
      user = await getMe(token);
    } catch {
      // Error de red al llamar /auth/me
      await supabase.auth.signOut();
      return { success: false, error: 'NETWORK_ERROR' };
    }

    // Paso 3: Verificar rol CHOFER (Req 1.5)
    if (user.rol !== 'CHOFER') {
      await supabase.auth.signOut();
      return { success: false, error: 'NOT_CHOFER' };
    }

    // Paso 4: Verificar cuenta activa (Req 1.6)
    if (!user.estadoActivo) {
      await supabase.auth.signOut();
      return { success: false, error: 'INACTIVE_ACCOUNT' };
    }

    // Paso 5: Persistir token (Req 1.9)
    await persistToken(token);

    return { success: true, user, token };
  } catch {
    // Error de red inesperado
    return { success: false, error: 'NETWORK_ERROR' };
  }
}

// ─── Exportación del servicio ─────────────────────────────────────────────────

export const AuthService = {
  login,
  logout,
  getMe,
  persistToken,
  getPersistedToken,
  clearToken,
};
