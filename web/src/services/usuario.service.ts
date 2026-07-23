import api from './api';
import { createClient } from '@supabase/supabase-js';

// Inicializamos el cliente de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export type RolUsuario = 'ADMIN' | 'GERENTE' | 'CHOFER';

export interface Usuario {
  id: string;
  authId: string;
  empresaId: string | null;
  nombre: string;
  correo: string;
  rol: RolUsuario;
  estadoActivo: boolean;
}

export interface LoginPayload {
  correo: string;
  contrasena: string;
}

export const usuarioService = {
  login: async (credenciales: LoginPayload) => {
    try {
      // 1. Hablamos directamente con Supabase para el Login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credenciales.correo,
        password: credenciales.contrasena,
      });

      if (error) {
        throw new Error(error.message);
      }

      // 2. Guardamos el token real de Supabase
      if (data.session) {
        localStorage.setItem('tracefleet_token', data.session.access_token);
      }
      
      // 3. (Opcional) Traemos el perfil desde nuestro backend usando el token
      const perfil = await usuarioService.getPerfil();
      
      return {
        usuario: perfil,
        accessToken: data.session.access_token
      };

    } catch (error) {
      console.error("Error en la autenticación:", error);
      throw error;
    }
  },

  getPerfil: async (): Promise<Usuario> => {
    try {
      // Le pegamos al endpoint real que sí existe en NestJS
      const response = await api.get<Usuario>('/auth/me');
      return response.data;
    } catch (error) {
      console.error("Error al obtener el perfil del usuario:", error);
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error al cerrar sesión en Supabase:", error);
    } finally {
      localStorage.removeItem('tracefleet_token');
    }
  }
};