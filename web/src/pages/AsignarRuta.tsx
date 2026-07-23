import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Save, Map as MapIcon } from 'lucide-react';
import { rutasService } from '../services/rutas.service';

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
  const [conductoresList, setConductoresList] = useState<any[]>([]);
  const [vehiculosList, setVehiculosList] = useState<any[]>(localStorage.getItem('tracefleet_vehiculos_locales') ? JSON.parse(localStorage.getItem('tracefleet_vehiculos_locales')!) : []);

  // Cargamos los vehículos y conductores reales guardados localmente
  useEffect(() => {
    const vehiculosLocales = JSON.parse(localStorage.getItem('tracefleet_vehiculos_locales') || '[]');
    const vehiculosDefinitivos = vehiculosLocales.length > 0 ? vehiculosLocales : [
      { id: '1', placa: 'ABC-1234', marca: 'Hino' },
      { id: '2', placa: 'XYZ-9876', marca: 'Volvo' }
    ];
    setVehiculosList(vehiculosDefinitivos);

    const conductoresLocales = JSON.parse(localStorage.getItem('tracefleet_conductores_locales') || '[]');
    const conductoresDefinitivos = conductoresLocales.length > 0 ? conductoresLocales : [
      { id: '1', nombre: 'Juan Pérez' },
      { id: '2', nombre: 'Carlos Mendoza' }
    ];
    setConductoresList(conductoresDefinitivos);
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
    <div className="flex h-screen bg-[#E2E8F0] font-sans">
      <div className="flex-1 flex flex-col overflow-hidden p-8">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-600 hover:text-[#3779CB] mb-6 transition-colors w-fit font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver a Rutas
        </button>

        <div className="bg-white flex-1 rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4">
            <MapPin className="text-[#3779CB] w-8 h-8" />
            <h2 className="text-2xl font-bold text-[#1A2847]">Asignar Nueva Ruta</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="conductorId" className="font-semibold text-gray-700">Seleccionar Conductor *</label>
                    <select
                      id="conductorId"
                      name="conductorId"
                      value={formData.conductorId}
                      onChange={handleChange}
                      className="border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3779CB] focus:border-transparent bg-white"
                      required
                    >
                      <option value="" disabled>-- Elige un conductor --</option>
                      {conductoresList.map(c => (
                        <option key={c.id} value={c.id}>{c.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="vehiculoId" className="font-semibold text-gray-700">Seleccionar Vehículo *</label>
                    <select
                      id="vehiculoId"
                      name="vehiculoId"
                      value={formData.vehiculoId}
                      onChange={handleChange}
                      className="border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3779CB] focus:border-transparent bg-white"
                      required
                    >
                      <option value="" disabled>-- Elige un vehículo --</option>
                      {vehiculosList.map(v => (
                        <option key={v.id} value={v.id}>{v.placa} - {v.marca}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="origen" className="font-semibold text-gray-700">Punto de Origen *</label>
                    <input
                      type="text"
                      id="origen"
                      name="origen"
                      value={formData.origen}
                      onChange={handleChange}
                      placeholder="Ej: Bodega Principal, Guayaquil"
                      className="border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3779CB] focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="destino" className="font-semibold text-gray-700">Punto de Destino *</label>
                    <input
                      type="text"
                      id="destino"
                      name="destino"
                      value={formData.destino}
                      onChange={handleChange}
                      placeholder="Ej: Centro de Distribución, Quito"
                      className="border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3779CB] focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="notas" className="font-semibold text-gray-700">Notas Adicionales (Opcional)</label>
                  <textarea
                    id="notas"
                    name="notas"
                    value={formData.notas}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Instrucciones especiales para el conductor, carga delicada, etc."
                    className="border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3779CB] focus:border-transparent resize-none"
                  ></textarea>
                </div>

                <div className="pt-6 flex justify-start">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-[#5B6B98] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#4A577C] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-5 h-5" />
                    {isSubmitting ? 'Asignando...' : 'Asignar e Iniciar Viaje'}
                  </button>
                </div>
              </form>
            </div>

            <div className="lg:col-span-1">
              <label className="font-semibold text-gray-700 block mb-2">Vista Previa de Ruta</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl h-full min-h-[300px] flex flex-col items-center justify-center bg-gray-50 text-gray-400">
                <MapIcon className="w-16 h-16 mb-4 text-[#3779CB] opacity-40" />
                <span className="font-medium text-gray-600">Integración de Mapas</span>
                <span className="text-sm mt-2 text-gray-400 text-center px-6">
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