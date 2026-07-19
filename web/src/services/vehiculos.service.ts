import api from './api';

// Interface basada exactamente en tu esquema de Prisma
export interface Vehiculo {
  id: string;
  empresaId: string;
  placa: string;
  tipo: string;
  marca?: string; // Opcional según el esquema
  estadoOperativo: boolean;
  imagenUrl?: string; // Opcional, URL de Supabase Storage
}

export const vehiculosService = {
  /**
   * Obtiene la lista de todos los vehículos de la empresa.
   * El backend ya filtra por empresaId gracias al token JWT.
   */
  getVehiculos: async (): Promise<Vehiculo[]> => {
    try {
      const response = await api.get('/vehiculos');
      return response.data;
    } catch (error) {
      console.error("Error al obtener el catálogo de vehículos:", error);
      throw error;
    }
  },

  /**
   * Obtiene los detalles de un vehículo específico por su ID.
   * Útil para cuando hagamos la pantalla de "Vehículo Detalle".
   */
  getVehiculoById: async (id: string): Promise<Vehiculo> => {
    try {
      const response = await api.get(`/vehiculos/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener el vehículo ${id}:`, error);
      throw error;
    }
  },

  // TODO: Implementar más adelante para el botón "+ Nuevo vehículo"
  /*
  crearVehiculo: async (datosVehiculo: Partial<Vehiculo>) => { ... },
  subirImagenVehiculo: async (id: string, file: File) => { ... }
  */
};