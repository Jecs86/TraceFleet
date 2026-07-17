/**
 * GastoFormScreen — Formulario de creación y edición de gastos extra
 *
 * Modos:
 *   - create: crea un nuevo gasto vinculado al viaje activo (Req 7.2)
 *   - edit:   carga el gasto existente (filtrando GET /gastos por id) y permite editarlo (Req 7.3)
 *
 * Campos controlados:
 *   - categoria    texto requerido; sugerencias: "Peaje", "Alimentación", "Estacionamiento"
 *   - monto        number > 0 (requerido)
 *   - descripcion  texto opcional
 *   - fecha        string ISO YYYY-MM-DD, default: hoy
 *
 * Al guardar:
 *   - create → POST /gastos  (Req 7.2)
 *   - edit   → PATCH /gastos/:id  (Req 7.3)
 *   - éxito  → navega atrás + snackbar "Gasto guardado correctamente" (Req 7.4)
 *   - error  → muestra mensaje sin limpiar campos (Req 7.6)
 *
 * Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Snackbar } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CreateGastoDto } from '../types/api';
import type { GastosStackParamList } from '../navigation/types';
import { ApiService } from '../services/ApiService';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { useActiveViaje } from '../hooks/useActiveViaje';

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = NativeStackScreenProps<GastosStackParamList, 'GastoForm'>;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GastoFormFields {
  categoria: string;
  monto: string;
  descripcion: string;
  fecha: string;
}

export interface GastoFormErrors {
  categoria?: string;
  monto?: string;
  fecha?: string;
}

// ─── Category suggestions ─────────────────────────────────────────────────────

const CATEGORIA_SUGGESTIONS = ['Peaje', 'Alimentación', 'Estacionamiento'];

// ─── Pure validation function (exported for testing) ─────────────────────────

/**
 * Validates the gasto form fields.
 * Returns an object with field-level error messages.
 * An empty object means the form is valid.
 *
 * Validates: Requirements 7.1, 7.5
 */
