/**
 * useActiveViaje — Derives the active trip for the authenticated driver
 *
 * Delegates to ActiveViajeContext so all screens share a single instance.
 * The public API (activeViaje, isLoading, refresh) is unchanged.
 *
 * Validates: Requirements 4.1, 4.5, 4.6, 5.2, 6.1, 6.5, 6.6, 7.2
 */

import type { Viaje } from '../types/api';
import { useActiveViajeContext } from '../contexts/ActiveViajeContext';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface UseActiveViajeResult {
  /** El viaje activo (EN_RUTA o RETRASADO) del chofer, o null si no existe. */
  activeViaje: Viaje | null;
  /** true mientras se está cargando la lista de viajes. */
  isLoading: boolean;
  /** Recarga la lista de viajes desde la API (propagates to all consumers). */
  refresh: () => void;
}

// ─── Re-exported helpers (kept for existing tests) ───────────────────────────

export function isViajeActivo(viaje: Viaje): boolean {
  return viaje.estado === 'EN_RUTA' || viaje.estado === 'RETRASADO';
}

export function filterViajesByChofer(
  viajes: Viaje[],
  choferId: string,
): Viaje[] {
  return viajes.filter((v) => v.choferId === choferId);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useActiveViaje(): UseActiveViajeResult {
  return useActiveViajeContext();
}
