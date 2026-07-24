import React, { useState, useEffect } from 'react';
import { 
  DollarSign, AlertTriangle, TrendingUp
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line 
} from 'recharts';

// Asumimos que el servicio está en la carpeta superior /services
import { dashboardService, type DashboardData } from '../services/dashboard.service'; 
import Layout from '../components/Layout';

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const result = await dashboardService.getDashboardResume();
        setData(result);
      } catch (error) {
        console.error("Error cargando dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Formateador de moneda para los gráficos y tarjetas
  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

  return (
    <Layout title="Dashboard">
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <span className="text-gray-500 font-medium text-lg">Cargando datos del dashboard...</span>
        </div>
      ) : (
        <>
              {/* 3 Tarjetas de Resumen Superiores */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Tarjeta 1: Utilidad Neta */}
                <div className="bg-surface h-28 rounded-xl shadow-sm border border-border p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-muted font-medium mb-1">Utilidad Neta del Mes</p>
                    <h3 className="text-2xl font-bold text-text-heading">
                      {formatCurrency(data?.tarjetas.utilidadNeta || 0)}
                    </h3>
                  </div>
                  <div className="bg-success/20 p-3 rounded-full">
                    <DollarSign className="w-6 h-6 text-success" />
                  </div>
                </div>

                {/* Tarjeta 2: Alertas / Discrepancias */}
                <div className="bg-surface h-28 rounded-xl shadow-sm border border-border p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-muted font-medium mb-1">Discrepancias Combustible</p>
                    <h3 className="text-2xl font-bold text-error">
                      {formatCurrency(data?.tarjetas.discrepanciasCombustible || 0)}
                    </h3>
                  </div>
                  <div className="bg-error/20 p-3 rounded-full">
                    <AlertTriangle className="w-6 h-6 text-error" />
                  </div>
                </div>

                {/* Tarjeta 3: Ahorro Mantenimiento */}
                <div className="bg-surface h-28 rounded-xl shadow-sm border border-border p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-muted font-medium mb-1">Ahorro por Mantenimiento</p>
                    <h3 className="text-2xl font-bold text-secondary">
                      {formatCurrency(data?.tarjetas.ahorroMantenimiento || 0)}
                    </h3>
                  </div>
                  <div className="bg-secondary/20 p-3 rounded-full">
                    <TrendingUp className="w-6 h-6 text-secondary" />
                  </div>
                </div>
              </div>

              {/* Sección de Gráficos */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Gráfico de Barras: Vehículos menos eficientes */}
                <div className="lg:col-span-2 bg-surface h-80 rounded-xl shadow-sm border border-border p-6 flex flex-col">
                  <h3 className="text-lg font-bold text-text-heading mb-4">Top 5 Vehículos con Mayor Gasto</h3>
                  <div className="flex-1 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data?.topVehiculosIneficientes || []}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="placa" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                        <RechartsTooltip formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Gastos Totales']} />
                        <Bar dataKey="gastosTotales" fill="var(--secondary)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Gráfico de Líneas: Tendencia Financiera */}
                <div className="lg:col-span-1 bg-surface h-80 rounded-xl shadow-sm border border-border p-6 flex flex-col">
                  <h3 className="text-lg font-bold text-text-heading mb-4">Ingresos vs Costos</h3>
                  <div className="flex-1 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data?.tendenciaFinanciera || []}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="fecha" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                        <YAxis hide={true} />
                        <RechartsTooltip />
                        <Line type="monotone" dataKey="ganancias" stroke="var(--success)" strokeWidth={3} dot={false} name="Ganancias" />
                        <Line type="monotone" dataKey="costos" stroke="var(--error)" strokeWidth={3} dot={false} name="Costos" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Tabla Inferior: Estado de la Flota */}
              <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
                <div className="p-6 border-b border-divider">
                  <h3 className="text-lg font-bold text-text-heading">Estado de la Flota en Tiempo Real</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-card text-text-muted text-sm border-b border-divider">
                        <th className="px-6 py-4 font-semibold">Unidad</th>
                        <th className="px-6 py-4 font-semibold">Chofer</th>
                        <th className="px-6 py-4 font-semibold">Ruta</th>
                        <th className="px-6 py-4 font-semibold">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data?.viajesActivos || []).length > 0 ? (
                        data!.viajesActivos.map((viaje) => (
                          <tr key={viaje.id} className="border-b border-divider hover:bg-card transition-colors">
                            <td className="px-6 py-4 font-medium text-text-heading">
                              {viaje.vehiculo.placa} <span className="text-text-muted font-normal text-sm block">{viaje.vehiculo.marca}</span>
                            </td>
                            <td className="px-6 py-4 text-text-muted">{viaje.chofer.nombre}</td>
                            <td className="px-6 py-4 text-text-muted">{viaje.origen} - {viaje.destino}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium ${
                                !viaje.vehiculo.estadoOperativo || viaje.estado === 'RETRASADO' 
                                  ? 'bg-error/10 text-error' 
                                  : 'bg-success/10 text-success'
                              }`}>
                                <span className={`w-2 h-2 rounded-full ${!viaje.vehiculo.estadoOperativo || viaje.estado === 'RETRASADO' ? 'bg-error' : 'bg-success'}`}></span>
                                {!viaje.vehiculo.estadoOperativo ? 'En Alerta' : viaje.estado === 'EN_RUTA' ? 'En Ruta' : viaje.estado}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                            No hay viajes activos en este momento.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
        </>
      )}
    </Layout>
  );
}