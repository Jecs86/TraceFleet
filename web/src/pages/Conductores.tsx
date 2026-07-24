import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Importamos el servicio y sus interfaces
import { conductoresService, type ConductoresDashboardData } from '../services/conductores.service';
import Layout from '../components/Layout';
import Button from '../components/Button';

export default function Conductores() {
  const navigate = useNavigate();
  const [data, setData] = useState<ConductoresDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await conductoresService.getDashboardData();
        setData(result);
      } catch (error) {
        console.error("Error al cargar el dashboard de conductores:", error);
        // Respaldo por si falla la red para que la pantalla no se rompa
        setData({
          metricas: { totalChoferes: 0, enRuta: 0, descansando: 0, alertasActivas: 0 },
          directorio: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Función helper para determinar si un estado implica una alerta
  const requiresAlert = (estado: string) => {
    return estado ? estado.toLowerCase().includes('precaución') || estado.toLowerCase().includes('alerta') : false;
  };

  // Función helper para el color del indicador de estado
  const getEstadoColor = (estado: string) => {
    if (!estado) return 'bg-border';
    const estadoLower = estado.toLowerCase();
    if (requiresAlert(estadoLower)) return 'bg-error';
    if (estadoLower.includes('ruta')) return 'bg-success';
    if (estadoLower.includes('mantenimiento')) return 'bg-warning';
    return 'bg-border';
  };

  return (
    <Layout title="Conductores">
      <div className="flex flex-col h-full gap-6 w-full">

          {loading ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-gray-500 font-medium text-lg">Cargando directorio de conductores...</span>
            </div>
          ) : (
            <>
              {/* Tarjetas de Estadísticas */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-surface rounded-xl shadow-sm border border-border p-6 flex flex-col items-center justify-center">
                  <span className="text-text-muted text-sm font-medium mb-1">Total Choferes</span>
                  <span className="text-3xl font-extrabold text-text-heading">{data?.metricas.totalChoferes || 0}</span>
                </div>
                <div className="bg-surface rounded-xl shadow-sm border border-border p-6 flex flex-col items-center justify-center">
                  <span className="text-text-muted text-sm font-medium mb-1">En Ruta</span>
                  <span className="text-3xl font-extrabold text-success">{data?.metricas.enRuta || 0}</span>
                </div>
                <div className="bg-surface rounded-xl shadow-sm border border-border p-6 flex flex-col items-center justify-center">
                  <span className="text-text-muted text-sm font-medium mb-1">Descansando</span>
                  <span className="text-3xl font-extrabold text-text-heading">{data?.metricas.descansando || 0}</span>
                </div>
                <div className="bg-surface rounded-xl shadow-sm border border-border p-6 flex flex-col items-center justify-center">
                  <span className="text-text-muted text-sm font-medium mb-1">Alertas Activas</span>
                  <span className="text-3xl font-extrabold text-error">{data?.metricas.alertasActivas || 0}</span>
                </div>
              </div>

              {/* Lista de Conductores */}
              <div className="bg-surface rounded-xl shadow-md border border-border p-6 flex flex-col flex-1">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-text-heading">Directorio de Choferes</h3>
                  <Button
                    onClick={() => navigate('/conductores/nuevo')}
                    className="px-4 py-2">
                    + Nuevo Conductor
                  </Button>
                </div>

                {/* Cabecera de la tabla */}
                <div className="grid grid-cols-4 gap-4 font-bold text-text-heading mb-4 px-4 border-b border-divider pb-2">
                  <div>Nombre</div>
                  <div>Licencia</div>
                  <div>Vehículo Asignado</div>
                  <div>Estado</div>
                </div>

                {/* Contenedor con Scroll para las filas */}
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  <div className="flex flex-col gap-3">
                    {data?.directorio && data.directorio.length > 0 ? (
                      data.directorio.map((conductor) => {
                        const isAlert = requiresAlert(conductor.estado);
                        return (
                          <div key={conductor.id} className={`grid grid-cols-4 gap-4 items-center p-4 rounded-lg border ${isAlert ? 'bg-error/10 border-error' : 'bg-card border-border'}`}>
                            <div className="font-semibold text-text-heading flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-border flex items-center justify-center text-text-muted text-xs font-bold">
                                {conductor.nombre ? conductor.nombre.substring(0, 2).toUpperCase() : 'CH'}
                              </div>
                              {conductor.nombre}
                            </div>
                            <div className="text-text-muted font-medium">{conductor.licencia}</div>
                            <div className="text-text-muted">{conductor.vehiculoAsignado || 'No asignado'}</div>
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full shadow-sm ${getEstadoColor(conductor.estado)}`}></div>
                              <span className={`font-medium ${isAlert ? 'text-error' : 'text-text-heading'}`}>
                                {conductor.estado}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex items-center justify-center py-10">
                        <span className="text-text-muted italic">No hay conductores registrados.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
      </div>
    </Layout>
  );
}