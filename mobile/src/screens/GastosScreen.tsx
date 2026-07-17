/**
 * GastosScreen — Pantalla de gastos extra del chofer
 *
 * Modos de operación:
 *   - Con viaje activo (EN_RUTA / RETRASADO): muestra gastos del viaje activo,
 *     permite agregar nuevos y editar los existentes.
 *   - Sin viaje activo: muestra historial de todos los gastos del chofer
 *     (solo lectura, sin botones de edición ni de creación).
 *
 * Renderiza FlatList de GastoCard con:
 *   - LoadingOverlay durante carga inicial
 *   - ErrorBanner con "Reintentar" ante error
 *   - Texto vacío si lista vacía
 *   - RefreshControl (pull-to-refresh)
 *
 * Validates: Requirements 6.1, 6.2, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10, 6.11
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { GastoExtra } from '../types/api';
import type { GastosStackParamList } from '../navigation/types';
import { ApiService } from '../services/ApiService';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { useActiveViaje } from '../hooks/useActiveViaje';
import { GastoCard } from '../components/GastoCard';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { ErrorBanner } from '../components/ErrorBanner';

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = NativeStackScreenProps<GastosStackParamList, 'Gastos'>;

// ─── Component ────────────────────────────────────────────────────────────────

export function GastosScreen({ navigation }: Props): React.ReactElement {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { activeViaje, isLoading: isLoadingViaje } = useActiveViaje();

  const [gastos, setGastos] = useState<GastoExtra[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Fetch ──────────────────────────────────────────────────────────────────

  const fetchData = useCallback(
    async (isRefresh = false): Promise<void> => {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const all = await ApiService.getGastos();

        let filtered: GastoExtra[];
        if (activeViaje) {
          // Req 6.1 — Mostrar gastos del viaje activo
          filtered = all.filter((g) => g.viajeId === activeViaje.id);
        } else {
          // Req 6.2 — Historial del chofer autenticado
          filtered = user ? all.filter((g) => g.choferId === user.id) : [];
        }

        setGastos(filtered);
      } catch {
        setError('No se pudieron cargar los gastos. Intenta de nuevo.');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [activeViaje, user],
  );

  // Carga inicial y cuando cambia el viaje activo
  useEffect(() => {
    if (!isLoadingViaje) {
      void fetchData(false);
    }
  }, [fetchData, isLoadingViaje]);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleAgregarGasto = (): void => {
    navigation.navigate('GastoForm', { mode: 'create' });
  };

  const handleEditGasto = (gastoId: string): void => {
    navigation.navigate('GastoForm', { mode: 'edit', gastoId });
  };

  const handleRefresh = (): void => {
    void fetchData(true);
  };

  const handleRetry = (): void => {
    void fetchData(false);
  };

  // ─── Render helpers ─────────────────────────────────────────────────────────

  const renderItem = ({ item }: { item: GastoExtra }): React.ReactElement => (
    <GastoCard
      gasto={item}
      editable={activeViaje !== null}
      onEdit={() => handleEditGasto(item.id)}
    />
  );

  const keyExtractor = (item: GastoExtra): string => item.id;

  const ListEmptyComponent = (): React.ReactElement => (
    <View style={styles.emptyContainer} testID="empty-state">
      <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
        No hay gastos registrados para mostrar
      </Text>
    </View>
  );

  // ─── Render ─────────────────────────────────────────────────────────────────

  const showLoading = isLoading || isLoadingViaje;

  return (
    <View
      style={[styles.container, { backgroundColor: theme.background }]}
      testID="gastos-screen"
    >
      {/* Error banner — mostrado sobre la lista cuando hay error */}
      {error !== null && (
        <ErrorBanner message={error} onRetry={handleRetry} />
      )}

      {/* Lista de gastos con pull-to-refresh (Req 6.8) */}
      <FlatList
        data={gastos}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListEmptyComponent={
          !showLoading && !error ? ListEmptyComponent : undefined
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
        contentContainerStyle={
          gastos.length === 0 && !showLoading && !error
            ? styles.emptyListContent
            : styles.listContent
        }
        testID="gastos-flatlist"
      />

      {/* Botón flotante "Agregar Gasto" — solo con viaje activo (Req 6.4, 6.5, 6.6) */}
      {activeViaje !== null && !showLoading && (
        <View
          style={[styles.fabContainer, { borderTopColor: theme.divider }]}
        >
          <TouchableOpacity
            style={[styles.fab, { backgroundColor: theme.primary }]}
            onPress={handleAgregarGasto}
            testID="agregar-gasto-button"
            accessibilityRole="button"
            accessibilityLabel="Agregar gasto extra"
          >
            <Text style={[styles.fabText, { color: theme.textOnPrimary }]}>
              + Agregar Gasto
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Loading overlay — mostrado sobre todo durante carga inicial */}
      {showLoading && <LoadingOverlay />}
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
    paddingBottom: 80, // Espacio para el FAB
  },
  emptyListContent: {
    flexGrow: 1,
    paddingBottom: 80,
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
    paddingHorizontal: 32,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  fab: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  fabText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GastosScreen;
