/**
 * CombustibleFormScreen — Formulario de creación y edición de registros de combustible
 *
 * Modos:
 *   - create: crea un nuevo registro vinculado al viaje activo (Req 5.2)
 *   - edit:   carga el registro existente (filtrando GET /combustible por id) y permite editarlo (Req 5.3)
 *
 * Campos controlados:
 *   - tipoCombustible  ECO | SUPER | DIESEL  (selector de 3 botones)
 *   - galones          number > 0
 *   - costoTotal       number > 0
 *   - distancia        number > 0
 *   - estacion         texto opcional
 *   - fecha            string ISO YYYY-MM-DD, default: hoy
 *
 * Al guardar:
 *   - create → POST /combustible  (Req 5.4)
 *   - edit   → PATCH /combustible/:id  (Req 5.5)
 *   - éxito  → navega atrás + snackbar "Registro guardado correctamente" (Req 5.6)
 *   - error  → muestra mensaje sin limpiar campos (Req 5.7)
 *
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7
 *
 * Bug 5 fix — fecha field replaced with native DateTimePicker
 * Dependency: @react-native-community/datetimepicker@9.1.0
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
import DateTimePicker from '@react-native-community/datetimepicker';
import { Snackbar } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { TipoCombustible, CreateCombustibleDto } from '../types/api';
import type { CombustibleStackParamList } from '../navigation/types';
import { ApiService } from '../services/ApiService';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { useActiveViaje } from '../hooks/useActiveViaje';
import { toISODate, formatDateDisplay } from '../utils/dateHelpers';

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = NativeStackScreenProps<CombustibleStackParamList, 'CombustibleForm'>;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CombustibleFormFields {
  tipoCombustible: TipoCombustible | '';
  galones: string;
  costoTotal: string;
  distancia: string;
  estacion: string;
  fecha: string;
}

export interface CombustibleFormErrors {
  tipoCombustible?: string;
  galones?: string;
  costoTotal?: string;
  distancia?: string;
  fecha?: string;
}

// ─── Pure validation function (exported for testing) ─────────────────────────

/**
 * Validates the combustible form fields.
 * Returns an object with field-level error messages.
 * An empty object means the form is valid.
 *
 * Validates: Requirements 5.1
 */
