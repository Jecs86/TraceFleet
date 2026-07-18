/**
 * ThemeContext — Contexto global de tema para TraceFleet Mobile
 *
 * Gestiona la preferencia de tema (claro/oscuro) y la persiste en AsyncStorage.
 * Al montar, restaura la preferencia guardada bajo la clave 'tracefleet_theme_mode'.
 * toggleTheme() alterna entre 'light' y 'dark' y persiste la nueva preferencia.
 *
 * Validates: Requirements 8.2, 8.3, 8.4, 8.5, 8.6
 */

import React, { createContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from '../theme/AppTheme';
import type { AppTheme } from '../theme/AppTheme';

// ─── Constantes ───────────────────────────────────────────────────────────────

const THEME_STORAGE_KEY = 'tracefleet_theme_mode';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface ThemeContextValue {
  mode: 'light' | 'dark';
  theme: AppTheme;
  toggleTheme: () => void;
}

// ─── Contexto ────────────────────────────────────────────────────────────────

export const ThemeContext = createContext<ThemeContextValue>({
  mode: 'light',
  theme: lightTheme,
  toggleTheme: () => {},
});

// ─── Provider ────────────────────────────────────────────────────────────────

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Req 10.2: el modo claro es el predeterminado en primera instalación
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  // Al montar, restaurar la preferencia persistida (Req 8.6)
  useEffect(() => {
    let cancelled = false;

    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((saved) => {
        if (!cancelled && (saved === 'light' || saved === 'dark')) {
          setMode(saved);
        }
      })
      .catch(() => {
        // Si falla la lectura, se mantiene el modo por defecto 'light'
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Alterna entre 'light' y 'dark' y persiste la nueva preferencia (Req 8.4, 8.5, 8.6)
  const toggleTheme = useCallback(() => {
    setMode((current) => {
      const next = current === 'light' ? 'dark' : 'light';
      AsyncStorage.setItem(THEME_STORAGE_KEY, next).catch(() => {
        // Si falla la persistencia, el modo ya fue actualizado en memoria
      });
      return next;
    });
  }, []);

  const value: ThemeContextValue = {
    mode,
    theme: mode === 'light' ? lightTheme : darkTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
