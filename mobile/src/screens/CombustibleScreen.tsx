/**
 * CombustibleScreen — Pantalla de registros de combustible del chofer
 *
 * Modos de operación:
 *   - Con viaje activo (EN_RUTA / RETRASADO): muestra registros del viaje activo,
 *     permite agregar nuevos y editar los existentes.
 *   - Sin viaje activo: muestra historial de todos los registros del chofer
 *     (solo lectura, sin botones de edición ni de creación).
 *
 * Renderiza FlatList de CombustibleCard con:
 *   - LoadingOverlay durante carga inicial
 *   - ErrorBanner con "Reintentar" ante error
 *   - Texto vacío si lista vacía
 *   - RefreshControl (pull-to-refresh)
 *
 * Validates: Requirements 4.1, 4.2, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 4.11
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
import type { RegistroCombustible } from '../types/api';
import type { CombustibleStackParamList } from '../navigation/types';
import { ApiService } from '../services/ApiService';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { useActiveViaje } from '../hooks/useActiveViaje';
import { CombustibleCard } from '../components/CombustibleCard';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { ErrorBanner } from '../components/ErrorBanner';

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = NativeStackScreenProps<CombustibleStackParamList, 'Combustible'>;

// ─── Component ────────────────────────────────────────────────────────────────

export function CombustibleScreen({ navigation }: Props): React.ReactElement {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { activeViaje, isLoading: isLoadingViaje } = useActiveViaje();

  const [registros, setRegistros] = useState<RegistroCombustible[]>([]);
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
        const all = await ApiService.getCombustible();

        let filtered: RegistroCombustible[];
        if (activeViaje) {
          // Req 4.5 — Mostrar registros del viaje activo
          filtered = all.filter((r) => r.viajeId === activeViaje.id);
        } else {
          // Req 4.2 — Historial del chofer autenticado
          filtered = user ? all.filter((r) => r.choferId === user.id) : [];
        }

        setRegistros(filtered);
      } catch {
        setError('No se pudieron cargar los registros de combustible. Intenta de nuevo.');
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

  const handleAgregarRegistro = (): void => {
    navigation.navigate('CombustibleForm', { mode: 'create' });
  };

  const handleEditRegistro = (registroId: string): void => {
    navigation.navigate('CombustibleForm', { mode: 'edit', registroId });
  };

  const handleRefresh = (): void => {
    void fetchData(true);
  };

  const handleRetry = (): void => {
    void fetchData(false);
  };

  // ─── Render helpers ─────────────────────────────────────────────────────────

  const renderItem = ({
    item,
  }: {
    item: RegistroCombustible;
  }): React.ReactElement => (
    <CombustibleCard
      registro={item}
      editable={activeViaje !== null}
      onEdit={() => handleEditRegistro(item.id)}
    />
  );

  const keyExtractor = (item: RegistroCombustible): string => item.id;

  const ListEmptyComponent = (): React.ReactElement => (
    <View style={styles.emptyContainer} testID="empty-state">
      <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
        {activeViaje
          ? 'No hay registros de combustible para este viaje'
          : 'No tienes registros de combustible'}
      </Text>
    </View>
  );

  // ─── Render ─────────────────────────────────────────────────────────────────

  const showLoading = isLoading || isLoadingViaje;

  return (
    <View
      style={[styles.container, { backgroundColor: theme.background }]}
      testID="combustible-screen"
    >
      {/* Error banner — mostrado sobre la lista cuando hay error */}
      {error !== null && (
        <ErrorBanner message={error} onRetry={handleRetry} />
      )}

      {/* Lista de registros con pull-to-refresh (Req 4.8) */}
      <FlatList
        data={registros}
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
          registros.length === 0 && !showLoading && !error
            ? styles.emptyListContent
            : styles.listContent
        }
        testID="combustible-flatlist"
      />

      {/* Botón flotante "Agregar Registro" — solo con viaje activo (Req 4.4) */}
      {activeViaje !== null && !showLoading && (
        <View
          style={[styles.fabContainer, { borderTopColor: theme.divider }]}
        >
          <TouchableOpacity
            style={[styles.fab, { backgroundColor: theme.primary }]}
            onPress={handleAgregarRegistro}
            testID="agregar-registro-button"
            accessibilityRole="button"
            accessibilityLabel="Agregar registro de combustible"
          >
            <Text style={[styles.fabText, { color: theme.textOnPrimary }]}>
              + Agregar Registro
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Loading overlay — mostrado sobre todo durante carga inicial (Req 4.9) */}
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

export default CombustibleScreen;