export function validateCombustibleForm(
  fields: CombustibleFormFields,
): CombustibleFormErrors {
  const errors: CombustibleFormErrors = {};

  // tipoCombustible — requerido
  if (!fields.tipoCombustible) {
    errors.tipoCombustible = 'Selecciona el tipo de combustible';
  }

  // galones — número > 0
  const galones = parseFloat(fields.galones);
  if (!fields.galones.trim() || isNaN(galones) || galones <= 0) {
    errors.galones = 'Ingresa una cantidad de galones mayor a 0';
  }

  // costoTotal — número > 0
  const costoTotal = parseFloat(fields.costoTotal);
  if (!fields.costoTotal.trim() || isNaN(costoTotal) || costoTotal <= 0) {
    errors.costoTotal = 'Ingresa un costo total mayor a 0';
  }

  // distancia — número > 0
  const distancia = parseFloat(fields.distancia);
  if (!fields.distancia.trim() || isNaN(distancia) || distancia <= 0) {
    errors.distancia = 'Ingresa una distancia (odómetro) mayor a 0';
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

const TIPOS: TipoCombustible[] = ['ECO', 'SUPER', 'DIESEL'];

// ─── Component ────────────────────────────────────────────────────────────────

export function CombustibleFormScreen({
  route,
  navigation,
}: Props): React.ReactElement {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { activeViaje } = useActiveViaje();

  const params = route.params;
  const mode = params.mode;
  const registroId = mode === 'edit' ? params.registroId : undefined;

  // ─── State ──────────────────────────────────────────────────────────────────

  const [fields, setFields] = useState<CombustibleFormFields>({
    tipoCombustible: '',
    galones: '',
    costoTotal: '',
    distancia: '',
    estacion: '',
    fecha: todayISO(),
  });
  const [fieldErrors, setFieldErrors] = useState<CombustibleFormErrors>({});
  const [isLoadingData, setIsLoadingData] = useState(mode === 'edit');
  const [isSaving, setIsSaving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  // ─── DateTimePicker state (Bug 5 fix — Req 2.17, 2.18, 2.19) ────────────────
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(new Date());

  // ─── Load existing data in edit mode ────────────────────────────────────────

  const loadRegistro = useCallback(async (): Promise<void> => {
    if (mode !== 'edit' || !registroId) return;

    setIsLoadingData(true);
    try {
      const all = await ApiService.getCombustible();
      const found = all.find((r) => r.id === registroId);
      if (found) {
        setFields({
          tipoCombustible: found.tipoCombustible,
          galones: String(found.galones),
          costoTotal: String(found.costoTotal),
          distancia: String(found.distancia),
          estacion: found.estacion ?? '',
          fecha: found.fecha.substring(0, 10), // YYYY-MM-DD
        });
      }
    } catch {
      setApiError('No se pudo cargar el registro. Intenta de nuevo.');
    } finally {
      setIsLoadingData(false);
    }
  }, [mode, registroId]);

  useEffect(() => {
    void loadRegistro();
  }, [loadRegistro]);

  // ─── Field helpers ──────────────────────────────────────────────────────────

  const setField = <K extends keyof CombustibleFormFields>(
    key: K,
    value: CombustibleFormFields[K],
  ): void => {
    setFields((prev) => ({ ...prev, [key]: value }));
    // Clear the error for this field as the user starts editing
    if (fieldErrors[key as keyof CombustibleFormErrors]) {
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  // ─── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async (): Promise<void> => {
    // Validate
    const errors = validateCombustibleForm(fields);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSaving(true);
    setApiError(null);

    try {
      if (mode === 'create') {
        if (!activeViaje) {
          setApiError('No hay un viaje activo. No puedes registrar combustible.');
          return;
        }
        if (!user) {
          setApiError('No hay sesión activa.');
          return;
        }

        const payload: CreateCombustibleDto = {
          vehiculoId: activeViaje.vehiculoId,
          choferId: user.id,
          viajeId: activeViaje.id,
          tipoCombustible: fields.tipoCombustible as TipoCombustible,
          galones: parseFloat(fields.galones),
          costoTotal: parseFloat(fields.costoTotal),
          distancia: parseFloat(fields.distancia),
          estacion: fields.estacion.trim() || undefined,
          fecha: fields.fecha.trim(),
        };

        await ApiService.createCombustible(payload);
      } else {
        if (!registroId) return;

        const payload: Partial<CreateCombustibleDto> = {
          tipoCombustible: fields.tipoCombustible as TipoCombustible,
          galones: parseFloat(fields.galones),
          costoTotal: parseFloat(fields.costoTotal),
          distancia: parseFloat(fields.distancia),
          estacion: fields.estacion.trim() || undefined,
          fecha: fields.fecha.trim(),
        };

        await ApiService.updateCombustible(registroId, payload);
      }

      // Success: navigate back and show snackbar
      setSnackbarVisible(true);
      // Give the snackbar a moment to appear, then go back
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch {
      setApiError('Error al guardar el registro. Verifica los datos e intenta de nuevo.');
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
      testID="combustible-form-screen"
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* API error banner */}
        {apiError !== null && (
          <View
            style={[styles.apiErrorBanner, { backgroundColor: theme.error + '18', borderColor: theme.error }]}
            testID="api-error-banner"
          >
            <Text style={[styles.apiErrorText, { color: theme.error }]}>
              {apiError}
            </Text>
          </View>
        )}

        {/* ── Tipo de Combustible selector ── */}
        <Text style={[styles.label, { color: theme.textPrimary }]}>
          Tipo de Combustible *
        </Text>
        <View style={styles.tipoRow} testID="tipo-combustible-selector">
          {TIPOS.map((tipo) => {
            const isSelected = fields.tipoCombustible === tipo;
            return (
              <TouchableOpacity
                key={tipo}
                style={[
                  styles.tipoButton,
                  {
                    borderColor: isSelected ? theme.primary : theme.border,
                    backgroundColor: isSelected
                      ? theme.primary + '22'
                      : theme.surface,
                  },
                ]}
                onPress={() => setField('tipoCombustible', tipo)}
                testID={`tipo-${tipo.toLowerCase()}`}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`Tipo de combustible ${tipo}`}
              >
                <Text
                  style={[
                    styles.tipoButtonText,
                    {
                      color: isSelected ? theme.primary : theme.textSecondary,
                      fontWeight: isSelected ? '700' : '400',
                    },
                  ]}
                >
                  {tipo}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {fieldErrors.tipoCombustible !== undefined && (
          <Text style={[styles.errorText, { color: theme.error }]} testID="error-tipo">
            {fieldErrors.tipoCombustible}
          </Text>
        )}

        {/* ── Galones ── */}
        <Text style={[styles.label, { color: theme.textPrimary }]}>
          Galones *
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.surface,
              borderColor: fieldErrors.galones ? theme.error : theme.border,
              color: theme.textPrimary,
            },
          ]}
          value={fields.galones}
          onChangeText={(v) => setField('galones', v)}
          placeholder="Ej: 12.5"
          placeholderTextColor={theme.textSecondary}
          keyboardType="decimal-pad"
          testID="input-galones"
          accessibilityLabel="Galones"
        />
        {fieldErrors.galones !== undefined && (
          <Text style={[styles.errorText, { color: theme.error }]} testID="error-galones">
            {fieldErrors.galones}
          </Text>
        )}

        {/* ── Costo Total ── */}
        <Text style={[styles.label, { color: theme.textPrimary }]}>
          Costo Total ($) *
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.surface,
              borderColor: fieldErrors.costoTotal ? theme.error : theme.border,
              color: theme.textPrimary,
            },
          ]}
          value={fields.costoTotal}
          onChangeText={(v) => setField('costoTotal', v)}
          placeholder="Ej: 45.80"
          placeholderTextColor={theme.textSecondary}
          keyboardType="decimal-pad"
          testID="input-costo-total"
          accessibilityLabel="Costo total en dólares"
        />
        {fieldErrors.costoTotal !== undefined && (
          <Text style={[styles.errorText, { color: theme.error }]} testID="error-costo-total">
            {fieldErrors.costoTotal}
          </Text>
        )}

        {/* ── Distancia (odómetro) ── */}
        <Text style={[styles.label, { color: theme.textPrimary }]}>
          Distancia / Odómetro (km) *
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.surface,
              borderColor: fieldErrors.distancia ? theme.error : theme.border,
              color: theme.textPrimary,
            },
          ]}
          value={fields.distancia}
          onChangeText={(v) => setField('distancia', v)}
          placeholder="Ej: 15230"
          placeholderTextColor={theme.textSecondary}
          keyboardType="decimal-pad"
          testID="input-distancia"
          accessibilityLabel="Lectura del odómetro en kilómetros"
        />
        {fieldErrors.distancia !== undefined && (
          <Text style={[styles.errorText, { color: theme.error }]} testID="error-distancia">
            {fieldErrors.distancia}
          </Text>
        )}

        {/* ── Estación (opcional) ── */}
        <Text style={[styles.label, { color: theme.textPrimary }]}>
          Estación (opcional)
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              color: theme.textPrimary,
            },
          ]}
          value={fields.estacion}
          onChangeText={(v) => setField('estacion', v)}
          placeholder="Ej: Petroecuador Norte"
          placeholderTextColor={theme.textSecondary}
          testID="input-estacion"
          accessibilityLabel="Nombre de la estación de combustible"
        />

        {/* ── Fecha ── */}
        <Text style={[styles.label, { color: theme.textPrimary }]}>
          Fecha *
        </Text>
        {/* Bug 5 fix — tappable field opens native DateTimePicker (Req 2.17, 2.18, 2.19) */}
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          testID="fecha-field-touchable"
          accessibilityLabel="Seleccionar fecha"
          accessibilityRole="button"
        >
          <View
            style={[
              styles.input,
              {
                backgroundColor: theme.surface,
                borderColor: fieldErrors.fecha ? theme.error : theme.border,
                justifyContent: 'center',
              },
            ]}
          >
            <Text
              style={{
                color: fields.fecha ? theme.textPrimary : theme.textSecondary,
                fontSize: 15,
              }}
            >
              {fields.fecha ? formatDateDisplay(fields.fecha) : 'Seleccionar fecha'}
            </Text>
          </View>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={pickerDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onValueChange={(event, selectedDate) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (selectedDate) {
                setPickerDate(selectedDate);
                setField('fecha', toISODate(selectedDate)); // stores YYYY-MM-DD
              }
            }}
            onDismiss={() => setShowDatePicker(false)}
          />
        )}
        {fieldErrors.fecha !== undefined && (
          <Text style={[styles.errorText, { color: theme.error }]} testID="error-fecha">
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
          accessibilityLabel="Guardar registro de combustible"
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
              {mode === 'create' ? 'Guardar Registro' : 'Actualizar Registro'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Snackbar de éxito (Req 5.6) */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{ backgroundColor: theme.success }}
        testID="success-snackbar"
      >
        <Text style={{ color: '#FFFFFF' }}>Registro guardado correctamente</Text>
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
  tipoRow: {
    flexDirection: 'row',
    gap: 10,
  },
  tipoButton: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tipoButtonText: {
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
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

export default CombustibleFormScreen;
