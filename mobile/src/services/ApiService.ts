/**
 * ApiService — Cliente HTTP para el backend REST de TraceFleet
 *
 * Instancia de Axios con:
 *   - baseURL apuntando al backend en localhost:3000
 *   - Interceptor de request: agrega JWT en el header Authorization
 *   - Interceptor de response: detecta 401 y dispara logout automático
 *
 * Validates: Requirements 2.1, 3.1, 4.1, 4.2, 5.2, 5.3, 6.1, 6.2, 7.2, 7.3
 */

import axios from 'axios';
import { AuthService } from './AuthService';
import type {
  Viaje,
  RegistroCombustible,
  GastoExtra,
  CreateCombustibleDto,
  CreateGastoDto,
} from '../types/api';

// ─── Instancia Axios ──────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

// ─── Request interceptor: añade JWT ──────────────────────────────────────────

api.interceptors.request.use(async (config) => {
  const token = await AuthService.getPersistedToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor: maneja 401 ────────────────────────────────────────

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    const axiosError = error as { response?: { status?: number } };
    if (axiosError.response?.status === 401) {
      await AuthService.logout();
    }
    return Promise.reject(error);
  },
);

// ─── Funciones de acceso a la API ─────────────────────────────────────────────

// — Viajes —

/** Obtiene todos los viajes. Filtra por choferId en la pantalla. */
async function getViajes(): Promise<Viaje[]> {
  const { data } = await api.get<Viaje[]>('/viajes');
  return data;
}

/** Obtiene el detalle de un viaje por su id. */
async function getViajeById(id: string): Promise<Viaje> {
  const { data } = await api.get<Viaje>(`/viajes/${id}`);
  return data;
}

/** Actualiza parcialmente un viaje (PATCH /viajes/:id). */
async function updateViaje(
  id: string,
  payload: Partial<Omit<Viaje, 'id'>>,
): Promise<Viaje> {
  const { data } = await api.patch<Viaje>(`/viajes/${id}`, payload);
  return data;
}

/** Finaliza un viaje activo (POST /viajes/:id/finalizar). */
async function finalizarViaje(id: string): Promise<Viaje> {
  const { data } = await api.post<Viaje>(`/viajes/${id}/finalizar`);
  return data;
}

// — Combustible —

/** Obtiene todos los registros de combustible del chofer. */
async function getCombustible(): Promise<RegistroCombustible[]> {
  const { data } = await api.get<RegistroCombustible[]>('/combustible');
  return data;
}

/** Crea un nuevo registro de combustible. */
async function createCombustible(
  payload: CreateCombustibleDto,
): Promise<RegistroCombustible> {
  const { data } = await api.post<RegistroCombustible>('/combustible', payload);
  return data;
}

/** Actualiza parcialmente un registro de combustible existente. */
async function updateCombustible(
  id: string,
  payload: Partial<CreateCombustibleDto>,
): Promise<RegistroCombustible> {
  const { data } = await api.patch<RegistroCombustible>(
    `/combustible/${id}`,
    payload,
  );
  return data;
}

// — Gastos extra —

/** Obtiene todos los gastos extra del chofer. */
async function getGastos(): Promise<GastoExtra[]> {
  const { data } = await api.get<GastoExtra[]>('/gastos');
  return data;
}

/** Crea un nuevo gasto extra. */
async function createGasto(payload: CreateGastoDto): Promise<GastoExtra> {
  const { data } = await api.post<GastoExtra>('/gastos', payload);
  return data;
}

/** Actualiza parcialmente un gasto extra existente. */
async function updateGasto(
  id: string,
  payload: Partial<CreateGastoDto>,
): Promise<GastoExtra> {
  const { data } = await api.patch<GastoExtra>(`/gastos/${id}`, payload);
  return data;
}

// ─── Exportación del servicio ─────────────────────────────────────────────────

export const ApiService = {
  // Viajes
  getViajes,
  getViajeById,
  updateViaje,
  finalizarViaje,
  // Combustible
  getCombustible,
  createCombustible,
  updateCombustible,
  // Gastos
  getGastos,
  createGasto,
  updateGasto,
};
