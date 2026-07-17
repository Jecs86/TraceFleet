/**
 * AuthContext — Contexto global de autenticación para TraceFleet Mobile
 *
 * Al montar, lee el token persistido, valida el perfil mediante GET /auth/me
 * y verifica que el rol sea 'CHOFER' y que la cuenta esté activa.
 * Si cualquier verificación falla, limpia el token y deja user = null.
 *
 * Validates: Requirements 1.2, 1.3, 1.4, 1.9, 1.10, 8.8
 */

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { AuthService } from '../services/AuthService';
import type { LoginResult } from '../services/AuthService';
import type { Usuario } from '../types/api';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface AuthContextValue {
  user: Usuario | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
}

// ─── Contexto ────────────────────────────────────────────────────────────────

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  isLoading: true,
  login: async () => ({ success: false, error: 'NETWORK_ERROR' }),
  logout: async () => {},
});

// ─── Provider ────────────────────────────────────────────────────────────────

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Al montar, verificar el token persistido y restaurar la sesión (Req 1.9, 1.10)
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        const persistedToken = await AuthService.getPersistedToken();

        if (!persistedToken) {
          // No hay token guardado, mostrar pantalla de login
          if (!cancelled) setIsLoading(false);
          return;
        }

        // Verificar que el token sigue siendo válido obteniendo el perfil
        let profile: Usuario;
        try {
          profile = await AuthService.getMe(persistedToken);
        } catch {
          // Token inválido o error de red — limpiar y pedir login
          await AuthService.clearToken();
          if (!cancelled) setIsLoading(false);
          return;
        }

        // Verificar rol CHOFER y cuenta activa
        if (profile.rol !== 'CHOFER' || !profile.estadoActivo) {
          await AuthService.clearToken();
          if (!cancelled) setIsLoading(false);
          return;
        }

        // Sesión válida — restaurar estado
        if (!cancelled) {
          setUser(profile);
          setToken(persistedToken);
          setIsLoading(false);
        }
      } catch {
        // Error inesperado — dejar user = null
        if (!cancelled) setIsLoading(false);
      }
    }

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Delega a AuthService.login() y, en caso de éxito, actualiza
   * el estado del contexto con el usuario y token recibidos.
   * Req 1.2, 1.3, 1.4
   */
  const login = useCallback(
    async (email: string, password: string): Promise<LoginResult> => {
      const result = await AuthService.login(email, password);

      if (result.success) {
        setUser(result.user);
        setToken(result.token);
      }

      return result;
    },
    [],
  );

  /**
   * Delega a AuthService.logout() y limpia el estado del contexto.
   * Req 8.8
   */
  const logout = useCallback(async (): Promise<void> => {
    await AuthService.logout();
    setUser(null);
    setToken(null);
  }, []);

  const value: AuthContextValue = {
    user,
    token,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
