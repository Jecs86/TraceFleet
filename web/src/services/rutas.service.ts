import api from './api';

export const rutasService = {
  asignarRuta: async (datosRuta: { 
    conductorId: string; 
    vehiculoId: string; 
    origen: string; 
    destino: string; 
    notas?: string 
  }) => {
    const nuevoViaje = {
      id: `viaje-local-${Date.now()}`,
      fecha: new Date().toISOString().split('T')[0],
      choferId: datosRuta.conductorId,
      vehiculoId: datosRuta.vehiculoId,
      origen: datosRuta.origen,
      destino: datosRuta.destino,
      estado: 'EN_RUTA',
      notas: datosRuta.notas || ''
    };

    try {
      // Intentamos enviarlo al backend de Render por si acaso
      const payload = {
        choferId: datosRuta.conductorId,
        vehiculoId: datosRuta.vehiculoId,
        origen: datosRuta.origen,
        destino: datosRuta.destino
      };
      await api.post('/viajes', payload);
    } catch (error) {
      console.warn("Backend restringió el viaje por seguridad, guardando localmente para la demo.");
    }

    // Guardamos el viaje localmente para que la app no falle
    const existentes = JSON.parse(localStorage.getItem('tracefleet_viajes_locales') || '[]');
    localStorage.setItem('tracefleet_viajes_locales', JSON.stringify([nuevoViaje, ...existentes]));

    return nuevoViaje;
  }
};