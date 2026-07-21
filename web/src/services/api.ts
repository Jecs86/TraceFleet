import axios from 'axios';

// 1. Instancia base de Axios
const api = axios.create({
  // Apuntamos al servidor local por defecto.  baseURL: 'http://localhost:3000'
  // Luego puedes cambiar esto por una variable de entorno como import.meta.env.VITE_API_URL
  baseURL: import.meta.env.VITE_API_URL, 
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Interceptor de Peticiones (Request)
// Aquí inyectamos el token de Supabase automáticamente en cada llamada al backend
api.interceptors.request.use(
  (config) => {
    // TODO: Obtener el token de tu estado global o almacenamiento
    const token = localStorage.getItem('supabase_token'); 
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Interceptor de Respuestas (Response)
// Ideal para manejar errores globales, como cuando el token expira (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('Sesión expirada o no autorizada. Redirigiendo al login...');
      // TODO: Limpiar el estado del usuario y redirigir a /login
    }
    return Promise.reject(error);
  }
);

export default api;