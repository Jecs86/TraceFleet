import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Truck, Map, Droplet, 
  Wrench, FileText, Folder, Settings, 
  Bell, UserCircle, Image as ImageIcon
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import logoVertical from '../assets/images/logo-vertical.png';

// Importamos el servicio y la interfaz
import { vehiculoDetalleService, type VehiculoDetalle } from '../services/vehiculo-detalle.service';

export default function VehiculoDetalle() {
  const { id } = useParams<{ id: string }>(); // Extraemos el ID de la URL
  const [vehiculo, setVehiculo] = useState<VehiculoDetalle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetalles = async () => {
      try {
        if (id) {
          const data = await vehiculoDetalleService.getVehiculoCompleto(id);
          setVehiculo(data);
        }
      } catch (error) {
        console.error("Error al cargar detalles del vehículo:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetalles();
  }, [id]);

  // Lógica de presentación segura (mientras carga o si no existe)
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#E2E8F0]">
        <span className="text-gray-500 font-medium text-lg">Cargando detalles del vehículo...</span>
      </div>
    );
  }

  if (!vehiculo) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#E2E8F0]">
        <span className="text-red-500 font-medium text-lg">No se encontró el vehículo.</span>
      </div>
    );
  }

  // --- LÓGICA DE NEGOCIO PARA LA UI ---
  
  // 1. Evaluación del Seguro
  const estadoSeguro = vehiculoDetalleService.evaluarEstadoSeguro(vehiculo.documentos || []);

  // 2. Procesamiento de Historial de Mantenimientos
  const mantenimientosOrdenados = [...(vehiculo.mantenimientos || [])].sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );
  
  const ultimoMantenimiento = mantenimientosOrdenados[0];
  const textoMantenimiento = ultimoMantenimiento 
    ? new Date(ultimoMantenimiento.fecha).toLocaleDateString() 
    : 'Sin registro';

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
          <h2 className="text-2xl font-bold text-black tracking-wide flex items-center gap-2 uppercase">
            <Link to="/vehiculos" className="hover:text-[#3779CB] transition-colors">Vehículos</Link> 
            <span className="text-gray-400">&gt;</span> 
            {vehiculo.placa}
          </h2>
          <button className="relative p-2 text-gray-600 hover:bg-slate-100 rounded-full transition-colors">
            <Bell className="w-6 h-6" />
            <span className="absolute top-1 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </header>

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-1 overflow-y-auto p-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-6xl">
            
            {/* CAJA 1: Info del Vehículo */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 flex flex-col sm:flex-row items-center gap-8">
              <div className="bg-gray-100 rounded-lg h-40 w-40 flex items-center justify-center shrink-0 border border-gray-200 shadow-inner overflow-hidden">
                {vehiculo.imagenUrl ? (
                  <img src={vehiculo.imagenUrl} alt={`Foto de ${vehiculo.placa}`} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-12 h-12 text-gray-300" />
                )}
              </div>
              <div className="flex flex-col gap-4 text-lg">
                <div className="flex gap-4"><span className="font-bold w-20 text-[#1A2847]">Placa</span> <span className="text-gray-600 uppercase">{vehiculo.placa}</span></div>
                <div className="flex gap-4"><span className="font-bold w-20 text-[#1A2847]">Marca</span> <span className="text-gray-600 capitalize">{vehiculo.marca || 'N/A'}</span></div>
                <div className="flex gap-4"><span className="font-bold w-20 text-[#1A2847]">Modelo</span> <span className="text-gray-600 capitalize">{vehiculo.tipo}</span></div>
              </div>
            </div>

            {/* CAJA 2: Estados */}
            <div className="flex flex-col gap-4 justify-center">
              
              {/* Estado Operativo */}
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 flex items-center justify-between w-full max-w-md">
                <span className="font-bold text-[#1A2847] text-lg">Estado</span>
                <div className="flex items-center gap-3">
                  <span className="text-gray-600">{vehiculo.estadoOperativo ? 'Operativo' : 'Baja / Taller'}</span>
                  <div className={`w-5 h-5 rounded-full shadow-sm ${vehiculo.estadoOperativo ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>
              </div>
              
              {/* Estado Seguro */}
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 flex items-center justify-between w-full max-w-md">
                <span className="font-bold text-[#1A2847] text-lg">Seguro</span>
                <div className="flex items-center gap-3">
                  <span className="text-gray-600">{estadoSeguro.texto}</span>
                  <div className={`w-5 h-5 rounded-full shadow-sm ${estadoSeguro.operativo ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>
              </div>

              {/* Estado Mantenimiento (Última visita) */}
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 flex items-center justify-between w-full max-w-md">
                <span className="font-bold text-[#1A2847] text-lg">Mantenimiento</span>
                <div className="flex items-center gap-3">
                  <span className="text-gray-600">{textoMantenimiento}</span>
                  <div className={`w-5 h-5 rounded-full shadow-sm ${ultimoMantenimiento ? 'bg-blue-400' : 'bg-gray-300'}`}></div>
                </div>
              </div>
            </div>

            {/* CAJA 3: Historial */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 flex flex-col justify-between h-80">
              <div>
                <h3 className="text-2xl font-bold text-[#1A2847] mb-6">Historial</h3>
                <div className="flex flex-col gap-5 text-gray-600 font-medium">
                  {mantenimientosOrdenados.length > 0 ? (
                    // Mostramos solo los últimos 3 mantenimientos para no romper la UI
                    mantenimientosOrdenados.slice(0, 3).map((mant) => (
                      <div key={mant.id} className="flex justify-between items-center border-b border-gray-50 pb-2">
                        <span className="truncate pr-4">{mant.descripcion}</span> 
                        <span className="shrink-0">{new Date(mant.fecha).toLocaleDateString()}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-400 italic">No hay historial de mantenimiento registrado.</span>
                  )}
                </div>
              </div>
              <button className="bg-[#6870C4] hover:bg-[#565CA8] text-white font-medium py-2 px-6 rounded-lg self-start shadow-sm transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed">
                Ver historial completo
              </button>
            </div>

            {/* CAJA 4: Documentos */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 flex flex-col h-80">
              <h3 className="text-2xl font-bold text-[#1A2847] mb-8">Documentos</h3>
              
              <div className="flex justify-around items-center flex-1 flex-wrap gap-4 overflow-y-auto">
                {vehiculo.documentos && vehiculo.documentos.length > 0 ? (
                  vehiculo.documentos.map((doc) => (
                    <a 
                      key={doc.id}
                      href={doc.archivoUrl || '#'} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex flex-col items-center gap-2 cursor-pointer group"
                    >
                      <FileText className="w-10 h-10 text-gray-500 group-hover:text-[#3779CB] transition-colors" />
                      <span className="font-medium text-gray-700 group-hover:text-[#3779CB] transition-colors text-center text-sm capitalize">
                        {doc.tipoDocumento}
                      </span>
                    </a>
                  ))
                ) : (
                  <span className="text-gray-400 italic text-center w-full">Sin documentos adjuntos.</span>
                )}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}