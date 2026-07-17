/**
 * useActiveViaje — Deriva el ViajeActivo del chofer autenticado
 *
 * Llama a GET /viajes, filtra por choferId === user.id y retorna
 * el primer viaje con estado 'EN_RUTA' o 'RETRASADO'. Retorna null
 * si no existe ningún viaje activo.
 *
 * No añade estado global propio: es un hook derivado que consume
 * AuthContext y ApiService directamente.
 *
 * Validates: Requirements 4.1, 4.5, 4.6, 5.2, 6.1, 6.5, 6.6, 7.2
 */

import { useState, useEffect, useCallback } from 'react';
import { ApiService } from '../services/ApiService';
import { useAuth } from './useAuth';
import type { Viaje } from '../types/api';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface UseActiveViajeResult {
  /** El viaje activo (EN_RUTA o RETRASADO) del chofer, o null si no existe. */
  activeViaje: Viaje | null;
  /** true mientras se está cargando la lista de viajes. */
  isLoading: boolean;
  /** Recarga la lista de viajes desde la API. */
  refresh: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Determina si un viaje está activo.
 * Exportado para poder ser testeado independientemente.
 */
export function isViajeActivo(viaje: Viaje): boolean {
  return viaje.estado === 'EN_RUTA' || viaje.estado === 'RETRASADO';
}

/**
 * Filtra la lista de viajes retornando solo los del chofer autenticado.
 * Exportado para los property tests de la Property 4.
 */
export function filterViajesByChofer(
  viajes: Viaje[],
  choferId: string,
): Viaje[] {
  return viajes.filter((v) => v.choferId === choferId);
}

export function useActiveViaje(): UseActiveViajeResult {
  const { user } = useAuth();
  const [activeViaje, setActiveViaje] = useState<Viaje | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Contador para forzar recarga al llamar refresh()
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    // Si no hay usuario autenticado no hay nada que cargar
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

        // Filtrar por choferId y encontrar el primer viaje activo
        const myViajes = filterViajesByChofer(viajes, user!.id);
        const found = myViajes.find(isViajeActivo) ?? null;
        setActiveViaje(found);
      } catch {
        // En caso de error de red, mantener el valor anterior sin crashear
        if (!cancelled) setActiveViaje(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchActiveViaje();

    return () => {
      cancelled = true;
    };
  // refreshKey fuerza la re-ejecución del efecto cuando se llama refresh()
  }, [user, refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return { activeViaje, isLoading, refresh };
}
