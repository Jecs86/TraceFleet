/**
 * ViajeDetailScreen — Detalle de un viaje y acción de finalizar ruta
 *
 * - Lee viajeId de los params de navegación (RutasStack)
 * - Carga el detalle del viaje con ApiService.getViajeById()
 * - Muestra todos los campos del viaje en tarjetas con ScrollView
 * - Permite finalizar la ruta con confirmación (ConfirmDialog)
 * - Oculta el botón "Finalizar Ruta" cuando el estado es FINALIZADO
 * - Todos los colores provienen de useTheme()
 *
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Viaje } from '../types/api';
import type { RutasStackParamList } from '../navigation/types';
import { ApiService } from '../services/ApiService';
import { useTheme } from '../hooks/useTheme';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { ErrorBanner } from '../components/ErrorBanner';
import { ConfirmDialog } from '../components/ConfirmDialog';

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = NativeStackScreenProps<RutasStackParamList, 'ViajeDetail'>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Formatea un string ISO de fecha para mostrar en pantalla (locale es-EC). */
function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('es-EC', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

/** Etiqueta legible del estado del viaje. */
function estadoLabel(estado: Viaje['estado']): string {
  switch (estado) {
    case 'EN_RUTA':
      return 'En Ruta';
    case 'RETRASADO':
      return 'Retrasado';
    case 'FINALIZADO':
      return 'Finalizado';
    default:
      return estado;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ViajeDetailScreen({ route }: Props): React.ReactElement {
  const { viajeId } = route.params;
  const { theme } = useTheme();

  const [viaje, setViaje] = useState<Viaje | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog + finalizar state
  const [dialogVisible, setDialogVisible] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);

  // ─── Fetch ──────────────────────────────────────────────────────────────────

  const fetchViaje = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await ApiService.getViajeById(viajeId);
      setViaje(data);
    } catch {
      setError('No se pudo cargar el detalle del viaje. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }, [viajeId]);

  useEffect(() => {
    void fetchViaje();
  }, [fetchViaje]);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleFinalizarPress = (): void => {
    setDialogVisible(true);
  };

  const handleDialogCancel = (): void => {
    setDialogVisible(false);
  };

  const handleDialogConfirm = async (): Promise<void> => {
    if (!viaje) return;

    setIsFinalizing(true);
    try {
      const updated = await ApiService.finalizarViaje(viaje.id);
      setViaje(updated);
      setDialogVisible(false);
    } catch {
      setDialogVisible(false);
      setError('No se pudo finalizar el viaje. Intenta de nuevo.');
    } finally {
      setIsFinalizing(false);
    }
  };

  const handleRetry = (): void => {
    void fetchViaje();
  };

  // ─── Badge color ────────────────────────────────────────────────────────────

  const estadoBadgeColor = (estado: Viaje['estado']): string => {
    if (estado === 'EN_RUTA' || estado === 'RETRASADO') {
      return theme.warning;
    }
    return theme.textSecondary;
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <View
      style={[styles.container, { backgroundColor: theme.background }]}
      testID="viaje-detail-screen"
    >
      {/* Error banner */}
      {error !== null && (
        <ErrorBanner message={error} onRetry={handleRetry} />
      )}

      {/* Content — only render when we have data */}
      {viaje !== null && (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          testID="viaje-detail-scroll"
        >
          {/* ── Estado badge ──────────────────────────────────────────────── */}
          <View
            style={[
              styles.badgeRow,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
            testID="estado-badge-row"
          >
            <Text style={[styles.badgeLabel, { color: theme.textSecondary }]}>
              Estado
            </Text>
            <View
              style={[
                styles.badge,
                { backgroundColor: estadoBadgeColor(viaje.estado) + '22' },
              ]}
              testID="estado-badge"
            >
              <Text
                style={[
                  styles.badgeText,
                  { color: estadoBadgeColor(viaje.estado) },
                ]}
              >
                {estadoLabel(viaje.estado)}
              </Text>
            </View>
          </View>

          {/* ── Tarjeta principal: origen / destino / fechas ──────────────── */}
          <View
            style={[
              styles.card,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
            testID="main-card"
          >
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
              Información de la Ruta
            </Text>

            <DetailRow
              label="Origen"
              value={viaje.origen}
              theme={theme}
              testID="field-origen"
            />
            <DetailRow
              label="Destino"
              value={viaje.destino}
              theme={theme}
              testID="field-destino"
            />
            <DetailRow
              label="Fecha de salida"
              value={formatDate(viaje.fechaSalida)}
              theme={theme}
              testID="field-fechaSalida"
            />

            {viaje.fechaLlegada !== undefined && (
              <DetailRow
                label="Fecha de llegada"
                value={formatDate(viaje.fechaLlegada)}
                theme={theme}
                testID="field-fechaLlegada"
              />
            )}
          </View>

          {/* ── Tarjeta de carga (opcional) ───────────────────────────────── */}
          {(viaje.tipoCarga !== undefined ||
            viaje.cantidadCarga !== undefined ||
            viaje.unidadMedida !== undefined) && (
            <View
              style={[
                styles.card,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
              testID="carga-card"
            >
              <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
                Carga
              </Text>

              {viaje.tipoCarga !== undefined && (
                <DetailRow
                  label="Tipo de carga"
                  value={viaje.tipoCarga}
                  theme={theme}
                  testID="field-tipoCarga"
                />
              )}
              {viaje.cantidadCarga !== undefined && (
                <DetailRow
                  label="Cantidad"
                  value={String(viaje.cantidadCarga)}
                  theme={theme}
                  testID="field-cantidadCarga"
                />
              )}
              {viaje.unidadMedida !== undefined && (
                <DetailRow
                  label="Unidad de medida"
                  value={viaje.unidadMedida}
                  theme={theme}
                  testID="field-unidadMedida"
                />
              )}
            </View>
          )}

          {/* ── Tarjeta de ingresos (opcional) ───────────────────────────── */}
          {viaje.ingresoServicio !== undefined && (
            <View
              style={[
                styles.card,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
              testID="ingreso-card"
            >
              <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
                Ingreso
              </Text>
              <DetailRow
                label="Ingreso por servicio"
                value={`$${viaje.ingresoServicio.toFixed(2)}`}
                theme={theme}
                testID="field-ingresoServicio"
              />
            </View>
          )}

          {/* ── Botón Finalizar Ruta ─────────────────────────────────────── */}
          {viaje.estado !== 'FINALIZADO' && (
            <TouchableOpacity
              style={[
                styles.finalizarButton,
                { backgroundColor: theme.primary },
                isFinalizing && styles.disabledButton,
              ]}
              onPress={handleFinalizarPress}
              disabled={isFinalizing}
              testID="finalizar-button"
              accessibilityRole="button"
              accessibilityLabel="Finalizar Ruta"
            >
              {isFinalizing ? (
                <ActivityIndicator
                  size="small"
                  color={theme.textOnPrimary}
                  testID="finalizar-loading"
                />
              ) : (
                <Text
                  style={[styles.finalizarText, { color: theme.textOnPrimary }]}
                >
                  Finalizar Ruta
                </Text>
              )}
            </TouchableOpacity>
          )}
        </ScrollView>
      )}

      {/* Loading overlay — on top of everything during initial load */}
      {isLoading && <LoadingOverlay />}

      {/* Confirm dialog */}
      <ConfirmDialog
        visible={dialogVisible}
        title="Finalizar Ruta"
        message="¿Estás seguro de que deseas finalizar esta ruta? Esta acción no se puede deshacer"
        onCancel={handleDialogCancel}
        onConfirm={() => {
          void handleDialogConfirm();
        }}
        isLoading={isFinalizing}
      />
    </View>
  );
}

// ─── DetailRow ────────────────────────────────────────────────────────────────

interface DetailRowProps {
  label: string;
  value: string;
  theme: import('../theme/WarmTheme').WarmTheme;
  testID?: string;
}

function DetailRow({ label, value, theme, testID }: DetailRowProps): React.ReactElement {
  return (
    <View style={styles.row} testID={testID}>
      <Text style={[styles.rowLabel, { color: theme.textSecondary }]}>
        {label}
      </Text>
      <Text style={[styles.rowValue, { color: theme.textPrimary }]}>
        {value}
      </Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  // Estado badge row
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  badgeLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  badge: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  // Cards
  card: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  // Detail rows
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 6,
  },
  rowLabel: {
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  // Finalizar button
  finalizarButton: {
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  finalizarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default ViajeDetailScreen;
