import api from './api';

// Interfaces para mantener el tipado fuerte en TypeScript
export interface ViajeActivo {
  id: string;
  origen: string;
  destino: string;
  estado: string;
  vehiculo: { placa: string; marca: string; estadoOperativo: boolean };
  chofer: { nombre: string };
}

export interface Liquidacion {
  id: string;
  utilidadNetaViaje: number;
  discrepanciaPrecioCombustible: number;
  ahorroMantenimientoEstimado: number;
  totalCombustibleReal: number;
  totalGastosExtra: number;
  createdAt: string;
  viaje: { vehiculo: { placa: string } };
}

// Nuevas interfaces para los gráficos
export interface GastoVehiculo {
  placa: string;
  gastosTotales: number;
}

export interface TendenciaFinanciera {
  fecha: string;
  ganancias: number;
  costos: number;
}

export interface DashboardData {
  tarjetas: {
    utilidadNeta: number;
    discrepanciasCombustible: number;
    ahorroMantenimiento: number;
  };
  viajesActivos: ViajeActivo[];
  topVehiculosIneficientes: GastoVehiculo[];
  tendenciaFinanciera: TendenciaFinanciera[];
}

export const dashboardService = {
  /**
   * Obtiene y procesa todos los datos necesarios para el Dashboard.
   */
  getDashboardResume: async (): Promise<DashboardData> => {
    try {
      // Ejecutamos las peticiones en paralelo pero de forma independiente
      // para que un fallo en liquidaciones no bloquee los viajes activos
      const [liquidacionesResult, viajesResult] = await Promise.allSettled([
        api.get('/viajes/liquidaciones'),
        api.get('/viajes'),
      ]);

      const liquidaciones: Liquidacion[] = 
        liquidacionesResult.status === 'fulfilled' ? liquidacionesResult.value.data : [];
      const todosLosViajes = 
        viajesResult.status === 'fulfilled' ? viajesResult.value.data : [];

      if (liquidacionesResult.status === 'rejected') {
        console.warn('No se pudieron cargar liquidaciones:', liquidacionesResult.reason);
      }
      if (viajesResult.status === 'rejected') {
        console.warn('No se pudieron cargar viajes:', viajesResult.reason);
      }

      // --------------------------------------------------------
      // 1. Cálculos para las 3 Tarjetas Superiores
      // --------------------------------------------------------
      const utilidadNeta = liquidaciones.reduce((acc, liq) => acc + liq.utilidadNetaViaje, 0);
      const discrepanciasCombustible = liquidaciones.reduce((acc, liq) => acc + liq.discrepanciaPrecioCombustible, 0);
      const ahorroMantenimiento = liquidaciones.reduce((acc, liq) => acc + liq.ahorroMantenimientoEstimado, 0);

      // --------------------------------------------------------
      // 2. Filtrado de viajes para la Tabla de Estado en Tiempo Real
      // --------------------------------------------------------
      const viajesActivos = todosLosViajes.filter(
        (viaje: any) => viaje.estado === 'EN_RUTA'
      );

      // --------------------------------------------------------
      // 3. Gráfico de Barras: Top 5 Vehículos con más gastos (Combustible + Extra)
      // --------------------------------------------------------
      const gastosPorVehiculo: Record<string, number> = {};
      
      liquidaciones.forEach(liq => {
        const placa = liq.viaje?.vehiculo?.placa || 'Desconocido';
        const costoTotal = liq.totalCombustibleReal + liq.totalGastosExtra;
        
        gastosPorVehiculo[placa] = (gastosPorVehiculo[placa] || 0) + costoTotal;
      });

      const topVehiculosIneficientes = Object.keys(gastosPorVehiculo)
        .map(placa => ({
          placa,
          gastosTotales: gastosPorVehiculo[placa]
        }))
        .sort((a, b) => b.gastosTotales - a.gastosTotales) // Orden descendente (los peores primero)
        .slice(0, 5); // Cortamos para dejar solo los 5 principales

      // --------------------------------------------------------
      // 4. Gráfico de Líneas: Tendencia Financiera (Ganancias vs Costos)
      // --------------------------------------------------------
      const tendencias: Record<string, { ganancias: number; costos: number }> = {};
      
      liquidaciones.forEach(liq => {
        // Extraemos solo la parte YYYY-MM-DD de la fecha
        const fecha = new Date(liq.createdAt).toISOString().split('T')[0];
        const costosDia = liq.totalCombustibleReal + liq.totalGastosExtra;
        
        if (!tendencias[fecha]) {
          tendencias[fecha] = { ganancias: 0, costos: 0 };
        }
        
        tendencias[fecha].ganancias += liq.utilidadNetaViaje;
        tendencias[fecha].costos += costosDia;
      });

      const tendenciaFinanciera = Object.keys(tendencias)
        .map(fecha => ({
          fecha,
          ganancias: tendencias[fecha].ganancias,
          costos: tendencias[fecha].costos
        }))
        .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()); // Orden cronológico

      // Retornamos el objeto final perfectamente estructurado
      return {
        tarjetas: {
          utilidadNeta,
          discrepanciasCombustible,
          ahorroMantenimiento
        },
        viajesActivos,
        topVehiculosIneficientes,
        tendenciaFinanciera
      };

    } catch (error) {
      console.error("Error al obtener los datos del dashboard:", error);
      throw error;
    }
  }
};