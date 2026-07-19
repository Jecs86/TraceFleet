import api from './api';

// Interfaz para agrupar los datos matemáticos y de auditoría
export interface AuditoriaCombustible {
  kmRuta: number;
  galones: number;
  valorTotal: number;
  consumoEsperado: number;
  diferenciaGalones: number;
}

// Interfaz principal que une el RegistroCombustible con datos del Usuario y Vehículo
export interface SolicitudCombustibleDetalle {
  id: string;
  choferNombre: string;
  vehiculoPlaca: string;
  
  // URLs de Supabase Storage
  facturaUrl: string | null;
  evidenciaAdicionalUrls?: string[]; // Preparado para futuras múltiples fotos
  notaVozUrl?: string | null;        // Preparado para el mp4 / audio
  
  auditoria: AuditoriaCombustible;
  estado: string; // Ej: 'Revisión Normal', 'Diferencia detectada'
}

export const combustibleDetalleService = {
  /**
   * Obtiene todos los detalles de una solicitud específica de combustible,
   * incluyendo los joins necesarios (Chofer, Vehículo, Liquidación).
   */
  getSolicitudById: async (id: string): Promise<SolicitudCombustibleDetalle> => {
    try {
      const response = await api.get(`/combustible/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener los detalles de la solicitud ${id}:`, error);
      throw error;
    }
  },

  /**
   * Actualiza el estado de la solicitud basándose en la decisión del administrador.
   * Útil para los botones: Aprobar, Pedir Aclaración, Rechazar.
   */
  actualizarEstadoSolicitud: async (id: string, nuevoEstado: 'APROBADA' | 'ACLARACION' | 'RECHAZADA'): Promise<void> => {
    try {
      await api.patch(`/combustible/${id}/estado`, { estado: nuevoEstado });
    } catch (error) {
      console.error(`Error al actualizar el estado de la solicitud ${id}:`, error);
      throw error;
    }
  }
};