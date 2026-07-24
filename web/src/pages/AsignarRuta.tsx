import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Save, Map as MapIcon } from 'lucide-react';
import { rutasService } from '../services/rutas.service';
import { vehiculosService, type Vehiculo } from '../services/vehiculos.service';
import { conductoresService, type Conductor } from '../services/conductores.service';
import Button from '../components/Button';

export default function AsignarRuta() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    conductorId: '',
    vehiculoId: '',
    origen: '',
    destino: '',
    notas: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conductoresList, setConductoresList] = useState<Conductor[]>([]);
  const [vehiculosList, setVehiculosList] = useState<Vehiculo[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Cargamos vehículos y conductores desde el backend en paralelo
        const [vehiculosData, conductoresData] = await Promise.allSettled([
          vehiculosService.getVehiculos(),
          conductoresService.getDashboardData(),
        ]);

        if (vehiculosData.status === 'fulfilled') {
          // Solo vehículos operativos
          setVehiculosList(vehiculosData.value.filter(v => v.estadoOperativo));
        }
        if (conductoresData.status === 'fulfilled') {
          setConductoresList(conductoresData.value.directorio);
        }
      } catch (error) {
        console.error('Error cargando datos del formulario:', error);
      } finally {
        setLoadingData(false);
      }
    };

    cargarDatos();
  }, []);

  // Función handleChange que faltaba
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Función handleSubmit que faltaba
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await rutasService.asignarRuta(formData);
      alert("¡Ruta asignada con éxito!");
      navigate('/dashboard'); 
    } catch (error) {
      alert("Hubo un error al asignar la ruta. Revisa la consola.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-bg font-sans">
      <div className="flex-1 flex flex-col overflow-hidden p-8">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-text-muted hover:text-primary mb-6 transition-colors w-fit font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver a Rutas
        </button>

        <div className="bg-surface flex-1 rounded-xl shadow-sm border border-border p-8">
          <div className="flex items-center gap-3 mb-8 border-b border-divider pb-4">
            <MapPin className="text-primary w-8 h-8" />
            <h2 className="text-2xl font-bold text-text-heading">Asignar Nueva Ruta</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="conductorId" className="font-semibold text-text-muted">Seleccionar Conductor *</label>
                    <select
                      id="conductorId"
                      name="conductorId"
                      value={formData.conductorId}
                      onChange={handleChange}
                      className="border border-border bg-card text-text-heading rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                      disabled={loadingData}
                    >
                      <option value="" disabled>
                        {loadingData ? 'Cargando conductores...' : '-- Elige un conductor --'}
                      </option>
                      {conductoresList.map(c => (
                        <option key={c.id} value={c.id}>{c.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="vehiculoId" className="font-semibold text-text-muted">Seleccionar Vehículo *</label>
                    <select
                      id="vehiculoId"
                      name="vehiculoId"
                      value={formData.vehiculoId}
                      onChange={handleChange}
                      className="border border-border bg-card text-text-heading rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                      disabled={loadingData}
                    >
                      <option value="" disabled>
                        {loadingData ? 'Cargando vehículos...' : '-- Elige un vehículo --'}
                      </option>
                      {vehiculosList.map(v => (
                        <option key={v.id} value={v.id}>{v.placa}{v.marca ? ` - ${v.marca}` : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="origen" className="font-semibold text-text-muted">Punto de Origen *</label>
                    <input
                      type="text"
                      id="origen"
                      name="origen"
                      value={formData.origen}
                      onChange={handleChange}
                      placeholder="Ej: Bodega Principal, Guayaquil"
                      className="border border-border bg-card text-text-heading rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="destino" className="font-semibold text-text-muted">Punto de Destino *</label>
                    <input
                      type="text"
                      id="destino"
                      name="destino"
                      value={formData.destino}
                      onChange={handleChange}
                      placeholder="Ej: Centro de Distribución, Quito"
                      className="border border-border bg-card text-text-heading rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="notas" className="font-semibold text-text-muted">Notas Adicionales (Opcional)</label>
                  <textarea
                    id="notas"
                    name="notas"
                    value={formData.notas}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Instrucciones especiales para el conductor, carga delicada, etc."
                    className="border border-border bg-card text-text-heading rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  ></textarea>
                </div>

                <div className="pt-6 flex justify-start">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3"
                  >
                    <Save className="w-5 h-5" />
                    {isSubmitting ? 'Asignando...' : 'Asignar e Iniciar Viaje'}
                  </Button>
                </div>
              </form>
            </div>

            <div className="lg:col-span-1">
              <label className="font-semibold text-text-muted block mb-2">Vista Previa de Ruta</label>
              <div className="border-2 border-dashed border-border rounded-xl h-full min-h-[300px] flex flex-col items-center justify-center bg-card text-text-muted">
                <MapIcon className="w-16 h-16 mb-4 text-primary opacity-40" />
                <span className="font-medium text-text-heading">Integración de Mapas</span>
                <span className="text-sm mt-2 text-text-muted text-center px-6">
                  Aquí se mostrará la ruta calculada entre el origen y el destino una vez guardada.
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}