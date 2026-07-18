/**
 * Cliente Supabase para TraceFleet Mobile
 *
 * Inicializa el cliente de Supabase usando las variables de entorno públicas
 * de Expo. Solo se usa la anon key — el JWT real se obtiene mediante
 * supabase.auth.signInWithPassword() en AuthService.
 *
 * Validates: Requirements 1.2
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Las variables de entorno EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY son requeridas.',
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
