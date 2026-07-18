/**
 * Tipos de la API REST de TraceFleet
 *
 * Define todos los modelos de datos y DTOs utilizados en la comunicación
 * con el backend (http://localhost:3000).
 *
 * Validates: Requirements 1.2, 2.3, 4.3, 6.3
 */

// ─── Enumeraciones ───────────────────────────────────────────────────────────

export type RolUsuario = 'ADMIN' | 'GERENTE' | 'CHOFER';

export type EstadoViaje = 'EN_RUTA' | 'FINALIZADO' | 'RETRASADO';

export type TipoCombustible = 'ECO' | 'SUPER' | 'DIESEL';

export type EstadoCombustible = 'OK' | 'ANOMALIA';

// ─── Modelos de dominio ───────────────────────────────────────────────────────

export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  rol: RolUsuario;
  estadoActivo: boolean;
  empresaId: string;
  empresa?: { id: string; nombre: string };
}

export interface Viaje {
  id: string;
  vehiculoId: string;
  choferId: string;
  origen: string;
  destino: string;
  estado: EstadoViaje;
  fechaSalida: string;       // ISO date string
  fechaLlegada?: string;     // ISO date string, opcional
  tipoCarga?: string;
  cantidadCarga?: number;
  unidadMedida?: string;
  ingresoServicio?: number;
}

export interface RegistroCombustible {
  id: string;
  vehiculoId: string;
  choferId: string;
  viajeId?: string;
  fecha: string;             // ISO date string
  estacion?: string;
  tipoCombustible: TipoCombustible;
  galones: number;
  costoTotal: number;
  distancia: number;         // lectura del odómetro en km
  estado: EstadoCombustible;
}

export interface GastoExtra {
  id: string;
  vehiculoId: string;
  choferId: string;
  viajeId?: string;
  fecha: string;             // ISO date string
  categoria: string;
  monto: number;
  descripcion?: string;
}

// ─── DTOs para creación / actualización ──────────────────────────────────────

export interface CreateCombustibleDto {
  vehiculoId: string;
  choferId: string;
  viajeId: string;
  tipoCombustible: TipoCombustible;
  galones: number;
  costoTotal: number;
  distancia: number;
  estacion?: string;
  fecha?: string;            // ISO date string; default: hoy
}

export interface CreateGastoDto {
  vehiculoId: string;
  choferId: string;
  viajeId: string;
  categoria: string;
  monto: number;
  descripcion?: string;
  fecha?: string;            // ISO date string; default: hoy
}