export function validateGastoForm(fields: GastoFormFields): GastoFormErrors {
  const errors: GastoFormErrors = {};

  // categoria — requerida (no vacía ni solo espacios)
  if (!fields.categoria.trim()) {
    errors.categoria = 'La categoría es requerida';
  }

  // monto — número > 0
  const monto = parseFloat(fields.monto);
  if (!fields.monto.trim() || isNaN(monto) || monto <= 0) {
    errors.monto = 'Ingresa un monto mayor a 0';
  }

  // fecha — requerida y con formato básico YYYY-MM-DD
  if (!fields.fecha.trim()) {
    errors.fecha = 'La fecha es requerida';
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(fields.fecha.trim())) {
    errors.fecha = 'Usa el formato YYYY-MM-DD';
  }

  return errors;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

/** Retorna la fecha de hoy en formato ISO YYYY-MM-DD */
function todayISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function GastoFormScreen({
  route,
  navigation,
}: Props): React.ReactElement {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { activeViaje } = useActiveViaje();

  const params = route.params;
  const mode = params.mode;
  const gastoId = mode === 'edit' ? params.gastoId : undefined;

  // ─── State ──────────────────────────────────────────────────────────────────

  const [fields, setFields] = useState<GastoFormFields>({
    categoria: '',
    monto: '',
    descripcion: '',
    fecha: todayISO(),
  });
  const [fieldErrors, setFieldErrors] = useState<GastoFormErrors>({});
  const [isLoadingData, setIsLoadingData] = useState(mode === 'edit');
  const [isSaving, setIsSaving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  // ─── Load existing data in edit mode ────────────────────────────────────────

  const loadGasto = useCallback(async (): Promise<void> => {
    if (mode !== 'edit' || !gastoId) return;

    setIsLoadingData(true);
    try {
      const all = await ApiService.getGastos();
      const found = all.find((g) => g.id === gastoId);
      if (found) {
        setFields({
          categoria: found.categoria,
          monto: String(found.monto),
          descripcion: found.descripcion ?? '',
          fecha: found.fecha.substring(0, 10), // YYYY-MM-DD
        });
      }
    } catch {
      setApiError('No se pudo cargar el gasto. Intenta de nuevo.');
    } finally {
      setIsLoadingData(false);
    }
  }, [mode, gastoId]);

  useEffect(() => {
    void loadGasto();
  }, [loadGasto]);

  // ─── Field helpers ──────────────────────────────────────────────────────────

  const setField = <K extends keyof GastoFormFields>(
    key: K,
    value: GastoFormFields[K],
  ): void => {
    setFields((prev) => ({ ...prev, [key]: value }));
    // Clear the error for this field as the user starts editing
    if (fieldErrors[key as keyof GastoFormErrors]) {
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  // ─── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async (): Promise<void> => {
    // Validate locally before calling the API (Req 7.5)
    const errors = validateGastoForm(fields);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSaving(true);
    setApiError(null);

    try {
      if (mode === 'create') {
        if (!activeViaje) {
          setApiError('No hay un viaje activo. No puedes registrar gastos.');
          return;
        }
        if (!user) {
          setApiError('No hay sesión activa.');
          return;
        }

        const payload: CreateGastoDto = {
          vehiculoId: activeViaje.vehiculoId,
          choferId: user.id,
          viajeId: activeViaje.id,
          categoria: fields.categoria.trim(),
          monto: parseFloat(fields.monto),
          descripcion: fields.descripcion.trim() || undefined,
          fecha: fields.fecha.trim(),
        };

        await ApiService.createGasto(payload);
      } else {
        if (!gastoId) return;

        const payload: Partial<CreateGastoDto> = {
          categoria: fields.categoria.trim(),
          monto: parseFloat(fields.monto),
          descripcion: fields.descripcion.trim() || undefined,
          fecha: fields.fecha.trim(),
        };

        await ApiService.updateGasto(gastoId, payload);
      }

      // Success: show snackbar, then navigate back (Req 7.4)
      setSnackbarVisible(true);
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch {
      // Req 7.6 — Show error without clearing fields
      setApiError('No se pudo guardar el gasto. Intenta de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Render: loading state ───────────────────────────────────────────────────

  if (isLoadingData) {
    return (
      <View
        style={[styles.centered, { backgroundColor: theme.background }]}
        testID="form-loading"
      >
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  // ─── Render: form ────────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      testID="gasto-form-screen"
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* API error banner — preserved fields (Req 7.6) */}
        {apiError !== null && (
          <View
            style={[
              styles.apiErrorBanner,
              {
                backgroundColor: theme.error + '18',
                borderColor: theme.error,
              },
            ]}
            testID="api-error-banner"
          >
            <Text style={[styles.apiErrorText, { color: theme.error }]}>
              {apiError}
            </Text>
          </View>
        )}

        {/* ── Categoría ── */}
        <Text style={[styles.label, { color: theme.textPrimary }]}>
          Categoría *
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.surface,
              borderColor: fieldErrors.categoria ? theme.error : theme.border,
              color: theme.textPrimary,
            },
          ]}
          value={fields.categoria}
          onChangeText={(v) => setField('categoria', v)}
          placeholder="Ej: Peaje"
          placeholderTextColor={theme.textSecondary}
          testID="input-categoria"
          accessibilityLabel="Categoría del gasto"
        />
        {fieldErrors.categoria !== undefined && (
          <Text
            style={[styles.errorText, { color: theme.error }]}
            testID="error-categoria"
          >
            {fieldErrors.categoria}
          </Text>
        )}

        {/* ── Category suggestions (Req 7.1) ── */}
        <View style={styles.suggestionsRow} testID="categoria-suggestions">
          {CATEGORIA_SUGGESTIONS.map((sugerencia) => (
            <TouchableOpacity
              key={sugerencia}
              style={[
                styles.suggestionChip,
                {
                  borderColor:
                    fields.categoria === sugerencia
                      ? theme.primary
                      : theme.border,
                  backgroundColor:
                    fields.categoria === sugerencia
                      ? theme.primary + '22'
                      : theme.surface,
                },
              ]}
              onPress={() => setField('categoria', sugerencia)}
              testID={`suggestion-${sugerencia}`}
              accessibilityRole="button"
              accessibilityLabel={`Seleccionar categoría ${sugerencia}`}
            >
              <Text
                style={[
                  styles.suggestionText,
                  {
                    color:
                      fields.categoria === sugerencia
                        ? theme.primary
                        : theme.textSecondary,
                    fontWeight:
                      fields.categoria === sugerencia ? '700' : '400',
                  },
                ]}
              >
                {sugerencia}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Monto ── */}
        <Text style={[styles.label, { color: theme.textPrimary }]}>
          Monto ($) *
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.surface,
              borderColor: fieldErrors.monto ? theme.error : theme.border,
              color: theme.textPrimary,
            },
          ]}
          value={fields.monto}
          onChangeText={(v) => setField('monto', v)}
          placeholder="Ej: 5.50"
          placeholderTextColor={theme.textSecondary}
          keyboardType="decimal-pad"
          testID="input-monto"
          accessibilityLabel="Monto del gasto en dólares"
        />
        {fieldErrors.monto !== undefined && (
          <Text
            style={[styles.errorText, { color: theme.error }]}
            testID="error-monto"
          >
            {fieldErrors.monto}
          </Text>
        )}

        {/* ── Descripción (opcional) ── */}
        <Text style={[styles.label, { color: theme.textPrimary }]}>
          Descripción (opcional)
        </Text>
        <TextInput
          style={[
            styles.input,
            styles.textArea,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              color: theme.textPrimary,
            },
          ]}
          value={fields.descripcion}
          onChangeText={(v) => setField('descripcion', v)}
          placeholder="Ej: Peaje en la Ruta E35"
          placeholderTextColor={theme.textSecondary}
          multiline
          numberOfLines={3}
          testID="input-descripcion"
          accessibilityLabel="Descripción opcional del gasto"
        />

        {/* ── Fecha ── */}
        <Text style={[styles.label, { color: theme.textPrimary }]}>
          Fecha *
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.surface,
              borderColor: fieldErrors.fecha ? theme.error : theme.border,
              color: theme.textPrimary,
            },
          ]}
          value={fields.fecha}
          onChangeText={(v) => setField('fecha', v)}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={theme.textSecondary}
          testID="input-fecha"
          accessibilityLabel="Fecha del gasto en formato YYYY-MM-DD"
        />
        {fieldErrors.fecha !== undefined && (
          <Text
            style={[styles.errorText, { color: theme.error }]}
            testID="error-fecha"
          >
            {fieldErrors.fecha}
          </Text>
        )}

        {/* ── Submit button ── */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            {
              backgroundColor: isSaving ? theme.border : theme.primary,
            },
          ]}
          onPress={() => void handleSubmit()}
          disabled={isSaving}
          testID="submit-button"
          accessibilityRole="button"
          accessibilityLabel="Guardar gasto"
          accessibilityState={{ disabled: isSaving }}
        >
          {isSaving ? (
            <ActivityIndicator
              size="small"
              color={theme.textOnPrimary}
              testID="saving-indicator"
            />
          ) : (
            <Text style={[styles.submitText, { color: theme.textOnPrimary }]}>
              {mode === 'create' ? 'Guardar Gasto' : 'Actualizar Gasto'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Snackbar de éxito (Req 7.4) */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{ backgroundColor: theme.success }}
        testID="success-snackbar"
      >
        <Text style={{ color: '#FFFFFF' }}>Gasto guardado correctamente</Text>
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
  },
  apiErrorBanner: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  apiErrorText: {
    fontSize: 14,
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  suggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  suggestionChip: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  suggestionText: {
    fontSize: 13,
  },
  submitButton: {
    marginTop: 28,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitText: {
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 24,
  },
});

export default GastoFormScreen;
