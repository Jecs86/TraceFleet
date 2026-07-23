import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Truck, Map, Droplet, 
  Wrench, FileText, Folder, Settings, 
  Bell, UserCircle, Users 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import logoVertical from '../assets/images/logo-vertical.png';
import { useNavigate } from 'react-router-dom';

// Importamos el servicio y sus interfaces
import { conductoresService, type ConductoresDashboardData } from '../services/conductores.service';

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
    if (!estado) return 'bg-gray-400';
    const estadoLower = estado.toLowerCase();
    if (requiresAlert(estadoLower)) return 'bg-red-500';
    if (estadoLower.includes('ruta')) return 'bg-green-500';
    if (estadoLower.includes('mantenimiento')) return 'bg-yellow-400';
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
            {/* ELEMENTO ACTIVO: Conductores */}
            <li>
              <button className="w-full flex items-center gap-3 px-6 py-3 bg-blue-50 border-r-4 border-[#3779CB] text-[#3779CB] font-semibold transition-colors">
                <Users className="w-5 h-5" /> Conductores
              </button>
            </li>
            <li>
              <Link to="/combustible" className="w-full flex items-center gap-3 px-6 py-3 text-gray-600 hover:bg-slate-50 hover:text-[#3779CB] transition-colors">
                <Droplet className="w-5 h-5" /> Combustible
              </Link>
            </li>
            {[
              { name: 'Rutas', icon: Map },
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
            Gestión de Conductores
          </h2>
          <button className="relative p-2 text-gray-600 hover:bg-slate-100 rounded-full transition-colors">
            <Bell className="w-6 h-6" />
            <span className="absolute top-1 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </header>

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
          
          {loading ? (
             <div className="flex items-center justify-center h-full">
               <span className="text-gray-500 font-medium text-lg">Cargando directorio de conductores...</span>
             </div>
          ) : (
            <>
              {/* Tarjetas de Estadísticas */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center">
                  <span className="text-gray-500 text-sm font-medium mb-1">Total Choferes</span>
                  <span className="text-3xl font-extrabold text-[#1A2847]">{data?.metricas.totalChoferes || 0}</span>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center">
                  <span className="text-gray-500 text-sm font-medium mb-1">En Ruta</span>
                  <span className="text-3xl font-extrabold text-green-600">{data?.metricas.enRuta || 0}</span>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center">
                  <span className="text-gray-500 text-sm font-medium mb-1">Descansando</span>
                  <span className="text-3xl font-extrabold text-gray-600">{data?.metricas.descansando || 0}</span>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center">
                  <span className="text-gray-500 text-sm font-medium mb-1">Alertas Activas</span>
                  <span className="text-3xl font-extrabold text-red-500">{data?.metricas.alertasActivas || 0}</span>
                </div>
              </div>

              {/* Lista de Conductores */}
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 flex flex-col flex-1">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-[#1A2847]">Directorio de Choferes</h3>
                  <button 
                    onClick={() => navigate('/conductores/nuevo')}
                    className="bg-[#3779CB] text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                    + Nuevo Conductor
                  </button>
                </div>
                
                {/* Cabecera de la tabla */}
                <div className="grid grid-cols-4 gap-4 font-bold text-black mb-4 px-4 border-b pb-2">
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
                          <div key={conductor.id} className={`grid grid-cols-4 gap-4 items-center p-4 rounded-lg border ${isAlert ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'}`}>
                            <div className="font-semibold text-gray-700 flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold">
                                {conductor.nombre ? conductor.nombre.substring(0,2).toUpperCase() : 'CH'}
                              </div>
                              {conductor.nombre}
                            </div>
                            <div className="text-gray-600 font-medium">{conductor.licencia}</div>
                            <div className="text-gray-600">{conductor.vehiculoAsignado || 'No asignado'}</div>
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full shadow-sm ${getEstadoColor(conductor.estado)}`}></div>
                              <span className={`font-medium ${isAlert ? 'text-red-600' : 'text-gray-700'}`}>
                                {conductor.estado}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex items-center justify-center py-10">
                        <span className="text-gray-400 italic">No hay conductores registrados.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

        </main>
      </div>
    </div>
  );
}