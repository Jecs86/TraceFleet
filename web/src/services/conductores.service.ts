import api from './api';

// ==========================================
// INTERFACES PARA LAS MÉTRICAS SUPERIORES
// ==========================================
export interface MetricasConductores {
  totalChoferes: number;
  enRuta: number;
  descansando: number;
  alertasActivas: number;
}

// ==========================================
// INTERFACES PARA LA TABLA DIRECTORIO
// ==========================================
export interface ConductorListado {
  id: string;
  nombre: string;
  // Nota: Este campo deberá agregarse al modelo Usuario o PerfilChofer en el futuro
  licencia: string; 
  vehiculoAsignado: string | null; // Placa del vehículo, null si está descansando
  estado: string; // Ej: 'En Ruta', 'Descanso', 'Precaución Requerida', 'Mantenimiento'
}

// ==========================================
// INTERFAZ PRINCIPAL DEL DASHBOARD
// ==========================================
export interface ConductoresDashboardData {
  metricas: MetricasConductores;
  directorio: ConductorListado[];
}

export const conductoresService = {
  /**
   * Obtiene la información agregada para la vista principal de Gestión de Conductores.
   * Filtra internamente a los usuarios con rol CHOFER y cruza datos con sus viajes activos.
   */
  getDashboardData: async (): Promise<ConductoresDashboardData> => {
    try {
      const response = await api.get('/conductores/dashboard');
      return response.data;
    } catch (error) {
      console.error("Error al cargar los datos de conductores:", error);
      throw error;
    }
  }
};