import api from './api';

// ==========================================
// INTERFACES BASADAS EN PRISMA
// ==========================================
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

// ==========================================
// INTERFACES DE PAYLOADS Y RESPUESTAS
// ==========================================
export interface LoginPayload {
  correo: string; // Aunque el UI diga "Nombre", enviamos el correo para Supabase
  contrasena: string;
}

export interface AuthResponse {
  usuario: Usuario;
  accessToken: string; // El JWT devuelto por Supabase/NestJS
  refreshToken?: string;
}

export const usuarioService = {
  /**
   * Inicia sesión enviando las credenciales al backend.
   * El backend verificará con Supabase y devolverá el usuario y el token.
   */
  login: async (credenciales: LoginPayload): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credenciales);
      
      // Guardamos el token en localStorage o sessionStorage automáticamente
      if (response.data.accessToken) {
        localStorage.setItem('tracefleet_token', response.data.accessToken);
      }
      
      return response.data;
    } catch (error) {
      console.error("Error en la autenticación:", error);
      throw error;
    }
  },

  /**
   * Obtiene el perfil del usuario actualmente autenticado (usando el token almacenado).
   */
  getPerfil: async (): Promise<Usuario> => {
    try {
      const response = await api.get<Usuario>('/usuarios/perfil');
      return response.data;
    } catch (error) {
      console.error("Error al obtener el perfil del usuario:", error);
      throw error;
    }
  },

  /**
   * Cierra la sesión local y opcionalmente notifica al backend.
   */
  logout: async (): Promise<void> => {
    try {
      // Opcional: Notificar al backend para invalidar el refresh token
      await api.post('/auth/logout');
    } catch (error) {
      console.error("Error al notificar logout al servidor:", error);
    } finally {
      // Siempre limpiamos el cliente, incluso si falla la llamada al servidor
      localStorage.removeItem('tracefleet_token');
      // Aquí también podrías limpiar estado global si usas Zustand o Redux
    }
  }
};