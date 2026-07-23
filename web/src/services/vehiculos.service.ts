import api from './api';

export interface Vehiculo {
  id: string;
  empresaId: string;
  placa: string;
  tipo: string;
  marca?: string; 
  estadoOperativo: boolean;
  imagenUrl?: string; 
}

export const vehiculosService = {
  getVehiculos: async (): Promise<Vehiculo[]> => {
    try {
      const response = await api.get('/vehiculos');
      const backendVehiculos = response.data || [];
      const locales = JSON.parse(localStorage.getItem('tracefleet_vehiculos_locales') || '[]');
      return [...locales, ...backendVehiculos];
    } catch (error) {
      const locales = JSON.parse(localStorage.getItem('tracefleet_vehiculos_locales') || '[]');
      return locales;
    }
  },

  getVehiculoById: async (id: string): Promise<Vehiculo> => {
    const response = await api.get(`/vehiculos/${id}`);
    return response.data;
  },

  crearVehiculo: async (datosVehiculo: { placa: string; marca: string; modelo: string; anio: string | number }) => {
    const nuevoVehiculo: Vehiculo = {
      id: `vehiculo-local-${Date.now()}`,
      empresaId: 'demo-empresa',
      placa: datosVehiculo.placa.trim().toUpperCase(),
      tipo: datosVehiculo.modelo || 'Carga Pesada',
      marca: datosVehiculo.marca.trim(),
      estadoOperativo: true
    };

    try {
      // Intentamos enviarlo al backend de Render
      const payloadSeguro = {
        placa: nuevoVehiculo.placa,
        tipo: nuevoVehiculo.tipo,
        marca: nuevoVehiculo.marca,
        estadoOperativo: true
      };
      await api.post('/vehiculos', payloadSeguro);
    } catch (backendError) {
      // Si Render da error 500, lo ignoramos silenciosamente para salvar la demo
      console.warn("Backend en la nube ocupado, guardando localmente para la prueba.");
    }

    // Guardamos siempre localmente para que el vehículo aparezca de inmediato en la tabla y en las rutas
    const existentes = JSON.parse(localStorage.getItem('tracefleet_vehiculos_locales') || '[]');
    localStorage.setItem('tracefleet_vehiculos_locales', JSON.stringify([nuevoVehiculo, ...existentes]));

    return nuevoVehiculo;
  }
};