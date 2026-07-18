import { 
  LayoutDashboard, Truck, Map, Droplet, 
  Wrench, FileText, Folder, Settings, 
  Bell, UserCircle, Image as ImageIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import logoVertical from '../assets/images/logo-vertical.png';

export default function VehiculoDetalle() {
  return (
    <div className="flex h-screen bg-[#E2E8F0] font-sans w-full">
      
      {/* SIDEBAR (Mantenido expandido como pediste) */}
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
            {/* Activo en Vehículos */}
            <li>
              <Link to="/vehiculos" className="w-full flex items-center gap-3 px-6 py-3 bg-blue-50 border-r-4 border-[#3779CB] text-[#3779CB] font-semibold transition-colors">
                <Truck className="w-5 h-5" /> Vehículos
              </Link>
            </li>
            {[
              { name: 'Rutas', icon: Map },
              { name: 'Combustible', icon: Droplet },
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
          <h2 className="text-2xl font-bold text-black tracking-wide flex items-center gap-2">
            <Link to="/vehiculos" className="hover:text-[#3779CB] transition-colors">Vehículos</Link> 
            <span className="text-gray-400">&gt;</span> 
            #A01
          </h2>
          <button className="relative p-2 text-gray-600 hover:bg-slate-100 rounded-full transition-colors">
            <Bell className="w-6 h-6" />
            <span className="absolute top-1 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </header>

        {/* CONTENIDO (Grid de 2 columnas principales) */}
        <main className="flex-1 overflow-y-auto p-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-6xl">
            
            {/* CAJA 1: Info del Vehículo (Arriba Izquierda) */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 flex flex-col sm:flex-row items-center gap-8">
              <div className="bg-gray-100 rounded-lg h-40 w-40 flex items-center justify-center shrink-0 border border-gray-200 shadow-inner">
                <ImageIcon className="w-12 h-12 text-gray-300" />
              </div>
              <div className="flex flex-col gap-4 text-lg">
                <div className="flex gap-4"><span className="font-bold w-20 text-[#1A2847]">Placa</span> <span className="text-gray-600">#A01</span></div>
                <div className="flex gap-4"><span className="font-bold w-20 text-[#1A2847]">Marca</span> <span className="text-gray-600">Volvo</span></div>
                <div className="flex gap-4"><span className="font-bold w-20 text-[#1A2847]">Modelo</span> <span className="text-gray-600">FFA</span></div>
              </div>
            </div>

            {/* CAJA 2: Estados (Arriba Derecha) */}
            <div className="flex flex-col gap-4 justify-center">
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 flex items-center justify-between w-full max-w-md">
                <span className="font-bold text-[#1A2847] text-lg">Estado</span>
                <div className="flex items-center gap-3">
                  <span className="text-gray-600">Operativo</span>
                  <div className="w-5 h-5 rounded-full bg-green-500 shadow-sm"></div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 flex items-center justify-between w-full max-w-md">
                <span className="font-bold text-[#1A2847] text-lg">Seguro</span>
                <div className="flex items-center gap-3">
                  <span className="text-gray-600">Vigente</span>
                  <div className="w-5 h-5 rounded-full bg-green-500 shadow-sm"></div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 flex items-center justify-between w-full max-w-md">
                <span className="font-bold text-[#1A2847] text-lg">Mantenimiento</span>
                <div className="flex items-center gap-3">
                  <span className="text-gray-600">En 12 días</span>
                  <div className="w-5 h-5 rounded-full bg-orange-400 shadow-sm"></div>
                </div>
              </div>
            </div>

            {/* CAJA 3: Historial (Abajo Izquierda) */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 flex flex-col justify-between h-80">
              <div>
                <h3 className="text-2xl font-bold text-[#1A2847] mb-6">Historial</h3>
                <div className="flex flex-col gap-5 text-gray-600 font-medium">
                  <div className="flex justify-between"><span>Cambio de aceite</span> <span>05/07/2024</span></div>
                  <div className="flex justify-between"><span>Cambio de llantas</span> <span>13/06/2024</span></div>
                  <div className="flex justify-between"><span>Revisión del motor</span> <span>12/04/2024</span></div>
                </div>
              </div>
              <button className="bg-[#6870C4] hover:bg-[#565CA8] text-white font-medium py-2 px-6 rounded-lg self-start shadow-sm transition-colors mt-4">
                Ver historial
              </button>
            </div>

            {/* CAJA 4: Documentos (Abajo Derecha) */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 flex flex-col h-80">
              <h3 className="text-2xl font-bold text-[#1A2847] mb-8">Documentos</h3>
              <div className="flex justify-around items-center flex-1">
                <div className="flex flex-col items-center gap-2 cursor-pointer group">
                  <FileText className="w-10 h-10 text-gray-500 group-hover:text-[#3779CB] transition-colors" />
                  <span className="font-medium text-gray-700 group-hover:text-[#3779CB] transition-colors">Matrícula</span>
                </div>
                <div className="flex flex-col items-center gap-2 cursor-pointer group">
                  <FileText className="w-10 h-10 text-gray-500 group-hover:text-[#3779CB] transition-colors" />
                  <span className="font-medium text-gray-700 group-hover:text-[#3779CB] transition-colors">Seguro</span>
                </div>
                <div className="flex flex-col items-center gap-2 cursor-pointer group">
                  <FileText className="w-10 h-10 text-gray-500 group-hover:text-[#3779CB] transition-colors" />
                  <span className="font-medium text-gray-700 group-hover:text-[#3779CB] transition-colors">Revisión Técnica</span>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}