import api from './api';

// Interfaces basadas en los joins de Prisma
export interface SolicitudCombustible {
  id: string;
  placa: string;
  chofer: string;
  estado: string; // 'Diferencia detectada', 'En Ruta', 'Revisión Normal', 'Aprobada'
  fecha: string;
}

export interface ConsumoVehiculo {
  placa: string;
  galones: number;
}

export interface CombustibleDashboardData {
  tarjetas: {
    pendientes: number;
    auditadas: number;
    anomalias: number;
    aprobadas: number;
  };
  solicitudesRecientes: SolicitudCombustible[];
  consumoPorVehiculo: ConsumoVehiculo[];
}

export const combustibleService = {
  /**
   * Obtiene toda la información necesaria para el minidashboard de combustible.
   */
  getDashboardData: async (): Promise<CombustibleDashboardData> => {
    try {
      const response = await api.get('/combustible/dashboard');
      return response.data;
    } catch (error) {
      console.error("Error al obtener los datos de combustible:", error);
      throw error;
    }
  }
};