/**
 * ActiveViajeContext — Shared state for the driver's active trip
 *
 * Provides a single source of truth for activeViaje across all screens.
 * When ViajeDetailScreen finalizes a trip, it calls refresh() here and
 * every subscribed screen (Gastos, Combustible) sees the updated state
 * immediately — without each screen maintaining its own isolated copy.
 *
 * Usage:
 *   - Wrap the app with <ActiveViajeProvider> (inside AuthProvider so user is available)
 *   - Consume via useActiveViaje() hook (unchanged public API)
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { ApiService } from '../services/ApiService';
import { useAuth } from '../hooks/useAuth';
import type { Viaje } from '../types/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ActiveViajeContextValue {
  activeViaje: Viaje | null;
  isLoading: boolean;
  refresh: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

export const ActiveViajeContext = createContext<ActiveViajeContextValue>({
  activeViaje: null,
  isLoading: true,
  refresh: () => {},
});

// ─── Helpers (same logic as original useActiveViaje) ─────────────────────────

function isViajeActivo(viaje: Viaje): boolean {
  return viaje.estado === 'EN_RUTA' || viaje.estado === 'RETRASADO';
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ActiveViajeProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const { user } = useAuth();
  const [activeViaje, setActiveViaje] = useState<Viaje | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!user) {
      setActiveViaje(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchActiveViaje() {
      setIsLoading(true);
      try {
        const viajes = await ApiService.getViajes();
        if (cancelled) return;
        const myViajes = viajes.filter((v) => v.choferId === user!.id);
        const found = myViajes.find(isViajeActivo) ?? null;
        setActiveViaje(found);
      } catch {
        if (!cancelled) setActiveViaje(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void fetchActiveViaje();

    return () => {
      cancelled = true;
    };
  }, [user, refreshKey]);

  return (
    <ActiveViajeContext.Provider value={{ activeViaje, isLoading, refresh }}>
      {children}
    </ActiveViajeContext.Provider>
  );
}

// ─── Internal hook consumed by useActiveViaje ─────────────────────────────────

export function useActiveViajeContext(): ActiveViajeContextValue {
  return useContext(ActiveViajeContext);
}
