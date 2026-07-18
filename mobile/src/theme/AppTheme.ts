/**
 * AppTheme — Paleta de colores de TraceFleet Mobile
 *
 * Derivada del logo oficial de la app:
 *   - Amarillo dorado  #F5B731  (letra "T")
 *   - Azul marino      #1B2A4A  (letra "F")
 *   - Blanco           #FFFFFF  (fondo del logo)
 *
 * Todos los componentes deben consumir colores exclusivamente desde este archivo.
 * Ningún componente debe tener colores hardcodeados.
 *
 * Validates: Requirements 10.1, 10.2, 10.3
 */

export interface AppTheme {
  // Fondos
  background: string;
  surface: string;
  card: string;
  // Textos
  textPrimary: string;
  textSecondary: string;
  textOnPrimary: string;
  // Marca
  primary: string;
  primaryVariant: string;
  secondary: string;
  // Estados
  success: string;
  warning: string;
  error: string;
  // Navegación
  tabBar: string;
  tabBarActive: string;
  tabBarInactive: string;
  // Bordes
  border: string;
  divider: string;
}

/**
 * Tema claro — Basado en la paleta del logo TraceFleet.
 *
 * Ratios de contraste WCAG AA (≥ 4.5:1):
 *   textPrimary   (#0D1826) sobre background (#F5F7FA) ≈ 16:1
 *   textSecondary (#4A5D7A) sobre background (#F5F7FA) ≈ 5.2:1
 *   textOnPrimary (#0D1826) sobre primary    (#F5B731) ≈ 8.1:1
 */
export const lightTheme: AppTheme = {
  background:     '#F5F7FA', // Blanco azulado — limpio y profesional
  surface:        '#FFFFFF',
  card:           '#EEF2F8', // Azul muy claro para tarjetas
  textPrimary:    '#0D1826', // Azul casi negro — máximo contraste
  textSecondary:  '#4A5D7A', // Azul grisáceo
  textOnPrimary:  '#0D1826', // Texto oscuro sobre amarillo primario
  primary:        '#F5B731', // Amarillo dorado del logo (T)
  primaryVariant: '#F9CF72', // Amarillo claro — hover / estados activos
  secondary:      '#1B2A4A', // Azul marino del logo (F)
  success:        '#2E7D32',
  warning:        '#E65100',
  error:          '#C62828',
  tabBar:         '#1B2A4A', // Barra de navegación en azul marino
  tabBarActive:   '#F5B731', // Ícono activo en dorado
  tabBarInactive: '#7A90B0', // Ícono inactivo en azul grisáceo
  border:         '#C8D6E8',
  divider:        '#DDE6F0',
};

/**
 * Tema oscuro — Inversión del esquema del logo.
 *
 * Ratios de contraste WCAG AA (≥ 4.5:1):
 *   textPrimary   (#E8EEF5) sobre background (#0D1826) ≈ 14:1
 *   textSecondary (#7A90B0) sobre background (#0D1826) ≈ 4.6:1
 *   textOnPrimary (#0D1826) sobre primary    (#F5B731) ≈ 8.1:1
 */
export const darkTheme: AppTheme = {
  background:     '#0D1826', // Azul marino muy oscuro
  surface:        '#1B2A4A', // Azul marino del logo
  card:           '#243452', // Azul marino intermedio
  textPrimary:    '#E8EEF5', // Blanco azulado
  textSecondary:  '#7A90B0', // Azul grisáceo
  textOnPrimary:  '#0D1826', // Texto oscuro sobre amarillo primario
  primary:        '#F5B731', // Amarillo dorado igual en dark (mantiene identidad)
  primaryVariant: '#F9CF72', // Amarillo claro
  secondary:      '#4A6FA5', // Azul marino más claro para dark
  success:        '#66BB6A',
  warning:        '#FFA726',
  error:          '#EF5350',
  tabBar:         '#0D1826',
  tabBarActive:   '#F5B731',
  tabBarInactive: '#4A5D7A',
  border:         '#2E4270',
  divider:        '#1E3256',
};
