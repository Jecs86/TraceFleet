import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon, ZoomIn,
  AlertTriangle, Check, MessageSquare, X, CheckCircle
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

// Importamos el servicio y las interfaces
import { combustibleDetalleService, type SolicitudCombustibleDetalle } from '../services/combustible-detalle.service';
import Layout from '../components/Layout';
import Button from '../components/Button';

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
      <div className="flex h-screen items-center justify-center bg-bg text-text-heading">
        <span className="font-medium text-lg">Cargando detalles de la auditoría...</span>
      </div>
    );
  }

  if (!solicitud) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg text-error">
        <span className="font-medium text-lg">No se encontró la solicitud de combustible.</span>
      </div>
    );
  }

  return (
    <Layout title={`Combustible > ${solicitud.choferNombre} / ${solicitud.vehiculoPlaca}`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-6xl">

            {/* BLOQUE IZQUIERDO: EVIDENCIAS */}
            <div className="bg-surface rounded-xl shadow-md border border-border p-8 flex flex-col">

              <h3 className="text-2xl font-bold text-text-heading mb-6">Evidencia Visual</h3>

              {/* Contenedores de Imágenes */}
              <div className="flex gap-6 mb-10 overflow-x-auto pb-2">

                {/* Imagen 1: Factura */}
                <div className="relative bg-card rounded-xl h-48 w-40 flex items-center justify-center border border-border shadow-inner group cursor-pointer hover:bg-surface transition-colors shrink-0 overflow-hidden">
                  {solicitud.facturaUrl ? (
                    <img src={solicitud.facturaUrl} alt="Factura de combustible" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-12 h-12 text-text-muted" />
                  )}
                  <div className="absolute bottom-3 right-3 bg-surface border border-border p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn className="w-5 h-5 text-text-heading" />
                  </div>
                </div>

                {/* Imagen 2: Evidencia Adicional (Tablero/Odómetro) */}
                <div className="relative bg-card rounded-xl h-48 w-40 flex items-center justify-center border border-border shadow-inner group cursor-pointer hover:bg-surface transition-colors shrink-0 overflow-hidden">
                  {solicitud.evidenciaAdicionalUrls && solicitud.evidenciaAdicionalUrls.length > 0 ? (
                    <img src={solicitud.evidenciaAdicionalUrls[0]} alt="Odómetro / Tablero" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-12 h-12 text-text-muted" />
                  )}
                  <div className="absolute bottom-3 right-3 bg-surface border border-border p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn className="w-5 h-5 text-text-heading" />
                  </div>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-text-heading mb-6">Evidencia Extra</h3>

              {/* Reproductor de Audio */}
              <div className="flex flex-col gap-2 w-full max-w-sm">
                {solicitud.notaVozUrl ? (
                  <audio controls src={solicitud.notaVozUrl} className="w-full h-12 rounded-lg shadow-sm border border-border bg-card text-text-heading outline-none">
                    Tu navegador no soporta el elemento de audio.
                  </audio>
                ) : (
                  <div className="w-full h-12 rounded-lg border-2 border-dashed border-border bg-card flex items-center justify-center">
                    <span className="text-text-muted italic text-sm">Sin nota de voz adjunta</span>
                  </div>
                )}
                <span className="text-sm text-text-muted font-medium ml-1">Nota de voz del Conductor</span>
              </div>

            </div>


            {/* BLOQUE DERECHO: AUDITORÍA Y ACCIONES */}
            <div className="flex flex-col gap-6">

              {/* Caja de Auditoría */}
              <div className="bg-surface rounded-xl shadow-md border border-border p-8 flex flex-col">
                <h3 className="text-2xl font-bold text-text-heading mb-8">Auditoria</h3>

                {/* Estadísticas */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="flex flex-col">
                    <span className="text-text-muted font-medium">Km Ruta</span>
                    <span className="text-2xl font-extrabold text-text-heading">{solicitud.auditoria.kmRuta}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-text-muted font-medium">Galones</span>
                    <span className="text-2xl font-extrabold text-text-heading">{solicitud.auditoria.galones}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-text-muted font-medium">Valor total</span>
                    <span className="text-2xl font-extrabold text-text-heading">${solicitud.auditoria.valorTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Caja de Cálculo */}
                <div className="bg-card rounded-xl p-6 shadow-inner border border-border flex flex-col gap-2">
                  <span className="text-xl font-bold text-text-heading mb-1">Calculo del Auditor:</span>
                  <span className="text-text-muted font-medium">Consumo esperado: {solicitud.auditoria.consumoEsperado} Gal</span>

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
                <Button
                  onClick={() => handleAccion('APROBADA')}
                  disabled={actionLoading}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3"
                >
                  <Check className="w-5 h-5" /> Aprobar
                </Button>
                <Button
                  onClick={() => handleAccion('ACLARACION')}
                  disabled={actionLoading}
                  variant="secondary"
                  className="px-6 py-3"
                >
                  <MessageSquare className="w-5 h-5" /> Pedir Aclaración
                </Button>
                <Button
                  onClick={() => handleAccion('RECHAZADA')}
                  disabled={actionLoading}
                  variant="danger"
                  className="px-6 py-3"
                >
                  <X className="w-5 h-5" /> Rechazar
                </Button>
              </div>

            </div>
          </div>
    </Layout>
  );
}