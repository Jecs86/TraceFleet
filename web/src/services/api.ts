import axios from 'axios';

// 1. Instancia base de Axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Interceptor de Peticiones (Request)
api.interceptors.request.use(
  (config) => {
    // CAMBIO AQUÍ: Usamos 'tracefleet_token' para que coincida con el usuarioService
    const token = localStorage.getItem('tracefleet_token'); 
    
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
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('Sesión expirada o no autorizada. Redirigiendo al login...');
      localStorage.removeItem('tracefleet_token'); // Limpiar token si expira
      window.location.href = '/login'; // Forzar redirección
    }
    return Promise.reject(error);
  }
);

export default api;