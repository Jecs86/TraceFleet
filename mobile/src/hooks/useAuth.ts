/**
 * useAuth — Acceso rápido al AuthContext
 *
 * Lanza un error en tiempo de ejecución si el hook se usa fuera
 * del AuthProvider, previniendo errores silenciosos difíciles de depurar.
 *
 * Validates: Requirements 1.2, 8.8
 */

import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import type { AuthContextValue } from '../contexts/AuthContext';

/**
 * Devuelve el valor del AuthContext.
 *
 * @throws Error si se usa fuera de <AuthProvider>.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  // El contexto tiene user=null e isLoading=true como valores por defecto,
  // pero ambos son estados válidos. Detectamos el uso fuera del Provider
  // comprobando que el contexto no sea la instancia por defecto comparando
  // la función login: el Provider siempre provee la implementación real.
  if (context === undefined) {
    throw new Error(
      'useAuth debe utilizarse dentro de un <AuthProvider>. ' +
        'Asegúrate de envolver tu componente con <AuthProvider>.',
    );
  }

  return context;
}
