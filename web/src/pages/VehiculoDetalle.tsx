import React, { useState, useEffect } from 'react';
import { 
  FileText, Image as ImageIcon
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';

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
          // const data = await vehiculoDetalleService.getVehiculoCompleto(id);
          // setVehiculo(data);
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
      <div className="flex h-screen items-center justify-center bg-bg text-text-heading">
        <span className="font-medium text-lg">Cargando detalles del vehículo...</span>
      </div>
    );
  }

  if (!vehiculo) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg text-error">
        <span className="font-medium text-lg">No se encontró el vehículo.</span>
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
    <Layout title={`Vehículos > ${vehiculo.placa}`}>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-6xl">
            
            {/* CAJA 1: Info del Vehículo */}
            <div className="bg-surface rounded-xl shadow-md border border-border p-8 flex flex-col sm:flex-row items-center gap-8">
              <div className="bg-card rounded-lg h-40 w-40 flex items-center justify-center shrink-0 border border-border shadow-inner overflow-hidden">
                {vehiculo.imagenUrl ? (
                  <img src={vehiculo.imagenUrl} alt={`Foto de ${vehiculo.placa}`} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-12 h-12 text-text-muted" />
                )}
              </div>
              <div className="flex flex-col gap-4 text-lg">
                <div className="flex gap-4"><span className="font-bold w-20 text-text-heading">Placa</span> <span className="text-text-muted uppercase">{vehiculo.placa}</span></div>
                <div className="flex gap-4"><span className="font-bold w-20 text-text-heading">Marca</span> <span className="text-text-muted capitalize">{vehiculo.marca || 'N/A'}</span></div>
                <div className="flex gap-4"><span className="font-bold w-20 text-text-heading">Modelo</span> <span className="text-text-muted capitalize">{vehiculo.tipo}</span></div>
              </div>
            </div>

            {/* CAJA 2: Estados */}
            <div className="flex flex-col gap-4 justify-center">
              
              {/* Estado Operativo */}
              <div className="bg-surface rounded-xl shadow-md border border-border p-5 flex items-center justify-between w-full max-w-md">
                <span className="font-bold text-text-heading text-lg">Estado</span>
                <div className="flex items-center gap-3">
                  <span className="text-text-muted">{vehiculo.estadoOperativo ? 'Operativo' : 'Baja / Taller'}</span>
                  <div className={`w-5 h-5 rounded-full shadow-sm ${vehiculo.estadoOperativo ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>
              </div>
              
              {/* Estado Seguro */}
              <div className="bg-surface rounded-xl shadow-md border border-border p-5 flex items-center justify-between w-full max-w-md">
                <span className="font-bold text-text-heading text-lg">Seguro</span>
                <div className="flex items-center gap-3">
                  <span className="text-text-muted">{estadoSeguro.texto}</span>
                  <div className={`w-5 h-5 rounded-full shadow-sm ${estadoSeguro.operativo ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>
              </div>
 
              {/* Estado Mantenimiento (Última visita) */}
              <div className="bg-surface rounded-xl shadow-md border border-border p-5 flex items-center justify-between w-full max-w-md">
                <span className="font-bold text-text-heading text-lg">Mantenimiento</span>
                <div className="flex items-center gap-3">
                  <span className="text-text-muted">{textoMantenimiento}</span>
                  <div className={`w-5 h-5 rounded-full shadow-sm ${ultimoMantenimiento ? 'bg-blue-400' : 'bg-gray-300'}`}></div>
                </div>
              </div>
            </div>

            {/* CAJA 3: Historial */}
            <div className="bg-surface rounded-xl shadow-md border border-border p-8 flex flex-col justify-between h-80">
              <div>
                <h3 className="text-2xl font-bold text-text-heading mb-6">Historial</h3>
                <div className="flex flex-col gap-5 text-text-muted font-medium">
                  {mantenimientosOrdenados.length > 0 ? (
                    // Mostramos solo los últimos 3 mantenimientos para no romper la UI
                    mantenimientosOrdenados.slice(0, 3).map((mant) => (
                      <div key={mant.id} className="flex justify-between items-center border-b border-divider pb-2">
                        <span className="truncate pr-4">{mant.descripcion}</span> 
                        <span className="shrink-0">{new Date(mant.fecha).toLocaleDateString()}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-text-muted italic">No hay historial de mantenimiento registrado.</span>
                  )}
                </div>
              </div>
              <Button className="py-2 px-6 self-start mt-4">
                Ver historial completo
              </Button>
            </div>

            {/* CAJA 4: Documentos */}
            <div className="bg-surface rounded-xl shadow-md border border-border p-8 flex flex-col h-80">
              <h3 className="text-2xl font-bold text-text-heading mb-8">Documentos</h3>
              
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
                      <FileText className="w-10 h-10 text-text-muted group-hover:text-primary transition-colors" />
                      <span className="font-medium text-text-muted group-hover:text-primary transition-colors text-center text-sm capitalize">
                        {doc.tipoDocumento}
                      </span>
                    </a>
                  ))
                ) : (
                  <span className="text-text-muted italic text-center w-full">Sin documentos adjuntos.</span>
                )}
              </div>
            </div>

          </div>
    </Layout>
  );
}