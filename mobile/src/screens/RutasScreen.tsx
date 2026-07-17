/**
 * RutasScreen — Pantalla principal de viajes del chofer
 *
 * - Carga los viajes del chofer autenticado desde GET /viajes
 * - Filtra por choferId === user.id
 * - Ordena con sortViajesByEstado() (activos primero)
 * - Renderiza FlatList de ViajeCard con RefreshControl (pull-to-refresh)
 * - Estados: LoadingOverlay durante carga, ErrorBanner con "Reintentar" ante error,
 *   texto vacío si lista vacía
 * - Al presionar una tarjeta navega a ViajeDetail pasando viajeId
 *
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Viaje } from '../types/api';
import type { RutasStackParamList } from '../navigation/types';
import { ApiService } from '../services/ApiService';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { ViajeCard } from '../components/ViajeCard';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { ErrorBanner } from '../components/ErrorBanner';

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = NativeStackScreenProps<RutasStackParamList, 'Rutas'>;

// ─── Pure helper: sortViajesByEstado ─────────────────────────────────────────

/**
 * Ordena un array de viajes colocando los activos (EN_RUTA, RETRASADO) antes
 * que los inactivos (FINALIZADO). Preserva el orden relativo dentro de cada grupo.
 *
 * Esta es una función pura exportada para facilitar el testeo aislado.
 *
 * Validates: Requirements 2.2 — Property 5
 */
export function sortViajesByEstado(viajes: Viaje[]): Viaje[] {
  const isActive = (v: Viaje): boolean =>
    v.estado === 'EN_RUTA' || v.estado === 'RETRASADO';

  return [...viajes].sort((a, b) => {
    const aActive = isActive(a) ? 0 : 1;
    const bActive = isActive(b) ? 0 : 1;
    return aActive - bActive;
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RutasScreen({ navigation }: Props): React.ReactElement {
  const { user } = useAuth();
  const { theme } = useTheme();

  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Fetch ──────────────────────────────────────────────────────────────────

  const fetchViajes = useCallback(
    async (isRefresh = false): Promise<void> => {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const all = await ApiService.getViajes();
        // Filtrar por chofer autenticado (Req 2.1 — Property 4)
        const mine = user ? all.filter((v) => v.choferId === user.id) : [];
        // Ordenar: activos primero (Req 2.2 — Property 5)
        const sorted = sortViajesByEstado(mine);
        setViajes(sorted);
      } catch {
        setError('No se pudieron cargar los viajes. Intenta de nuevo');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [user],
  );

  // Carga inicial al montar
  useEffect(() => {
    void fetchViajes(false);
  }, [fetchViajes]);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handlePressViaje = (viajeId: string): void => {
    navigation.navigate('ViajeDetail', { viajeId });
  };

  const handleRefresh = (): void => {
    void fetchViajes(true);
  };

  const handleRetry = (): void => {
    void fetchViajes(false);
  };

  // ─── Render helpers ─────────────────────────────────────────────────────────

  const renderItem = ({ item }: { item: Viaje }): React.ReactElement => (
    <ViajeCard
      viaje={item}
      onPress={() => handlePressViaje(item.id)}
    />
  );

  const keyExtractor = (item: Viaje): string => item.id;

  const ListEmptyComponent = (): React.ReactElement => (
    <View style={styles.emptyContainer} testID="empty-state">
      <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
        No tienes viajes asignados
      </Text>
    </View>
  );

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <View
      style={[styles.container, { backgroundColor: theme.background }]}
      testID="rutas-screen"
    >
      {/* Error banner — shown above the list when there is an error */}
      {error !== null && (
        <ErrorBanner
          message={error}
          onRetry={handleRetry}
        />
      )}

      {/* Viajes list with pull-to-refresh (Req 2.8) */}
      <FlatList
        data={viajes}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListEmptyComponent={!isLoading && !error ? ListEmptyComponent : undefined}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
        contentContainerStyle={
          viajes.length === 0 && !isLoading && !error
            ? styles.emptyListContent
            : styles.listContent
        }
        testID="viajes-flatlist"
      />

      {/* Loading overlay — shown on top during initial load (Req 2.5) */}
      {isLoading && <LoadingOverlay />}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default RutasScreen;
