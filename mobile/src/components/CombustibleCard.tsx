/**
 * CombustibleCard — Tarjeta de resumen para un registro de combustible
 *
 * Muestra tipo de combustible, galones, costo total, estación y fecha.
 * El botón de edición solo se renderiza cuando editable === true.
 *
 * Validates: Requirements 4.3, 4.7, 4.9, 10.3
 */

import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { RegistroCombustible } from '../types/api';
import { useTheme } from '../hooks/useTheme';

interface CombustibleCardProps {
  registro: RegistroCombustible;
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

export function CombustibleCard({
  registro,
  editable = false,
  onEdit,
}: CombustibleCardProps): React.ReactElement {
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
      testID={`combustible-card-${registro.id}`}
    >
      {/* Header: tipo + edit button */}
      <View style={styles.header}>
        <View
          style={[
            styles.tipoBadge,
            { backgroundColor: theme.primary + '26', borderColor: theme.primary },
          ]}
          testID="combustible-tipo"
        >
          <Text style={[styles.tipoText, { color: theme.primary }]}>
            {registro.tipoCombustible}
          </Text>
        </View>

        {editable && (
          <TouchableOpacity
            style={[styles.editButton, { borderColor: theme.primaryVariant }]}
            onPress={onEdit}
            testID="combustible-edit-button"
            accessibilityRole="button"
            accessibilityLabel="Editar registro de combustible"
          >
            <Text style={[styles.editText, { color: theme.primaryVariant }]}>
              Editar
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Data rows */}
      <View style={[styles.divider, { backgroundColor: theme.divider }]} />

      <View style={styles.dataGrid}>
        <DataRow
          label="Galones"
          value={`${registro.galones} gal`}
          theme={theme}
          testID="combustible-galones"
        />
        <DataRow
          label="Costo total"
          value={`$${registro.costoTotal.toFixed(2)}`}
          theme={theme}
          testID="combustible-costo"
        />
        <DataRow
          label="Estación"
          value={registro.estacion ?? '—'}
          theme={theme}
          testID="combustible-estacion"
        />
        <DataRow
          label="Fecha"
          value={formatFecha(registro.fecha)}
          theme={theme}
          testID="combustible-fecha"
        />
      </View>
    </View>
  );
}

// ─── Internal helper ─────────────────────────────────────────────────────────

interface DataRowProps {
  label: string;
  value: string;
  theme: import('../theme/WarmTheme').WarmTheme;
  testID?: string;
}

function DataRow({ label, value, theme, testID }: DataRowProps): React.ReactElement {
  return (
    <View style={styles.dataRow}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
      <Text style={[styles.value, { color: theme.textPrimary }]} testID={testID}>
        {value}
      </Text>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  tipoBadge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tipoText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  editButton: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  editText: {
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginBottom: 10,
  },
  dataGrid: {
    gap: 6,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
  },
});
