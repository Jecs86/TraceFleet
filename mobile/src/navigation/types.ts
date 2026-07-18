/**
 * navigation/types.ts — Typed param lists for all navigators
 *
 * Validates: Requirements 9.1, 9.3, 9.4, 9.5
 */

import type { NavigatorScreenParams } from '@react-navigation/native';

// ─── Stack param lists ────────────────────────────────────────────────────────

export type RutasStackParamList = {
  Rutas: undefined;
  ViajeDetail: { viajeId: string };
};

export type CombustibleStackParamList = {
  Combustible: undefined;
  CombustibleForm: { mode: 'create' } | { mode: 'edit'; registroId: string };
};

export type GastosStackParamList = {
  Gastos: undefined;
  GastoForm: { mode: 'create' } | { mode: 'edit'; gastoId: string };
};

// ─── Tab param list ───────────────────────────────────────────────────────────

export type TabParamList = {
  RutasTab: NavigatorScreenParams<RutasStackParamList>;
  CombustibleTab: NavigatorScreenParams<CombustibleStackParamList>;
  GastosTab: NavigatorScreenParams<GastosStackParamList>;
  ConfiguracionTab: undefined;
};
