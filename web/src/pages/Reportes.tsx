import { useState } from 'react';

export default function Reportes() {
  // Datos simulados (mocks) para que el gerente vea el potencial visual
  const [viajes] = useState([
    { id: '1', fecha: '2026-07-20', conductor: 'Juan Pérez', vehiculo: 'Hino 500 (ABC-1234)', origen: 'Bodega Guayaquil', destino: 'Ceibos Norte', estado: 'FINALIZADO', costo: '$45.00' },
    { id: '2', fecha: '2026-07-19', conductor: 'Carlos Rivas', vehiculo: 'Tanquero (GTI-1548)', origen: 'Refinería', destino: 'Estación Sur', estado: 'FINALIZADO', costo: '$120.00' },
    { id: '3', fecha: '2026-07-18', conductor: 'Miguel Castro', vehiculo: 'Furgón (XTR-999)', origen: 'Puerto Marítimo', destino: 'Bodega Durán', estado: 'FINALIZADO', costo: '$15.50' },
  ]);

  return (
    <div className="p-8 w-full max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#1A2847]">Historial de Viajes</h1>
        <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50">
          Exportar Excel
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
              <th className="p-4 font-semibold">Fecha</th>
              <th className="p-4 font-semibold">Conductor / Vehículo</th>
              <th className="p-4 font-semibold">Ruta (Origen - Destino)</th>
              <th className="p-4 font-semibold">Costo Operativo</th>
              <th className="p-4 font-semibold text-center">Estado</th>
            </tr>
          </thead>
          <tbody>
            {viajes.map((viaje) => (
              <tr key={viaje.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="p-4 text-gray-700 font-medium">{viaje.fecha}</td>
                <td className="p-4">
                  <p className="font-bold text-[#1A2847] text-sm">{viaje.conductor}</p>
                  <p className="text-xs text-gray-500">{viaje.vehiculo}</p>
                </td>
                <td className="p-4 text-sm text-gray-700">
                  <span className="font-semibold text-blue-600">{viaje.origen}</span> → {viaje.destino}
                </td>
                <td className="p-4 text-gray-700 font-medium">{viaje.costo}</td>
                <td className="p-4 text-center">
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                    {viaje.estado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}