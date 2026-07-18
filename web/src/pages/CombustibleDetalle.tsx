import { 
  LayoutDashboard, Truck, Map, Droplet, 
  Wrench, FileText, Folder, Settings, 
  Bell, UserCircle, Image as ImageIcon, ZoomIn, 
  AlertTriangle, Check, MessageSquare, X 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import logoVertical from '../assets/images/logo-vertical.png';

export default function CombustibleDetalle() {
  return (
    <div className="flex h-screen bg-[#E2E8F0] font-sans w-full">
      
      {/* SIDEBAR (Mantenemos 'Combustible' como activo) */}
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
            {/* Activo */}
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
            Solicitud de Combustible Bryan S. / A#01
          </h2>
          <button className="relative p-2 text-gray-600 hover:bg-slate-100 rounded-full transition-colors">
            <Bell className="w-6 h-6" />
            <span className="absolute top-1 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </header>

        {/* CONTENIDO (Dos bloques principales) */}
        <main className="flex-1 overflow-y-auto p-8 flex justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-6xl">
            
            {/* BLOQUE IZQUIERDO: EVIDENCIAS */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 flex flex-col">
              
              <h3 className="text-2xl font-bold text-[#1A2847] mb-6">Evidencia Visual</h3>
              
              {/* Contenedores de Imágenes */}
              <div className="flex gap-6 mb-10">
                {/* Imagen 1 */}
                <div className="relative bg-gray-100 rounded-xl h-48 w-40 flex items-center justify-center border border-gray-200 shadow-inner group cursor-pointer hover:bg-gray-200 transition-colors">
                  <ImageIcon className="w-12 h-12 text-gray-300" />
                  <div className="absolute bottom-3 right-3 bg-white p-1.5 rounded-full shadow-md">
                    <ZoomIn className="w-5 h-5 text-gray-600" />
                  </div>
                </div>
                {/* Imagen 2 */}
                <div className="relative bg-gray-100 rounded-xl h-48 w-40 flex items-center justify-center border border-gray-200 shadow-inner group cursor-pointer hover:bg-gray-200 transition-colors">
                  <ImageIcon className="w-12 h-12 text-gray-300" />
                  <div className="absolute bottom-3 right-3 bg-white p-1.5 rounded-full shadow-md">
                    <ZoomIn className="w-5 h-5 text-gray-600" />
                  </div>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-[#1A2847] mb-6">Evidencia Extra</h3>
              
              {/* Reproductor de Audio (MP3/MP4) */}
              <div className="flex flex-col gap-2 w-full max-w-sm">
                {/* Etiqueta HTML5 nativa para audio. Soporta src="archivo.mp3" */}
                <audio controls className="w-full h-12 rounded-lg shadow-sm border border-gray-200 bg-slate-50 outline-none">
                  {/* <source src="ruta-al-audio.mp3" type="audio/mpeg" /> */}
                  Tu navegador no soporta el elemento de audio.
                </audio>
                <span className="text-sm text-gray-500 font-medium ml-1">Nota de voz del Conductor</span>
              </div>

            </div>


            {/* BLOQUE DERECHO: AUDITORÍA Y ACCIONES */}
            <div className="flex flex-col gap-6">
              
              {/* Caja de Auditoría */}
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 flex flex-col">
                <h3 className="text-2xl font-bold text-[#1A2847] mb-8">Auditoria</h3>
                
                {/* Estadísticas */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="flex flex-col">
                    <span className="text-gray-500 font-medium">Km Ruta</span>
                    <span className="text-2xl font-extrabold text-[#1A2847]">480</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 font-medium">Galones</span>
                    <span className="text-2xl font-extrabold text-[#1A2847]">120</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 font-medium">Valor total</span>
                    <span className="text-2xl font-extrabold text-[#1A2847]">$350</span>
                  </div>
                </div>

                {/* Caja de Cálculo (Con shadow-inner como pediste) */}
                <div className="bg-slate-100 rounded-xl p-6 shadow-inner border border-gray-200 flex flex-col gap-2">
                  <span className="text-xl font-bold text-[#1A2847] mb-1">Calculo del Auditor:</span>
                  <span className="text-gray-600 font-medium">Consumo esperado: 110 Gal</span>
                  <div className="flex items-center gap-2 text-red-500 mt-2 font-bold text-lg">
                    <AlertTriangle className="w-6 h-6" />
                    <span>Diferencia detectada: +10 Gal</span>
                  </div>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex flex-wrap items-center gap-4 mt-auto">
                <button className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                  <Check className="w-5 h-5" /> Aprobar
                </button>
                <button className="flex items-center gap-2 bg-[#3779CB] hover:bg-[#2c62a6] text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                  <MessageSquare className="w-5 h-5" /> Pedir Aclaración
                </button>
                <button className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                  <X className="w-5 h-5" /> Rechazar
                </button>
              </div>

            </div>

          </div>
        </main>
      </div>
    </div>
  );
}