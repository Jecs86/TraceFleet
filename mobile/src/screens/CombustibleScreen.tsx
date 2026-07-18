/**
 * CombustibleScreen — Pantalla de registros de combustible del chofer
 *
 * Modos de operación:
 *   - Con viaje activo (EN_RUTA / RETRASADO): muestra registros del viaje activo
 *     en la sección "Viaje actual" y el historial en la sección colapsable "Histórico".
 *   - Sin viaje activo: muestra solo la sección "Histórico" (solo lectura).
 *
 * Renderiza SectionList de CombustibleCard con:
 *   - LoadingOverlay durante carga inicial
 *   - ErrorBanner con "Reintentar" ante error
 *   - Texto vacío si lista vacía
 *   - RefreshControl (pull-to-refresh)
 *   - Sección "Histórico" colapsable con chevron ▲/▼
 *
 * Validates: Requirements 4.1, 4.2, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 4.11
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

  // Bug 3 (5.1) — Estado separado para registros del viaje actual e histórico
  const [currentViaje, setCurrentViaje] = useState<RegistroCombustible[]>([]);
  const [historico, setHistorico] = useState<RegistroCombustible[]>([]);
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
        const all = await ApiService.getCombustible();

        // Bug 3 (5.2) — Separar registros del viaje activo del historial
        if (activeViaje) {
          // Req 4.5 — Viaje actual: solo los registros del viaje en curso
          setCurrentViaje(all.filter((r) => r.viajeId === activeViaje.id));
          // Req 2.10/2.11 — Histórico: todos los demás registros del chofer
          setHistorico(
            user ? all
              .filter((r) => r.viajeId !== activeViaje.id && r.choferId === user.id)
              .sort((a, b) => b.fecha.localeCompare(a.fecha)) : []
          );
        } else {
          // Sin viaje activo: no hay sección "Viaje actual", todo va al historial
          setCurrentViaje([]);
          setHistorico(user ? all
            .filter((r) => r.choferId === user.id)
            .sort((a, b) => b.fecha.localeCompare(a.fecha)) : []);
        }
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

  // Req 2.6 — Mostrar Alert informativo cuando el FAB se presiona sin viaje activo
  const handleFabDisabledPress = (): void => {
    Alert.alert('Aviso', 'Debes tener un viaje activo para agregar registros');
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
    section,
  }: {
    item: RegistroCombustible;
    section: { title: string };
  }): React.ReactElement => (
    <CombustibleCard
      registro={item}
      // Req 3.3 — Editable solo en sección "Viaje actual"; Req 3.4 — Histórico solo lectura
      editable={section.title === 'Viaje actual' && activeViaje !== null}
      onEdit={() => handleEditRegistro(item.id)}
    />
  );

  const keyExtractor = (item: RegistroCombustible): string => item.id;

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
          ? 'No hay registros de combustible para este viaje'
          : 'No tienes registros de combustible'}
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
      testID="combustible-screen"
    >
      {/* Error banner — mostrado sobre la lista cuando hay error */}
      {error !== null && (
        <ErrorBanner message={error} onRetry={handleRetry} />
      )}

      {/* Lista de registros con pull-to-refresh (Req 4.8) — Bug 3 (5.3): SectionList con secciones */}
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
        testID="combustible-flatlist"
      />

      {/* Botón flotante "Agregar Registro" — siempre visible, deshabilitado sin viaje activo (Req 2.5–2.9) */}
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
            onPress={activeViaje ? handleAgregarRegistro : handleFabDisabledPress}
            disabled={false}
            testID="agregar-registro-button"
            accessibilityRole="button"
            accessibilityLabel="Agregar registro de combustible"
            accessibilityState={{ disabled: activeViaje === null }}
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

export default CombustibleScreen;
