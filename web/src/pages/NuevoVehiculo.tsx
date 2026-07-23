import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Car, Save, Image as ImageIcon } from 'lucide-react';
import { vehiculosService } from '../services/vehiculos.service'; // Importamos el servicio

export default function NuevoVehiculo() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    placa: '',
    marca: '',
    modelo: '',
    anio: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await vehiculosService.crearVehiculo(formData);
      alert("¡Vehículo registrado con éxito!");
      navigate('/vehiculos'); 
    } catch (error) {
      alert("Hubo un error al guardar el vehículo. Revisa la consola para más detalles.");
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
          Volver a Vehículos
        </button>

        <div className="bg-white flex-1 rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4">
            <Car className="text-[#3779CB] w-8 h-8" />
            <h2 className="text-2xl font-bold text-[#1A2847]">Registrar Nuevo Vehículo</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div className="flex flex-col gap-2">
                    <label htmlFor="placa" className="font-semibold text-gray-700">Placa *</label>
                    <input
                      type="text"
                      id="placa"
                      name="placa"
                      value={formData.placa}
                      onChange={handleChange}
                      placeholder="Ej: ABC-1234"
                      className="border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3779CB] focus:border-transparent uppercase"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="marca" className="font-semibold text-gray-700">Marca *</label>
                    <input
                      type="text"
                      id="marca"
                      name="marca"
                      value={formData.marca}
                      onChange={handleChange}
                      placeholder="Ej: Hino, Volvo, Mercedes..."
                      className="border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3779CB] focus:border-transparent capitalize"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="modelo" className="font-semibold text-gray-700">Modelo *</label>
                    <input
                      type="text"
                      id="modelo"
                      name="modelo"
                      value={formData.modelo}
                      onChange={handleChange}
                      placeholder="Ej: Serie 500"
                      className="border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3779CB] focus:border-transparent capitalize"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="anio" className="font-semibold text-gray-700">Año de Fabricación</label>
                    <input
                      type="number"
                      id="anio"
                      name="anio"
                      value={formData.anio}
                      onChange={handleChange}
                      placeholder="Ej: 2024"
                      min="1990"
                      max="2027"
                      className="border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3779CB] focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="pt-8 flex justify-start">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-[#5B6B98] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#4A577C] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-5 h-5" />
                    {isSubmitting ? 'Guardando...' : 'Guardar Vehículo'}
                  </button>
                </div>
              </form>
            </div>

            <div className="lg:col-span-1">
              <label className="font-semibold text-gray-700 block mb-2">Fotografía (Opcional)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl h-64 flex flex-col items-center justify-center bg-gray-50 text-gray-400 hover:bg-gray-100 transition-colors cursor-pointer">
                <ImageIcon className="w-12 h-12 mb-3 text-[#3779CB] opacity-60" />
                <span className="font-medium text-gray-600">Subir imagen</span>
                <span className="text-sm mt-1 text-gray-400 text-center px-4">Arrastra una foto o haz clic para buscar</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}