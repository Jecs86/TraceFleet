/**
 * ConfirmDialog — Modal de confirmación con título, mensaje y botones
 *
 * Muestra un diálogo modal con botones "Cancelar" y "Confirmar".
 * Soporta estado de carga (isLoading) para deshabilitar botones
 * durante operaciones asíncronas.
 *
 * Validates: Requirements 3.4, 8.7
 */

import React from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  onCancel,
  onConfirm,
  isLoading = false,
}: ConfirmDialogProps): React.ReactElement {
  const { theme } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      testID="confirm-dialog"
    >
      {/* Backdrop */}
      <View style={styles.backdrop}>
        {/* Dialog card */}
        <View
          style={[
            styles.dialog,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
          testID="confirm-dialog-card"
        >
          {/* Title */}
          <Text
            style={[styles.title, { color: theme.textPrimary }]}
            testID="confirm-dialog-title"
          >
            {title}
          </Text>

          {/* Message */}
          <Text
            style={[styles.message, { color: theme.textSecondary }]}
            testID="confirm-dialog-message"
          >
            {message}
          </Text>

          {/* Buttons row */}
          <View style={[styles.buttonRow, { borderTopColor: theme.divider }]}>
            {/* Cancelar */}
            <TouchableOpacity
              style={[
                styles.button,
                styles.cancelButton,
                { borderColor: theme.border },
              ]}
              onPress={onCancel}
              disabled={isLoading}
              testID="confirm-dialog-cancel"
              accessibilityRole="button"
              accessibilityLabel="Cancelar"
            >
              <Text style={[styles.cancelText, { color: theme.textSecondary }]}>
                Cancelar
              </Text>
            </TouchableOpacity>

            {/* Confirmar */}
            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                { backgroundColor: theme.primary },
                isLoading && styles.disabledButton,
              ]}
              onPress={onConfirm}
              disabled={isLoading}
              testID="confirm-dialog-confirm"
              accessibilityRole="button"
              accessibilityLabel="Confirmar"
            >
              {isLoading ? (
                <ActivityIndicator
                  size="small"
                  color={theme.textOnPrimary}
                  testID="confirm-dialog-loading"
                />
              ) : (
                <Text
                  style={[styles.confirmText, { color: theme.textOnPrimary }]}
                >
                  Confirmar
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  dialog: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderRightWidth: 0.5,
  },
  confirmButton: {
    borderLeftWidth: 0.5,
  },
  disabledButton: {
    opacity: 0.6,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '500',
  },
  confirmText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
