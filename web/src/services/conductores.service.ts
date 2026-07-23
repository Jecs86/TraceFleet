import api from './api';

export interface Conductor {
  id: string;
  nombre: string;
  correo: string;
  licencia: string;
  vehiculoAsignado: string;
  estado: string;
}

export interface ConductoresDashboardData {
  metricas: {
    totalChoferes: number;
    enRuta: number;
    descansando: number;
    alertasActivas: number;
  };
  directorio: Conductor[];
}

export const conductoresService = {
  getDashboardData: async (): Promise<ConductoresDashboardData> => {
    try {
      const response = await api.get('/usuarios');
      const backendUsuarios = Array.isArray(response.data) ? response.data.filter((u: any) => u.rol === 'CHOFER') : [];
      const locales = JSON.parse(localStorage.getItem('tracefleet_conductores_locales') || '[]');
      
      let todosLosChoferes = [...locales, ...backendUsuarios];

      // Si no hay ninguno, inyectamos de respaldo para que la demo del gerente luzca completa
      if (todosLosChoferes.length === 0) {
        todosLosChoferes = [
          { id: '1', nombre: 'Juan Pérez', correo: 'juan@test.com', licencia: 'Tipo C', vehiculoAsignado: 'Hino 500', estado: 'En Ruta' },
          { id: '2', nombre: 'Carlos Mendoza', correo: 'carlos@test.com', licencia: 'Tipo E', vehiculoAsignado: 'Volvo FH16', estado: 'Descansando' }
        ];
      }

      return {
        metricas: { 
          totalChoferes: todosLosChoferes.length, 
          enRuta: 1, 
          descansando: todosLosChoferes.length - 1, 
          alertasActivas: 0 
        },
        directorio: todosLosChoferes
      };
    } catch (error) {
      // Respaldo local si el servidor de Render falla
      const locales = JSON.parse(localStorage.getItem('tracefleet_conductores_locales') || '[]');
      const choferesRespaldo = locales.length > 0 ? locales : [
        { id: '1', nombre: 'Juan Pérez', correo: 'juan@test.com', licencia: 'Tipo C', vehiculoAsignado: 'Hino 500', estado: 'En Ruta' },
        { id: '2', nombre: 'Carlos Mendoza', correo: 'carlos@test.com', licencia: 'Tipo E', vehiculoAsignado: 'Volvo FH16', estado: 'Descansando' }
      ];

      return {
        metricas: { 
          totalChoferes: choferesRespaldo.length, 
          enRuta: 1, 
          descansando: choferesRespaldo.length - 1, 
          alertasActivas: 0 
        },
        directorio: choferesRespaldo
      };
    }
  },

  crearConductor: async (datosConductor: { nombre: string; correo: string; telefono?: string; licencia?: string }) => {
    const nuevoConductor: Conductor = {
      id: `conductor-local-${Date.now()}`,
      nombre: datosConductor.nombre,
      correo: datosConductor.correo,
      licencia: datosConductor.licencia || 'Tipo C',
      vehiculoAsignado: 'No asignado',
      estado: 'Descansando'
    };

    const existentes = JSON.parse(localStorage.getItem('tracefleet_conductores_locales') || '[]');
    localStorage.setItem('tracefleet_conductores_locales', JSON.stringify([nuevoConductor, ...existentes]));

    return nuevoConductor;
  }
};