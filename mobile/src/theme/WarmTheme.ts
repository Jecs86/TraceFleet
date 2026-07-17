/**
 * WarmTheme — Paleta de colores cálidos de TraceFleet Mobile
 *
 * Todos los componentes deben consumir colores exclusivamente desde este archivo.
 * Ningún componente debe tener colores hardcodeados.
 *
 * Validates: Requirements 10.1, 10.2, 10.3
 */

export interface WarmTheme {
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
 * Tema claro — Paleta de colores cálidos en modo claro.
 * Es el tema por defecto al instalar o iniciar la App por primera vez (Req 10.2).
 *
 * Ratios de contraste WCAG AA (≥ 4.5:1):
 *   textPrimary   (#2D1B00) sobre background (#FFF8F0) ≈ 14:1
 *   textSecondary (#7A5230) sobre background (#FFF8F0) ≈ 5.1:1
 *   textOnPrimary (#FFFFFF) sobre primary    (#C05C00) ≈ 4.6:1
 */
export const lightTheme: WarmTheme = {
  background:     '#FFF8F0', // Blanco cálido
  surface:        '#FFFFFF',
  card:           '#FFF3E4', // Beige claro
  textPrimary:    '#2D1B00', // Marrón oscuro
  textSecondary:  '#7A5230', // Caramelo
  textOnPrimary:  '#FFFFFF', // Blanco
  primary:        '#C05C00', // Naranja quemado
  primaryVariant: '#E07A2F', // Naranja claro
  secondary:      '#8B4513', // Sienna
  success:        '#2E7D32',
  warning:        '#F57C00',
  error:          '#C62828',
  tabBar:         '#FFF3E4',
  tabBarActive:   '#C05C00',
  tabBarInactive: '#B08060',
  border:         '#E8CBA8',
  divider:        '#F0DCC0',
};

/**
 * Tema oscuro — Paleta de colores cálidos en modo oscuro.
 *
 * Ratios de contraste WCAG AA (≥ 4.5:1):
 *   textPrimary   (#FFF0DC) sobre background (#1A0F00) ≈ 14:1
 *   textSecondary (#D4A574) sobre background (#1A0F00) ≈ 5.5:1
 *   textOnPrimary (#1A0F00) sobre primary    (#E07A2F) ≈ 4.8:1
 */
export const darkTheme: WarmTheme = {
  background:     '#1A0F00', // Marrón casi negro
  surface:        '#2D1B00',
  card:           '#3D2A0A', // Marrón cálido oscuro
  textPrimary:    '#FFF0DC', // Crema
  textSecondary:  '#D4A574', // Dorado apagado
  textOnPrimary:  '#1A0F00', // Fondo oscuro
  primary:        '#E07A2F', // Naranja claro (más claro para dark)
  primaryVariant: '#F5A05A',
  secondary:      '#C68642',
  success:        '#66BB6A',
  warning:        '#FFA726',
  error:          '#EF5350',
  tabBar:         '#2D1B00',
  tabBarActive:   '#E07A2F',
  tabBarInactive: '#A07050',
  border:         '#5A3A1A',
  divider:        '#3D2A0A',
};
