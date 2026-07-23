import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Truck, Map, Droplet, 
  Wrench, FileText, Folder, Settings, 
  Bell, UserCircle, DollarSign, AlertTriangle, TrendingUp, Users
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line 
} from 'recharts';
import { Link } from 'react-router-dom';

import logoVertical from '../assets/images/logo-vertical.png';
// Asumimos que el servicio está en la carpeta superior /services
import { dashboardService, type DashboardData } from '../services/dashboard.service'; 

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // const result = await dashboardService.getDashboardResume();
        // setData(result);
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
    <div className="flex h-screen bg-[#E2E8F0] font-sans">
      
      {/* SIDEBAR (Barra Lateral Izquierda) */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm z-20">
        <div className="flex flex-col items-center pt-8 pb-6 border-b border-gray-100">
          <img src={logoVertical} alt="TraceFleet Logo" className="h-12 object-contain mb-2" />
          <h1 className="text-xl font-extrabold text-[#1A2847] tracking-tight mb-6">TraceFleet</h1>
          <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100 w-10/12">
            <UserCircle className="text-[#3779CB] w-8 h-8" />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-[#1A2847]">José</span>
              <span className="text-xs text-gray-500">Administrador</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="flex flex-col gap-1">
            <li>
              <Link to="/dashboard" className="w-full flex items-center gap-3 px-6 py-3 bg-blue-50 border-r-4 border-[#3779CB] text-[#3779CB] font-semibold transition-colors">
                <LayoutDashboard className="w-5 h-5" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/vehiculos" className="w-full flex items-center gap-3 px-6 py-3 text-gray-600 hover:bg-slate-50 hover:text-[#3779CB] transition-colors">
                <Truck className="w-5 h-5" />
                Vehículos
              </Link>
            </li>
            <li>
            <Link to="/conductores" className="w-full flex items-center gap-3 px-6 py-3 text-gray-600 hover:bg-slate-50 hover:text-[#3779CB] transition-colors">
              <Users className="w-5 h-5" /> Conductores
            </Link>
          </li>
            <li>
              <Link to="/rutas/asignar" className="w-full flex items-center gap-3 px-6 py-3 text-gray-600 hover:bg-slate-50 hover:text-[#3779CB] transition-colors">
                <Map className="w-5 h-5" />
                Rutas
              </Link>
            </li>
            <li>
              <Link to="/combustible" className="w-full flex items-center gap-3 px-6 py-3 text-gray-600 hover:bg-slate-50 hover:text-[#3779CB] transition-colors">
                <Droplet className="w-5 h-5" />
                Combustible
              </Link>
            </li>
            <li>
              <Link to="/mantenimiento" className="w-full flex items-center gap-3 px-6 py-3 text-gray-600 hover:bg-slate-50 hover:text-[#3779CB] transition-colors">
                <Wrench className="w-5 h-5" />
                Mantenimiento
              </Link>
            </li>
            <li>
              <Link to="/reportes" className="w-full flex items-center gap-3 px-6 py-3 text-gray-600 hover:bg-slate-50 hover:text-[#3779CB] transition-colors">
                <FileText className="w-5 h-5" />
                Reportes
              </Link>
            </li>
            <li>
              <Link to="/documentos" className="w-full flex items-center gap-3 px-6 py-3 text-gray-600 hover:bg-slate-50 hover:text-[#3779CB] transition-colors">
                <Folder className="w-5 h-5" />
                Documentos
              </Link>
            </li>
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-slate-50 hover:text-[#3779CB] rounded-md transition-colors">
            <Settings className="w-5 h-5" />
            Configuración
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* HEADER SUPERIOR */}
        <header className="h-20 bg-white flex items-center justify-between px-8 shadow-sm z-10 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-black uppercase tracking-wide">Dashboard</h2>
          <button className="relative p-2 text-gray-600 hover:bg-slate-100 rounded-full transition-colors">
            <Bell className="w-6 h-6" />
            <span className="absolute top-1 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </header>

        {/* CONTENIDO DEL DASHBOARD */}
        <main className="flex-1 overflow-y-auto p-8">
          
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-gray-500 font-medium text-lg">Cargando datos del dashboard...</span>
            </div>
          ) : (
            <>
              {/* 3 Tarjetas de Resumen Superiores */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Tarjeta 1: Utilidad Neta */}
                <div className="bg-white h-28 rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium mb-1">Utilidad Neta del Mes</p>
                    <h3 className="text-2xl font-bold text-[#1A2847]">
                      {formatCurrency(data?.tarjetas.utilidadNeta || 0)}
                    </h3>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>

                {/* Tarjeta 2: Alertas / Discrepancias */}
                <div className="bg-white h-28 rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium mb-1">Discrepancias Combustible</p>
                    <h3 className="text-2xl font-bold text-red-600">
                      {formatCurrency(data?.tarjetas.discrepanciasCombustible || 0)}
                    </h3>
                  </div>
                  <div className="bg-red-100 p-3 rounded-full">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                </div>

                {/* Tarjeta 3: Ahorro Mantenimiento */}
                <div className="bg-white h-28 rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium mb-1">Ahorro por Mantenimiento</p>
                    <h3 className="text-2xl font-bold text-[#3779CB]">
                      {formatCurrency(data?.tarjetas.ahorroMantenimiento || 0)}
                    </h3>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <TrendingUp className="w-6 h-6 text-[#3779CB]" />
                  </div>
                </div>
              </div>

              {/* Sección de Gráficos */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Gráfico de Barras: Vehículos menos eficientes */}
                <div className="lg:col-span-2 bg-white h-80 rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
                  <h3 className="text-lg font-bold text-[#1A2847] mb-4">Top 5 Vehículos con Mayor Gasto</h3>
                  <div className="flex-1 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data?.topVehiculosIneficientes || []}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="placa" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                        <RechartsTooltip formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Gastos Totales']} />
                        <Bar dataKey="gastosTotales" fill="#1A2847" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Gráfico de Líneas: Tendencia Financiera */}
                <div className="lg:col-span-1 bg-white h-80 rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
                  <h3 className="text-lg font-bold text-[#1A2847] mb-4">Ingresos vs Costos</h3>
                  <div className="flex-1 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data?.tendenciaFinanciera || []}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="fecha" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                        <YAxis hide={true} />
                        <RechartsTooltip />
                        <Line type="monotone" dataKey="ganancias" stroke="#16a34a" strokeWidth={3} dot={false} name="Ganancias" />
                        <Line type="monotone" dataKey="costos" stroke="#dc2626" strokeWidth={3} dot={false} name="Costos" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Tabla Inferior: Estado de la Flota */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-[#1A2847]">Estado de la Flota en Tiempo Real</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
                        <th className="px-6 py-4 font-semibold">Unidad</th>
                        <th className="px-6 py-4 font-semibold">Chofer</th>
                        <th className="px-6 py-4 font-semibold">Ruta</th>
                        <th className="px-6 py-4 font-semibold">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data?.viajesActivos || []).length > 0 ? (
                        data!.viajesActivos.map((viaje) => (
                          <tr key={viaje.id} className="border-b border-gray-100 hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-medium text-[#1A2847]">
                              {viaje.vehiculo.placa} <span className="text-gray-400 font-normal text-sm block">{viaje.vehiculo.marca}</span>
                            </td>
                            <td className="px-6 py-4 text-gray-600">{viaje.chofer.nombre}</td>
                            <td className="px-6 py-4 text-gray-600">{viaje.origen} - {viaje.destino}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium ${
                                !viaje.vehiculo.estadoOperativo || viaje.estado === 'RETRASADO' 
                                  ? 'bg-red-50 text-red-700' 
                                  : 'bg-green-50 text-green-700'
                              }`}>
                                <span className={`w-2 h-2 rounded-full ${!viaje.vehiculo.estadoOperativo || viaje.estado === 'RETRASADO' ? 'bg-red-500' : 'bg-green-500'}`}></span>
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

        </main>
      </div>
      
    </div>
  );
}