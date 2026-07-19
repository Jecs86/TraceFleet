import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Truck, Map, Droplet, 
  Wrench, FileText, Folder, Settings, 
  Bell, UserCircle 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts';
import logoVertical from '../assets/images/logo-vertical.png';

// Importamos el servicio
import { combustibleService, type CombustibleDashboardData } from '../services/combustible.service';

export default function Combustible() {
  const [data, setData] = useState<CombustibleDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await combustibleService.getDashboardData();
        setData(result);
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
    if (estadoLower.includes('diferencia') || estadoLower.includes('anomalía')) return 'bg-red-500';
    if (estadoLower.includes('ruta') || estadoLower.includes('aprobada')) return 'bg-green-500';
    if (estadoLower.includes('revisión') || estadoLower.includes('pendiente')) return 'bg-yellow-400';
    return 'bg-gray-400';
  };

  return (
    <div className="flex h-screen bg-[#E2E8F0] font-sans w-full">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm z-20 shrink-0">
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
              <Link to="/dashboard" className="w-full flex items-center gap-3 px-6 py-3 text-gray-600 hover:bg-slate-50 hover:text-[#3779CB] transition-colors">
                <LayoutDashboard className="w-5 h-5" /> Dashboard
              </Link>
            </li>
            <li>
              <Link to="/vehiculos" className="w-full flex items-center gap-3 px-6 py-3 text-gray-600 hover:bg-slate-50 hover:text-[#3779CB] transition-colors">
                <Truck className="w-5 h-5" /> Vehículos
              </Link>
            </li>
            <li>
              <button className="w-full flex items-center gap-3 px-6 py-3 text-gray-600 hover:bg-slate-50 hover:text-[#3779CB] transition-colors">
                <Map className="w-5 h-5" /> Rutas
              </button>
            </li>
            {/* ACTIVO: Combustible */}
            <li>
              <Link to="/combustible" className="w-full flex items-center gap-3 px-6 py-3 bg-blue-50 border-r-4 border-[#3779CB] text-[#3779CB] font-semibold transition-colors">
                <Droplet className="w-5 h-5" /> Combustible
              </Link>
            </li>
            {[
              { name: 'Mantenimiento', icon: Wrench },
              { name: 'Reportes', icon: FileText },
              { name: 'Documentos', icon: Folder },
            ].map((item) => (
              <li key={item.name}>
                <button className="w-full flex items-center gap-3 px-6 py-3 text-gray-600 hover:bg-slate-50 hover:text-[#3779CB] transition-colors">
                  <item.icon className="w-5 h-5" /> {item.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-slate-50 hover:text-[#3779CB] rounded-md transition-colors">
            <Settings className="w-5 h-5" /> Configuración
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        
        {/* HEADER */}
        <header className="h-20 bg-white flex items-center justify-between px-8 shadow-sm z-10 border-b border-gray-200 shrink-0">
          <h2 className="text-2xl font-bold text-black tracking-wide">
            Combustible
          </h2>
          <button className="relative p-2 text-gray-600 hover:bg-slate-100 rounded-full transition-colors">
            <Bell className="w-6 h-6" />
            <span className="absolute top-1 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </header>

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-1 overflow-y-auto p-8 w-full max-w-7xl mx-auto">
          
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-gray-500 font-medium text-lg">Cargando métricas de combustible...</span>
            </div>
          ) : (
            <div className="flex flex-col gap-6 w-full">
              
              {/* Tarjetas Superiores */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                {/* Pendientes */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center">
                  <span className="text-sm text-gray-500 font-medium mb-2">Pendientes</span>
                  <span className="text-4xl font-extrabold text-[#1A2847]">{data?.tarjetas.pendientes || 0}</span>
                </div>
                {/* Auditadas */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center">
                  <span className="text-sm text-gray-500 font-medium mb-2">Auditadas</span>
                  <span className="text-4xl font-extrabold text-[#1A2847]">{data?.tarjetas.auditadas || 0}</span>
                </div>
                {/* Anomalías */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center">
                  <span className="text-sm text-gray-500 font-medium mb-2">Anomalías</span>
                  <span className="text-4xl font-extrabold text-[#1A2847]">{data?.tarjetas.anomalias || 0}</span>
                </div>
                {/* Aprobadas */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center">
                  <span className="text-sm text-gray-500 font-medium mb-2">Aprobadas</span>
                  <span className="text-4xl font-extrabold text-[#1A2847]">{data?.tarjetas.aprobadas || 0}</span>
                </div>
              </div>

              {/* Contenedor Medio: Solicitudes Recientes */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col min-h-[350px]">
                <h3 className="text-2xl font-bold text-[#1A2847] mb-8 text-center">Solicitudes Recientes</h3>
                
                {/* Cabecera de la tabla */}
                <div className="grid grid-cols-3 w-full mb-4 px-6 text-center">
                  <span className="font-bold text-[#1A2847]">Placa</span>
                  <span className="font-bold text-[#1A2847]">Chofer</span>
                  <span className="font-bold text-[#1A2847]">Estado</span>
                </div>

                {/* Lista Scrolleable */}
                <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-2 custom-scrollbar">
                  {data?.solicitudesRecientes && data.solicitudesRecientes.length > 0 ? (
                    data.solicitudesRecientes.map((solicitud) => (
                      <Link 
                        to={`/combustible/${solicitud.id}`} 
                        key={solicitud.id} 
                        className="grid grid-cols-3 items-center w-full bg-slate-50 border border-slate-100 rounded-lg p-4 hover:bg-slate-100 transition-colors text-center cursor-pointer"
                      >
                        <span className="text-gray-600 font-medium uppercase">{solicitud.placa}</span>
                        <span className="text-gray-600">{solicitud.chofer}</span>
                        <div className="flex items-center justify-center gap-3">
                          <div className={`w-3.5 h-3.5 rounded-full shadow-sm ${getEstadoColor(solicitud.estado)}`}></div>
                          <span className="text-gray-600 truncate">{solicitud.estado}</span>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-gray-400 italic">No hay registros recientes.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contenedor Inferior: Gráfico de Consumo */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col h-[400px]">
                <h3 className="text-2xl font-bold text-[#1A2847] mb-8 text-center">Consumo por Vehículo</h3>
                <div className="flex-1 w-full">
                  {data?.consumoPorVehiculo && data.consumoPorVehiculo.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.consumoPorVehiculo} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="placa" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dx={-10} />
                        <RechartsTooltip 
                          formatter={(value: any) => [`${Number(value).toFixed(2)} Galones`, 'Consumo']}
                          cursor={{ fill: '#f1f5f9' }}
                        />
                        <Bar dataKey="galones" fill="#3779CB" radius={[4, 4, 0, 0]} maxBarSize={60} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full border-2 border-dashed border-gray-200 rounded-lg">
                      <span className="text-gray-400">Contenedor reservado para el gráfico (Recharts)</span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

        </main>
      </div>
      
    </div>
  );
}