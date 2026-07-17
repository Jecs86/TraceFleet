/**
 * GastoCard — Tarjeta de resumen para un gasto extra
 *
 * Muestra categoría, monto, fecha y descripción (cuando existe).
 * El botón de edición solo se renderiza cuando editable === true.
 *
 * Validates: Requirements 6.3, 6.7, 6.9, 10.3
 */

import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { GastoExtra } from '../types/api';
import { useTheme } from '../hooks/useTheme';

interface GastoCardProps {
  gasto: GastoExtra;
  editable?: boolean;
  onEdit?: () => void;
}

/** Formatea un ISO date string a dd/mm/yyyy */
function formatFecha(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return isoDate;
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  } catch {
    return isoDate;
  }
}

export function GastoCard({
  gasto,
  editable = false,
  onEdit,
}: GastoCardProps): React.ReactElement {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
        },
      ]}
      testID={`gasto-card-${gasto.id}`}
    >
      {/* Header: categoría + monto + edit button */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text
            style={[styles.categoria, { color: theme.textPrimary }]}
            numberOfLines={1}
            testID="gasto-categoria"
          >
            {gasto.categoria}
          </Text>
          <Text
            style={[styles.monto, { color: theme.primary }]}
            testID="gasto-monto"
          >
            ${gasto.monto.toFixed(2)}
          </Text>
        </View>

        {editable && (
          <TouchableOpacity
            style={[styles.editButton, { borderColor: theme.primaryVariant }]}
            onPress={onEdit}
            testID="gasto-edit-button"
            accessibilityRole="button"
            accessibilityLabel="Editar gasto"
          >
            <Text style={[styles.editText, { color: theme.primaryVariant }]}>
              Editar
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: theme.divider }]} />

      {/* Fecha */}
      <Text
        style={[styles.fecha, { color: theme.textSecondary }]}
        testID="gasto-fecha"
      >
        {formatFecha(gasto.fecha)}
      </Text>

      {/* Descripción (solo si existe) */}
      {gasto.descripcion !== undefined && gasto.descripcion.length > 0 && (
        <Text
          style={[styles.descripcion, { color: theme.textSecondary }]}
          testID="gasto-descripcion"
        >
          {gasto.descripcion}
        </Text>
      )}
    </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerLeft: {
    flex: 1,
    marginRight: 8,
  },
  categoria: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  monto: {
    fontSize: 18,
    fontWeight: '800',
  },
  editButton: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  editText: {
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginBottom: 8,
  },
  fecha: {
    fontSize: 13,
    marginBottom: 4,
  },
  descripcion: {
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
  },
});
