import { 
  LayoutDashboard, Truck, Map, Droplet, 
  Wrench, FileText, Folder, Settings, 
  Bell, UserCircle 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import logoVertical from '../assets/images/logo-vertical.png';

export default function Combustible() {
  
  // Datos temporales para la tabla
  const solicitudes = [
    { placa: '#A01', chofer: 'Bryan S.', estado: 'Diferencia detectada', color: 'bg-red-500' },
    { placa: '#A03', chofer: 'Carlos V.', estado: 'En Ruta', color: 'bg-green-500' },
    { placa: '#A06', chofer: 'Luis V.', estado: 'Revisión Normal', color: 'bg-yellow-400' },
    { placa: '#A08', chofer: 'Pedro M.', estado: 'En Ruta', color: 'bg-green-500' },
    { placa: '#A12', chofer: 'Jorge T.', estado: 'Diferencia detectada', color: 'bg-red-500' },
  ];

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
            {/* ELEMENTO ACTIVO: Combustible */}
            <li>
              <button className="w-full flex items-center gap-3 px-6 py-3 bg-blue-50 border-r-4 border-[#3779CB] text-[#3779CB] font-semibold transition-colors">
                <Droplet className="w-5 h-5" /> Combustible
              </button>
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
        <main className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
          
          {/* 1. Tarjetas de Estadísticas (4 columnas) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center">
              <span className="text-gray-500 text-sm font-medium mb-1">Pendientes</span>
              <span className="text-3xl font-extrabold text-[#1A2847]">3</span>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center">
              <span className="text-gray-500 text-sm font-medium mb-1">Auditadas</span>
              <span className="text-3xl font-extrabold text-[#1A2847]">42</span>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center">
              <span className="text-gray-500 text-sm font-medium mb-1">Anomalías</span>
              <span className="text-3xl font-extrabold text-[#1A2847]">2</span>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center">
              <span className="text-gray-500 text-sm font-medium mb-1">Aprobadas</span>
              <span className="text-3xl font-extrabold text-[#1A2847]">38</span>
            </div>

          </div>

          {/* 2. Solicitudes Recientes (Con barra de Scroll) */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 flex flex-col">
            <h3 className="text-2xl font-bold text-[#1A2847] mb-6">Solicitudes Recientes</h3>
            
            {/* Cabecera de la tabla */}
            <div className="grid grid-cols-3 gap-4 font-bold text-black mb-4 px-4">
              <div>Placa</div>
              <div>Chofer</div>
              <div>Estado</div>
            </div>

            {/* Contenedor con Scroll para las filas */}
            <div className="flex-1 overflow-y-auto max-h-60 pr-2">
              <div className="flex flex-col gap-4">
                {solicitudes.map((solicitud, index) => (
                  <div key={index} className="grid grid-cols-3 gap-4 items-center bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div className="font-semibold text-gray-700">{solicitud.placa}</div>
                    <div className="text-gray-600">{solicitud.chofer}</div>
                    <div className="flex items-center gap-3">
                      <div className={`w-3.5 h-3.5 rounded-full ${solicitud.color} shadow-sm`}></div>
                      <span className="text-gray-700 font-medium">{solicitud.estado}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Consumo por Vehículo (Contenedor vacío) */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 flex flex-col min-h-[300px]">
            <h3 className="text-2xl font-bold text-[#1A2847] mb-6">Consumo por Vehículo</h3>
            
            {/* Espacio reservado para el gráfico */}
            <div className="flex-1 bg-gray-50 rounded-lg border border-gray-200 border-dashed flex items-center justify-center">
              <span className="text-gray-400 font-medium">Contenedor reservado para el gráfico (Recharts / Chart.js)</span>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}