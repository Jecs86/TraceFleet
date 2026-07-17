/**
 * useTheme — Acceso rápido al ThemeContext
 *
 * Lanza un error en tiempo de ejecución si el hook se usa fuera
 * del ThemeProvider, previniendo errores silenciosos difíciles de depurar.
 *
 * Validates: Requirements 8.2, 10.3
 */

import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import type { ThemeContextValue } from '../contexts/ThemeContext';

/**
 * Devuelve el valor del ThemeContext, incluyendo el objeto `theme`
 * con los tokens de color del modo activo (light o dark).
 *
 * @throws Error si se usa fuera de <ThemeProvider>.
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error(
      'useTheme debe utilizarse dentro de un <ThemeProvider>. ' +
        'Asegúrate de envolver tu componente con <ThemeProvider>.',
    );
  }

  return context;
}
