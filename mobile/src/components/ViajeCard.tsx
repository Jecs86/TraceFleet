/**
 * ViajeCard — Tarjeta de resumen para un viaje
 *
 * Muestra origen, destino, badge de estado coloreado y fecha de salida.
 * - Estados activos (EN_RUTA / RETRASADO): badge naranja (theme.warning)
 * - Estado FINALIZADO: badge gris (theme.textSecondary)
 *
 * Validates: Requirements 2.3, 2.4, 10.3
 */

import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { EstadoViaje, Viaje } from '../types/api';
import { useTheme } from '../hooks/useTheme';

interface ViajeCardProps {
  viaje: Viaje;
  onPress: () => void;
}

/** Formatea un ISO date string a dd/mm/yyyy HH:mm */
function formatFecha(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return isoDate;
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
  } catch {
    return isoDate;
  }
}

/** Etiqueta legible del estado */
const ESTADO_LABEL: Record<EstadoViaje, string> = {
  EN_RUTA: 'En Ruta',
  RETRASADO: 'Retrasado',
  FINALIZADO: 'Finalizado',
};

export function ViajeCard({ viaje, onPress }: ViajeCardProps): React.ReactElement {
  const { theme } = useTheme();

  const isActive = viaje.estado === 'EN_RUTA' || viaje.estado === 'RETRASADO';
  const badgeColor = isActive ? theme.warning : theme.textSecondary;
  const badgeBg = isActive ? theme.warning + '26' : theme.textSecondary + '26'; // ~15% tint

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
        },
      ]}
      onPress={onPress}
      testID={`viaje-card-${viaje.id}`}
      accessibilityRole="button"
      accessibilityLabel={`Viaje de ${viaje.origen} a ${viaje.destino}`}
    >
      {/* Route row */}
      <View style={styles.routeRow}>
        <View style={styles.routeInfo}>
          <Text
            style={[styles.origen, { color: theme.textPrimary }]}
            numberOfLines={1}
            testID="viaje-origen"
          >
            {viaje.origen}
          </Text>
          <Text style={[styles.arrow, { color: theme.textSecondary }]}>→</Text>
          <Text
            style={[styles.destino, { color: theme.textPrimary }]}
            numberOfLines={1}
            testID="viaje-destino"
          >
            {viaje.destino}
          </Text>
        </View>

        {/* Estado badge */}
        <View
          style={[
            styles.badge,
            { backgroundColor: badgeBg, borderColor: badgeColor },
          ]}
          testID="viaje-estado-badge"
        >
          <Text style={[styles.badgeText, { color: badgeColor }]}>
            {ESTADO_LABEL[viaje.estado]}
          </Text>
        </View>
      </View>

      {/* Fecha de salida */}
      <Text
        style={[styles.fecha, { color: theme.textSecondary }]}
        testID="viaje-fecha-salida"
      >
        Salida: {formatFecha(viaje.fechaSalida)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 6,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
    flexWrap: 'nowrap',
    overflow: 'hidden',
  },
  origen: {
    fontSize: 15,
    fontWeight: '600',
    flexShrink: 1,
  },
  arrow: {
    fontSize: 14,
    marginHorizontal: 6,
  },
  destino: {
    fontSize: 15,
    fontWeight: '600',
    flexShrink: 1,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  fecha: {
    fontSize: 13,
  },
});
