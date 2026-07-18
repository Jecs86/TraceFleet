import { 
  LayoutDashboard, Truck, Map, Droplet, 
  Wrench, FileText, Folder, Settings, 
  Bell, UserCircle
} from 'lucide-react';
import logoVertical from '../assets/images/logo-vertical.png';

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-[#E2E8F0] font-sans">
      
      {/* SIDEBAR (Barra Lateral Izquierda) */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm z-20">
        
        {/* Sección 1: Logo y Usuario */}
        <div className="flex flex-col items-center pt-8 pb-6 border-b border-gray-100">
          <img src={logoVertical} alt="TraceFleet Logo" className="h-12 object-contain mb-2" />
          <h1 className="text-xl font-extrabold text-[#1A2847] tracking-tight mb-6">
            TraceFleet
          </h1>
          
          {/* Usuario reubicado aquí */}
          <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100 w-10/12">
            <UserCircle className="text-[#3779CB] w-8 h-8" />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-[#1A2847]">José</span>
              <span className="text-xs text-gray-500">Administrador</span>
            </div>
          </div>
        </div>

        {/* Sección 2: Navegación Principal */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="flex flex-col gap-1">
            {/* Elemento Activo (Dashboard) */}
            <li>
              <button className="w-full flex items-center gap-3 px-6 py-3 bg-blue-50 border-r-4 border-[#3779CB] text-[#3779CB] font-semibold transition-colors">
                <LayoutDashboard className="w-5 h-5" />
                Dashboard
              </button>
            </li>
            
            {/* Elementos Inactivos */}
            {[
              { name: 'Vehículos', icon: Truck },
              { name: 'Rutas', icon: Map },
              { name: 'Combustible', icon: Droplet },
              { name: 'Mantenimiento', icon: Wrench },
              { name: 'Reportes', icon: FileText },
              { name: 'Documentos', icon: Folder },
            ].map((item) => (
              <li key={item.name}>
                <button className="w-full flex items-center gap-3 px-6 py-3 text-gray-600 hover:bg-slate-50 hover:text-[#3779CB] transition-colors">
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sección 3: Configuración (Fondo del Sidebar) */}
        <div className="p-4 border-t border-gray-200">
          <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-slate-50 hover:text-[#3779CB] rounded-md transition-colors">
            <Settings className="w-5 h-5" />
            Configuración
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL (Header + Contenido) */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* HEADER SUPERIOR */}
        <header className="h-20 bg-white flex items-center justify-between px-8 shadow-sm z-10 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-black uppercase tracking-wide">
            Dashboard
          </h2>
          <button className="relative p-2 text-gray-600 hover:bg-slate-100 rounded-full transition-colors">
            <Bell className="w-6 h-6" />
            <span className="absolute top-1 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </header>

        {/* CONTENIDO DEL DASHBOARD (Scrollable) */}
        <main className="flex-1 overflow-y-auto p-8">
          
          {/* 3 Tarjetas de Resumen Superiores */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white h-28 rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 font-medium">Tarjeta 1</div>
            <div className="bg-white h-28 rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 font-medium">Tarjeta 2</div>
            <div className="bg-white h-28 rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 font-medium">Tarjeta 3</div>
          </div>

          {/* Sección de Gráficos (2 columnas) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 bg-white h-80 rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 font-medium">Gráfico de Barras</div>
            <div className="lg:col-span-1 bg-white h-80 rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 font-medium">Gráfico de Líneas</div>
          </div>

          {/* Tabla Inferior */}
          <div className="bg-white h-64 rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 font-medium">
            Tabla de Estado de la Flota
          </div>

        </main>
      </div>
      
    </div>
  );
}