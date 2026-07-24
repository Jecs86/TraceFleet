import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts';

// Importamos el servicio
import { combustibleService, type CombustibleDashboardData } from '../services/combustible.service';
import Layout from '../components/Layout';

export default function Combustible() {
  const [data, setData] = useState<CombustibleDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // const result = await combustibleService.getDashboardData();
        // setData(result);
      } catch (error) {
        console.error("Error cargando dashboard de combustible:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Función helper para asignar colores a los estados (Gestalt visual)
  const getEstadoColor = (estado: string) => {
    const estadoLower = estado.toLowerCase();
    if (estadoLower.includes('diferencia') || estadoLower.includes('anomalía')) return 'bg-error';
    if (estadoLower.includes('ruta') || estadoLower.includes('aprobada')) return 'bg-success';
    if (estadoLower.includes('revisión') || estadoLower.includes('pendiente')) return 'bg-warning';
    return 'bg-border';
  };

  return (
    <Layout title="Combustible">
      {loading ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-gray-500 font-medium text-lg">Cargando métricas de combustible...</span>
            </div>
          ) : (
            <div className="flex flex-col gap-6 w-full">
              
              {/* Tarjetas Superiores */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                {/* Pendientes */}
                <div className="bg-surface rounded-xl shadow-sm border border-border p-6 flex flex-col items-center justify-center">
                  <span className="text-sm text-text-muted font-medium mb-2">Pendientes</span>
                  <span className="text-4xl font-extrabold text-text-heading">{data?.tarjetas.pendientes || 0}</span>
                </div>
                {/* Auditadas */}
                <div className="bg-surface rounded-xl shadow-sm border border-border p-6 flex flex-col items-center justify-center">
                  <span className="text-sm text-text-muted font-medium mb-2">Auditadas</span>
                  <span className="text-4xl font-extrabold text-text-heading">{data?.tarjetas.auditadas || 0}</span>
                </div>
                {/* Anomalías */}
                <div className="bg-surface rounded-xl shadow-sm border border-border p-6 flex flex-col items-center justify-center">
                  <span className="text-sm text-text-muted font-medium mb-2">Anomalías</span>
                  <span className="text-4xl font-extrabold text-text-heading">{data?.tarjetas.anomalias || 0}</span>
                </div>
                {/* Aprobadas */}
                <div className="bg-surface rounded-xl shadow-sm border border-border p-6 flex flex-col items-center justify-center">
                  <span className="text-sm text-text-muted font-medium mb-2">Aprobadas</span>
                  <span className="text-4xl font-extrabold text-text-heading">{data?.tarjetas.aprobadas || 0}</span>
                </div>
              </div>

              {/* Contenedor Medio: Solicitudes Recientes */}
              <div className="bg-surface rounded-xl shadow-sm border border-border p-8 flex flex-col min-h-[350px]">
                <h3 className="text-2xl font-bold text-text-heading mb-8 text-center">Solicitudes Recientes</h3>
                
                {/* Cabecera de la tabla */}
                <div className="grid grid-cols-3 w-full mb-4 px-6 text-center border-b border-divider pb-2">
                  <span className="font-bold text-text-heading">Placa</span>
                  <span className="font-bold text-text-heading">Chofer</span>
                  <span className="font-bold text-text-heading">Estado</span>
                </div>
 
                {/* Lista Scrolleable */}
                <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-2 custom-scrollbar">
                  {data?.solicitudesRecientes && data.solicitudesRecientes.length > 0 ? (
                    data.solicitudesRecientes.map((solicitud) => (
                      <Link 
                        to={`/combustible/${solicitud.id}`} 
                        key={solicitud.id} 
                        className="grid grid-cols-3 items-center w-full bg-card border border-border rounded-lg p-4 hover:bg-surface transition-colors text-center cursor-pointer"
                      >
                        <span className="text-text-heading font-semibold uppercase">{solicitud.placa}</span>
                        <span className="text-text-muted">{solicitud.chofer}</span>
                        <div className="flex items-center justify-center gap-3">
                          <div className={`w-3.5 h-3.5 rounded-full shadow-sm ${getEstadoColor(solicitud.estado)}`}></div>
                          <span className="text-text-muted truncate">{solicitud.estado}</span>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-text-muted italic">No hay registros recientes.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contenedor Inferior: Gráfico de Consumo */}
              <div className="bg-surface rounded-xl shadow-sm border border-border p-8 flex flex-col h-[400px]">
                <h3 className="text-2xl font-bold text-text-heading mb-8 text-center">Consumo por Vehículo</h3>
                <div className="flex-1 w-full">
                  {data?.consumoPorVehiculo && data.consumoPorVehiculo.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.consumoPorVehiculo} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                        <XAxis dataKey="placa" axisLine={false} tickLine={false} tick={{ fill: 'var(--text)' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text)' }} dx={-10} />
                        <RechartsTooltip 
                          formatter={(value: any) => [`${Number(value).toFixed(2)} Galones`, 'Consumo']}
                          cursor={{ fill: 'var(--card)' }}
                        />
                        <Bar dataKey="galones" fill="var(--secondary)" radius={[4, 4, 0, 0]} maxBarSize={60} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full border-2 border-dashed border-border rounded-lg">
                      <span className="text-text-muted">Contenedor reservado para el gráfico (Recharts)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
    </Layout>
  );
}