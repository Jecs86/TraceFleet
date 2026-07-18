import { 
  LayoutDashboard, Truck, Map, Droplet, 
  Wrench, FileText, Folder, Settings, 
  Bell, UserCircle, Search, Plus, Image as ImageIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import logoVertical from '../assets/images/logo-vertical.png';

export default function Vehiculos() {
  
  // Generamos un array temporal de 6 vehículos para renderizar las tarjetas
  const vehiculosTemp = [
    { id: '#A01', content: "Body text for whatever you'd like to say. Add main takeaway points, quotes, anecdotes, or even a very very short story." },
    { id: '#A02', content: "Body text for whatever you'd like to say. Add main takeaway points, quotes, anecdotes, or even a very very short story." },
    { id: '#A03', content: "Body text for whatever you'd like to say. Add main takeaway points, quotes, anecdotes, or even a very very short story." },
    { id: '#A04', content: "Body text for whatever you'd like to say. Add main takeaway points, quotes, anecdotes, or even a very very short story." },
    { id: '#A05', content: "Body text for whatever you'd like to say. Add main takeaway points, quotes, anecdotes, or even a very very short story." },
    { id: '#A06', content: "Body text for whatever you'd like to say. Add main takeaway points, quotes, anecdotes, or even a very very short story." },
  ];

  return (
    <div className="flex h-screen bg-[#E2E8F0] font-sans w-full">
      
      {/* SIDEBAR (Idéntico, pero con 'Vehículos' activo) */}
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
            {/* ELEMENTO ACTIVO: Vehículos */}
            <li>
              <button className="w-full flex items-center gap-3 px-6 py-3 bg-blue-50 border-r-4 border-[#3779CB] text-[#3779CB] font-semibold transition-colors">
                <Truck className="w-5 h-5" /> Vehículos
              </button>
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
        
        {/* HEADER (Actualizado a 'Vehículos') */}
        <header className="h-20 bg-white flex items-center justify-between px-8 shadow-sm z-10 border-b border-gray-200 shrink-0">
          <h2 className="text-2xl font-bold text-black tracking-wide">
            Vehículos
          </h2>
          <button className="relative p-2 text-gray-600 hover:bg-slate-100 rounded-full transition-colors">
            <Bell className="w-6 h-6" />
            <span className="absolute top-1 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </header>

        {/* CONTENIDO SCROLLABLE (Tarjetas de Vehículos) */}
        <main className="flex-1 overflow-y-auto p-8 w-full">
          
          {/* Barra de Búsqueda y Botón Nuevo */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            {/* Input de Búsqueda con Icono */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar"
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3779CB] shadow-sm transition-all"
              />
            </div>

            {/* Botón Nuevo Vehículo */}
            <button className="flex items-center justify-center gap-2 bg-[#6870C4] hover:bg-[#565CA8] text-white px-5 py-2.5 rounded-lg shadow-sm transition-colors font-medium">
              <Plus className="w-5 h-5" />
              Nuevo vehículo
            </button>
          </div>

          {/* Grid de 6 Tarjetas */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8 w-full">
            {vehiculosTemp.map((vehiculo) => (
              <div key={vehiculo.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md transition-shadow cursor-pointer">
                
                {/* Espacio reservado para la foto del vehículo */}
                <div className="bg-gray-100 rounded-lg h-48 w-full flex items-center justify-center mb-5 border border-gray-200">
                  <ImageIcon className="w-16 h-16 text-gray-300" />
                </div>
                
                {/* Textos de la tarjeta */}
                <h3 className="text-xl font-bold text-[#1A2847] mb-2">{vehiculo.id}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {vehiculo.content}
                </p>
              </div>
            ))}
          </div>

          {/* Paginación Base */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 pb-4">
            <button className="px-3 py-1 hover:text-gray-800 transition-colors">&larr; Previous</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md bg-[#6870C4] text-white font-medium shadow-sm">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-200 transition-colors">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-200 transition-colors">3</button>
            <span>...</span>
            <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-200 transition-colors">67</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-200 transition-colors">68</button>
            <button className="px-3 py-1 hover:text-gray-800 transition-colors">Next &rarr;</button>
          </div>

        </main>
      </div>
      
    </div>
  );
}