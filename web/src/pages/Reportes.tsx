import { useState } from 'react';
import Layout from '../components/Layout';
import Button from '../components/Button';

export default function Reportes() {
  // Datos simulados (mocks) para que el gerente vea el potencial visual
  const [viajes] = useState([
    { id: '1', fecha: '2026-07-20', conductor: 'Juan Pérez', vehiculo: 'Hino 500 (ABC-1234)', origen: 'Bodega Guayaquil', destino: 'Ceibos Norte', estado: 'FINALIZADO', costo: '$45.00' },
    { id: '2', fecha: '2026-07-19', conductor: 'Carlos Rivas', vehiculo: 'Tanquero (GTI-1548)', origen: 'Refinería', destino: 'Estación Sur', estado: 'FINALIZADO', costo: '$120.00' },
    { id: '3', fecha: '2026-07-18', conductor: 'Miguel Castro', vehiculo: 'Furgón (XTR-999)', origen: 'Puerto Marítimo', destino: 'Bodega Durán', estado: 'FINALIZADO', costo: '$15.50' },
  ]);

  return (
    <Layout title="Reportes">
      <div className="w-full max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-text-heading">Historial de Viajes</h1>
          <Button variant="outline" className="px-4 py-2">
            Exportar Excel
          </Button>
        </div>

        <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-card border-b border-divider text-text-muted text-sm">
                <th className="p-4 font-semibold">Fecha</th>
                <th className="p-4 font-semibold">Conductor / Vehículo</th>
                <th className="p-4 font-semibold">Ruta (Origen - Destino)</th>
                <th className="p-4 font-semibold">Costo Operativo</th>
                <th className="p-4 font-semibold text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              {viajes.map((viaje) => (
                <tr key={viaje.id} className="border-b border-divider hover:bg-card transition-colors">
                  <td className="p-4 text-text-muted font-medium">{viaje.fecha}</td>
                  <td className="p-4">
                    <p className="font-bold text-text-heading text-sm">{viaje.conductor}</p>
                    <p className="text-xs text-text-muted">{viaje.vehiculo}</p>
                  </td>
                  <td className="p-4 text-sm text-text-muted">
                    <span className="font-semibold text-secondary">{viaje.origen}</span> → {viaje.destino}
                  </td>
                  <td className="p-4 text-text-muted font-medium">{viaje.costo}</td>
                  <td className="p-4 text-center">
                    <span className="bg-success/20 text-success text-xs font-bold px-3 py-1 rounded-full">
                      {viaje.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}