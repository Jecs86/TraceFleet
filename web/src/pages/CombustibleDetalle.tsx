import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Truck, Map, Droplet, 
  Wrench, FileText, Folder, Settings, 
  Bell, UserCircle, Image as ImageIcon, ZoomIn, 
  AlertTriangle, Check, MessageSquare, X, CheckCircle
} from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import logoVertical from '../assets/images/logo-vertical.png';

// Importamos el servicio y las interfaces
import { combustibleDetalleService, type SolicitudCombustibleDetalle } from '../services/combustible-detalle.service';

export default function CombustibleDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [solicitud, setSolicitud] = useState<SolicitudCombustibleDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false); // Para deshabilitar botones al enviar acción

  useEffect(() => {
    const fetchDetalles = async () => {
      try {
        if (id) {
          // const data = await combustibleDetalleService.getSolicitudById(id);
          // setSolicitud(data);
        }
      } catch (error) {
        console.error("Error al cargar detalles de la solicitud de combustible:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetalles();
  }, [id]);

  // Manejador genérico para los botones de acción
  const handleAccion = async (nuevoEstado: 'APROBADA' | 'ACLARACION' | 'RECHAZADA') => {
    if (!id) return;
    try {
      setActionLoading(true);
      await combustibleDetalleService.actualizarEstadoSolicitud(id, nuevoEstado);
      // Opcional: Podrías mostrar un toast/notificación de éxito aquí
      // Regresamos al listado principal después de procesar la solicitud
      navigate('/combustible');
    } catch (error) {
      console.error(`Error al intentar marcar la solicitud como ${nuevoEstado}:`, error);
      alert('Hubo un error al procesar la solicitud. Por favor intenta de nuevo.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#E2E8F0]">
        <span className="text-gray-500 font-medium text-lg">Cargando detalles de la auditoría...</span>
      </div>
    );
  }

  if (!solicitud) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#E2E8F0]">
        <span className="text-red-500 font-medium text-lg">No se encontró la solicitud de combustible.</span>
      </div>
    );
  }

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
            {/* Activo en Combustible */}
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
          <h2 className="text-2xl font-bold text-black tracking-wide flex items-center gap-2 uppercase">
            <Link to="/combustible" className="hover:text-[#3779CB] transition-colors">Combustible</Link> 
            <span className="text-gray-400 normal-case">&gt;</span> 
            <span className="capitalize">{solicitud.choferNombre}</span> / {solicitud.vehiculoPlaca}
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
              <div className="flex gap-6 mb-10 overflow-x-auto pb-2">
                
                {/* Imagen 1: Factura */}
                <div className="relative bg-gray-100 rounded-xl h-48 w-40 flex items-center justify-center border border-gray-200 shadow-inner group cursor-pointer hover:bg-gray-200 transition-colors shrink-0 overflow-hidden">
                  {solicitud.facturaUrl ? (
                    <img src={solicitud.facturaUrl} alt="Factura de combustible" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-12 h-12 text-gray-300" />
                  )}
                  <div className="absolute bottom-3 right-3 bg-white p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn className="w-5 h-5 text-gray-600" />
                  </div>
                </div>

                {/* Imagen 2: Evidencia Adicional (Tablero/Odómetro) */}
                <div className="relative bg-gray-100 rounded-xl h-48 w-40 flex items-center justify-center border border-gray-200 shadow-inner group cursor-pointer hover:bg-gray-200 transition-colors shrink-0 overflow-hidden">
                  {solicitud.evidenciaAdicionalUrls && solicitud.evidenciaAdicionalUrls.length > 0 ? (
                     <img src={solicitud.evidenciaAdicionalUrls[0]} alt="Odómetro / Tablero" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-12 h-12 text-gray-300" />
                  )}
                  <div className="absolute bottom-3 right-3 bg-white p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn className="w-5 h-5 text-gray-600" />
                  </div>
                </div>

              </div>

              <h3 className="text-2xl font-bold text-[#1A2847] mb-6">Evidencia Extra</h3>
              
              {/* Reproductor de Audio */}
              <div className="flex flex-col gap-2 w-full max-w-sm">
                {solicitud.notaVozUrl ? (
                  <audio controls src={solicitud.notaVozUrl} className="w-full h-12 rounded-lg shadow-sm border border-gray-200 bg-slate-50 outline-none">
                    Tu navegador no soporta el elemento de audio.
                  </audio>
                ) : (
                  <div className="w-full h-12 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center">
                    <span className="text-gray-400 italic text-sm">Sin nota de voz adjunta</span>
                  </div>
                )}
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
                    <span className="text-2xl font-extrabold text-[#1A2847]">{solicitud.auditoria.kmRuta}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 font-medium">Galones</span>
                    <span className="text-2xl font-extrabold text-[#1A2847]">{solicitud.auditoria.galones}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 font-medium">Valor total</span>
                    <span className="text-2xl font-extrabold text-[#1A2847]">${solicitud.auditoria.valorTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Caja de Cálculo */}
                <div className="bg-slate-100 rounded-xl p-6 shadow-inner border border-gray-200 flex flex-col gap-2">
                  <span className="text-xl font-bold text-[#1A2847] mb-1">Calculo del Auditor:</span>
                  <span className="text-gray-600 font-medium">Consumo esperado: {solicitud.auditoria.consumoEsperado} Gal</span>
                  
                  {/* Renderizado condicional basado en la diferencia detectada */}
                  {solicitud.auditoria.diferenciaGalones > 0 ? (
                    <div className="flex items-center gap-2 text-red-500 mt-2 font-bold text-lg">
                      <AlertTriangle className="w-6 h-6" />
                      <span>Diferencia detectada: +{solicitud.auditoria.diferenciaGalones} Gal</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-green-600 mt-2 font-bold text-lg">
                      <CheckCircle className="w-6 h-6" />
                      <span>Consumo dentro de lo esperado</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex flex-wrap items-center gap-4 mt-auto">
                <button 
                  onClick={() => handleAccion('APROBADA')}
                  disabled={actionLoading}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                >
                  <Check className="w-5 h-5" /> Aprobar
                </button>
                <button 
                  onClick={() => handleAccion('ACLARACION')}
                  disabled={actionLoading}
                  className="flex items-center gap-2 bg-[#3779CB] hover:bg-[#2c62a6] disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                >
                  <MessageSquare className="w-5 h-5" /> Pedir Aclaración
                </button>
                <button 
                  onClick={() => handleAccion('RECHAZADA')}
                  disabled={actionLoading}
                  className="flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                >
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