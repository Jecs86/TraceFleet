/**
 * RutasScreen — Pantalla principal de viajes del chofer
 *
 * - Carga los viajes del chofer autenticado desde GET /viajes
 * - Filtra por choferId === user.id
 * - Ordena con sortViajesByEstado() (activos primero)
 * - Renderiza SectionList con sección "Viajes Activos" (fija) y "Finalizados" (colapsable)
 * - Estados: LoadingOverlay durante carga, ErrorBanner con "Reintentar" ante error,
 *   texto vacío si lista vacía
 * - Al presionar una tarjeta navega a ViajeDetail pasando viajeId
 *
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.14, 2.15, 2.16
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
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
  // Task 6.1 — "Finalizados" section collapsed by default (Req 2.15)
  const [finalizadosExpanded, setFinalizadosExpanded] = useState(false);

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

  // ─── Section data (Task 6.1) ────────────────────────────────────────────────

  // Separate active trips (EN_RUTA, RETRASADO) from finalized ones (Req 2.14)
  const activos = viajes.filter(
    (v) => v.estado === 'EN_RUTA' || v.estado === 'RETRASADO',
  );
  const finalizados = viajes
    .filter((v) => v.estado === 'FINALIZADO')
    .sort((a, b) => b.fechaSalida.localeCompare(a.fechaSalida));

  // Build sections: always show "Viajes Activos"; only show "Finalizados" when
  // there is at least one finalized trip (Req 2.14, 2.15, 2.16).
  // When viajes is completely empty we pass an empty sections array so that
  // SectionList's ListEmptyComponent fires showing "No tienes viajes asignados" (Req 3.6).
  const sections: { title: string; data: (Viaje | null)[] }[] =
    viajes.length === 0
      ? []
      : [
          { title: 'Viajes Activos', data: activos.length > 0 ? activos : [null] },
          ...(finalizados.length > 0
            ? [{ title: 'Finalizados', data: finalizadosExpanded ? finalizados : [] }]
            : []),
        ];

  // ─── Render helpers ─────────────────────────────────────────────────────────

  // Task 6.2 — renderItem: null means "no active trips" placeholder (Req 2.16)
  const renderItem = ({
    item,
  }: {
    item: Viaje | null;
  }): React.ReactElement => {
    if (item === null) {
      return (
        <View style={styles.emptySection} testID="no-active-trips">
          <Text style={[styles.emptySectionText, { color: theme.textSecondary }]}>
            No tienes viajes activos
          </Text>
        </View>
      );
    }
    return (
      <ViajeCard
        viaje={item}
        onPress={() => handlePressViaje(item.id)}
      />
    );
  };

  // Task 6.2 — renderSectionHeader: static for "Viajes Activos", collapsible for "Finalizados"
  const renderSectionHeader = ({
    section,
  }: {
    section: { title: string };
  }): React.ReactElement => {
    if (section.title === 'Finalizados') {
      return (
        <TouchableOpacity
          style={[
            styles.sectionHeader,
            { backgroundColor: theme.surface, borderBottomColor: theme.border },
          ]}
          onPress={() => setFinalizadosExpanded((prev) => !prev)}
          testID="finalizados-section-header"
          accessibilityRole="button"
          accessibilityLabel={
            finalizadosExpanded
              ? 'Colapsar sección Finalizados'
              : 'Expandir sección Finalizados'
          }
        >
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Finalizados
          </Text>
          <Text style={[styles.chevron, { color: theme.textSecondary }]}>
            {finalizadosExpanded ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>
      );
    }

    // "Viajes Activos" — static header
    return (
      <View
        style={[
          styles.sectionHeader,
          { backgroundColor: theme.surface, borderBottomColor: theme.border },
        ]}
        testID="activos-section-header"
      >
        <Text style={[styles.sectionTitle, { color: theme.primary }]}>
          Viajes Activos
        </Text>
      </View>
    );
  };

  const keyExtractor = (item: Viaje | null, index: number): string =>
    item ? item.id : `empty-${index}`;

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

      {/* Viajes list with pull-to-refresh (Req 2.8, 3.5) — Task 6.2: SectionList */}
      <SectionList
        sections={sections}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
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
        stickySectionHeadersEnabled={false}
        testID="viajes-sectionlist"
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
  // Section header shared styles (Task 6.2)
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  chevron: {
    fontSize: 12,
  },
  // Empty-section placeholder for "No tienes viajes activos" (Req 2.16)
  emptySection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptySectionText: {
    fontSize: 15,
    textAlign: 'center',
  },
});

export default RutasScreen;
