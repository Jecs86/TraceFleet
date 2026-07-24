import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Save, Camera } from 'lucide-react';
import { conductoresService } from '../services/conductores.service'; // Importamos el servicio
import Button from '../components/Button';

export default function NuevoConductor() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    telefono: '',
    licencia: 'Tipo C'
  });
  
  // Estado para manejar la carga del botón
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Llamada real al backend
      await conductoresService.crearConductor(formData);
      alert("¡Conductor registrado con éxito!");
      navigate('/conductores'); // Redirección a la tabla
    } catch (error) {
      alert("Hubo un error al guardar el conductor. Revisa la consola para más detalles.");
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
          Volver a Conductores
        </button>

        <div className="bg-surface flex-1 rounded-xl shadow-sm border border-border p-8">
          <div className="flex items-center gap-3 mb-8 border-b border-divider pb-4">
            <UserPlus className="text-primary w-8 h-8" />
            <h2 className="text-2xl font-bold text-text-heading">Registrar Nuevo Conductor</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div className="flex flex-col gap-2">
                    <label htmlFor="nombre" className="font-semibold text-text-muted">Nombre Completo *</label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      placeholder="Ej: Juan Pérez"
                      className="border border-border bg-card text-text-heading rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent capitalize"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="correo" className="font-semibold text-text-muted">Correo Electrónico *</label>
                    <input
                      type="email"
                      id="correo"
                      name="correo"
                      value={formData.correo}
                      onChange={handleChange}
                      placeholder="ejemplo@correo.com"
                      className="border border-border bg-card text-text-heading rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="telefono" className="font-semibold text-text-muted">Teléfono</label>
                    <input
                      type="tel"
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      placeholder="Ej: 0991234567"
                      className="border border-border bg-card text-text-heading rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="licencia" className="font-semibold text-text-muted">Tipo de Licencia *</label>
                    <select
                      id="licencia"
                      name="licencia"
                      value={formData.licencia}
                      onChange={handleChange}
                      className="border border-border bg-card text-text-heading rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    >
                      <option value="Tipo C">Tipo C (Pesados y Taxis)</option>
                      <option value="Tipo D">Tipo D (Pasajeros)</option>
                      <option value="Tipo E">Tipo E (Camiones pesados y extra pesados)</option>
                      <option value="Tipo B">Tipo B (Autos livianos)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-8 flex justify-start">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3"
                  >
                    <Save className="w-5 h-5" />
                    {isSubmitting ? 'Guardando...' : 'Guardar Conductor'}
                  </Button>
                </div>
              </form>
            </div>

            <div className="lg:col-span-1">
              <label className="font-semibold text-text-muted block mb-2">Foto de Perfil (Opcional)</label>
              <div className="border-2 border-dashed border-border rounded-xl h-64 flex flex-col items-center justify-center bg-card text-text-muted hover:bg-surface transition-colors cursor-pointer">
                <div className="w-20 h-20 bg-border rounded-full flex items-center justify-center mb-4">
                  <Camera className="w-8 h-8 text-primary" />
                </div>
                <span className="font-medium text-text-heading">Subir fotografía</span>
                <span className="text-sm mt-1 text-text-muted text-center px-4">Formatos recomendados: JPG, PNG</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}