import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Image as ImageIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Importamos el servicio y la interfaz asegurando el uso de 'type'
import { vehiculosService, type Vehiculo } from '../services/vehiculos.service';
import Layout from '../components/Layout';
import Button from '../components/Button';

export default function Vehiculos() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Efecto para cargar los vehículos al montar la pantalla
  useEffect(() => {
    const fetchVehiculos = async () => {
      try {
        // El servicio ya combina backend + localStorage internamente
        const data = await vehiculosService.getVehiculos();
        setVehiculos(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error al cargar la lista de vehículos, cargando respaldo local:", error);
        // Si hay un error de red o de servidor, cargamos lo que tengamos localmente
        const locales = JSON.parse(localStorage.getItem('tracefleet_vehiculos_locales') || '[]');
        setVehiculos(locales);
      } finally {
        setLoading(false);
      }
    };

    fetchVehiculos();
  }, []);

  return (
    <Layout title="Vehículos">
      <div className="flex flex-col h-full w-full">
          
          {/* Barra de Búsqueda y Botón Nuevo */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-text-muted" />
              </div>
              <input
                type="text"
                placeholder="Buscar"
                className="block w-full pl-10 pr-3 py-2.5 border border-border rounded-lg leading-5 bg-surface text-text-heading placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary shadow-sm transition-all"
              />
            </div>

            <Button 
              onClick={() => navigate('/vehiculos/nuevo')}
              className="px-5 py-2.5">
              <Plus className="w-5 h-5" />
              Nuevo vehículo
            </Button>
          </div>

          {/* Grid de Tarjetas o Estado de Carga */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <span className="text-gray-500 font-medium text-lg">Cargando catálogo de vehículos...</span>
            </div>
          ) : vehiculos.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <span className="text-gray-500 font-medium text-lg">No hay vehículos registrados en la empresa.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8 w-full">
              {vehiculos.map((vehiculo) => (
                <div 
                  key={vehiculo.id} 
                  className="bg-surface rounded-xl shadow-sm border border-border p-6 flex flex-col hover:shadow-md transition-shadow cursor-pointer relative"
                >
                  {/* Indicador visual de estado operativo (Gestalt: Visibilidad rápida) */}
                  <div className={`absolute top-4 right-4 w-3 h-3 rounded-full border-2 border-surface shadow-sm ${vehiculo.estadoOperativo ? 'bg-green-500' : 'bg-red-500'}`} title={vehiculo.estadoOperativo ? "Operativo" : "En Mantenimiento / Baja"}></div>
                  
                  {/* Foto del vehículo o Placeholder */}
                  <div className="bg-card rounded-lg h-48 w-full flex items-center justify-center mb-5 border border-border overflow-hidden">
                    {vehiculo.imagenUrl ? (
                      <img src={vehiculo.imagenUrl} alt={`Vehículo ${vehiculo.placa}`} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-16 h-16 text-gray-300" />
                    )}
                  </div>
                  
                  {/* Textos de la tarjeta: Placa - Marca */}
                  <h3 className="text-xl font-bold text-text-heading mb-2 uppercase">
                    {vehiculo.placa} {vehiculo.marca ? `- ${vehiculo.marca}` : ''}
                  </h3>
                  
                  {/* Descripción: Tipo de vehículo */}
                  <p className="text-text-muted text-sm leading-relaxed capitalize">
                    {vehiculo.tipo}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Paginación Base */}
          <div className="flex items-center justify-center gap-2 text-sm text-text-muted pb-4 mt-auto">
            <button className="px-3 py-1 hover:text-text-heading transition-colors">&larr; Previous</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md bg-primary text-text-on-primary font-bold shadow-sm">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-card text-text-heading transition-colors">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-card text-text-heading transition-colors">3</button>
            <span>...</span>
            <button className="px-3 py-1 hover:text-text-heading transition-colors">Next &rarr;</button>
          </div>

      </div>
    </Layout>
  );
}