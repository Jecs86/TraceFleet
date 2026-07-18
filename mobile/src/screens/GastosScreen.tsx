/**
 * GastosScreen — Pantalla de gastos extra del chofer
 *
 * Modos de operación:
 *   - Con viaje activo (EN_RUTA / RETRASADO): muestra gastos del viaje activo
 *     en la sección "Viaje actual" y el historial en la sección colapsable "Histórico".
 *   - Sin viaje activo: muestra solo la sección "Histórico" (solo lectura).
 *
 * Renderiza SectionList de GastoCard con:
 *   - LoadingOverlay durante carga inicial
 *   - ErrorBanner con "Reintentar" ante error
 *   - Texto vacío si lista vacía
 *   - RefreshControl (pull-to-refresh)
 *   - Sección "Histórico" colapsable con chevron ▲/▼
 *
 * Validates: Requirements 6.1, 6.2, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10, 6.11
 * Validates: Requirements 2.5, 2.6, 2.7, 2.8, 2.9 (Bug 2 — FAB siempre visible)
 * Validates: Requirements 2.10, 2.11, 2.12, 2.13 (Bug 3 — historial en sección colapsable)
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
// FlatList replaced with SectionList for Bug 3 fix (5.3)
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

  // Bug 3 (5.1) — Estado separado para gastos del viaje actual e histórico
  const [currentViaje, setCurrentViaje] = useState<GastoExtra[]>([]);
  const [historico, setHistorico] = useState<GastoExtra[]>([]);
  // Controla si la sección "Histórico" está expandida o colapsada
  const [historicoExpanded, setHistoricoExpanded] = useState(true);

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

        // Bug 3 (5.2) — Separar gastos del viaje activo del historial
        if (activeViaje) {
          // Req 6.1 — Viaje actual: solo los gastos del viaje en curso
          setCurrentViaje(all.filter((g) => g.viajeId === activeViaje.id));
          // Req 2.10/2.11 — Histórico: todos los demás gastos del chofer
          setHistorico(
            user ? all
              .filter((g) => g.viajeId !== activeViaje.id && g.choferId === user.id)
              .sort((a, b) => b.fecha.localeCompare(a.fecha)) : []
          );
        } else {
          // Sin viaje activo: no hay sección "Viaje actual", todo va al historial
          setCurrentViaje([]);
          setHistorico(user ? all
            .filter((g) => g.choferId === user.id)
            .sort((a, b) => b.fecha.localeCompare(a.fecha)) : []);
        }
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

  // Req 2.8 — Mostrar Alert informativo cuando el FAB se presiona sin viaje activo
  const handleFabDisabledPress = (): void => {
    Alert.alert('Aviso', 'Debes tener un viaje activo para agregar gastos');
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

  const renderItem = ({
    item,
    section,
  }: {
    item: GastoExtra;
    section: { title: string };
  }): React.ReactElement => (
    <GastoCard
      gasto={item}
      // Req 3.3 — Editable solo en sección "Viaje actual"; Req 3.4 — Histórico solo lectura
      editable={section.title === 'Viaje actual' && activeViaje !== null}
      onEdit={() => handleEditGasto(item.id)}
    />
  );

  const keyExtractor = (item: GastoExtra): string => item.id;

  // Bug 3 (5.3) — Construir secciones: "Viaje actual" (solo con viaje activo) + "Histórico" colapsable
  const sections = activeViaje
    ? [
        { title: 'Viaje actual', data: currentViaje },
        { title: 'Histórico', data: historicoExpanded ? historico : [] },
      ]
    : [{ title: 'Histórico', data: historicoExpanded ? historico : [] }];

  // Req 2.12/2.13 — Cabeceras de sección con WarmTheme tokens
  const renderSectionHeader = ({
    section,
  }: {
    section: { title: string };
  }): React.ReactElement => {
    if (section.title === 'Viaje actual') {
      // Encabezado estático para el viaje actual
      return (
        <View
          style={[
            styles.sectionHeader,
            { backgroundColor: theme.surface, borderBottomColor: theme.divider },
          ]}
        >
          <Text style={[styles.sectionHeaderText, { color: theme.primary }]}>
            Viaje actual
          </Text>
        </View>
      );
    }
    // Encabezado colapsable para el histórico
    return (
      <TouchableOpacity
        style={[
          styles.sectionHeader,
          { backgroundColor: theme.surface, borderBottomColor: theme.divider },
        ]}
        onPress={() => setHistoricoExpanded((prev) => !prev)}
        accessibilityRole="button"
        accessibilityLabel={
          historicoExpanded ? 'Colapsar histórico' : 'Expandir histórico'
        }
      >
        <Text style={[styles.sectionHeaderText, { color: theme.textPrimary }]}>
          Histórico
        </Text>
        <Text style={[styles.chevron, { color: theme.textSecondary }]}>
          {historicoExpanded ? '▲' : '▼'}
        </Text>
      </TouchableOpacity>
    );
  };

  const ListEmptyComponent = (): React.ReactElement => (
    <View style={styles.emptyContainer} testID="empty-state">
      <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
        {activeViaje
          ? 'No hay gastos registrados para este viaje'
          : 'No tienes gastos registrados'}
      </Text>
    </View>
  );

  // Total de items visibles para determinar si mostrar el empty state
  const totalItems = (activeViaje ? currentViaje.length : 0) + historico.length;

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

      {/* Lista de gastos con pull-to-refresh (Req 6.8) — Bug 3 (5.3): SectionList con secciones */}
      <SectionList
        sections={sections}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        ListEmptyComponent={
          !showLoading && !error && totalItems === 0 ? ListEmptyComponent : undefined
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
          totalItems === 0 && !showLoading && !error
            ? styles.emptyListContent
            : styles.listContent
        }
        stickySectionHeadersEnabled={false}
        testID="gastos-flatlist"
      />

      {/* Botón flotante "Agregar Gasto" — siempre visible, deshabilitado sin viaje activo (Req 2.5–2.9) */}
      {!showLoading && (
        <View
          style={[styles.fabContainer, { borderTopColor: theme.divider }]}
        >
          <TouchableOpacity
            style={[
              styles.fab,
              {
                backgroundColor: theme.primary,
                opacity: activeViaje ? 1.0 : 0.5,
              },
            ]}
            onPress={activeViaje ? handleAgregarGasto : handleFabDisabledPress}
            disabled={false}
            testID="agregar-gasto-button"
            accessibilityRole="button"
            accessibilityLabel="Agregar gasto extra"
            accessibilityState={{ disabled: activeViaje === null }}
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
  // Bug 3 (5.3) — Estilos para cabeceras de sección
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chevron: {
    fontSize: 12,
  },
});

export default GastosScreen;
