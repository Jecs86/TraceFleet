/**
 * verify-endpoints.mjs
 *
 * Script de verificación completa de endpoints TraceFleet.
 * Lee las credenciales desde el .env del backend.
 *
 * Uso: node scripts/verify-endpoints.mjs
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Cargar .env manualmente (el script corre fuera de NestJS)
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../.env');
for (const line of readFileSync(envPath, 'utf8').split('\n')) {
  const match = line.match(/^([^#=]+)=["']?(.+?)["']?\s*$/);
  if (match) process.env[match[1].trim()] = match[2].trim();
}

const SUPABASE_URL      = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const API_BASE          = 'http://localhost:3000';
const ADMIN_EMAIL       = 'admin@tracefleet.com';
const ADMIN_PASSWORD    = 'TraceFleet@Admin2025!';

const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red   = (s) => `\x1b[31m${s}\x1b[0m`;
const cyan  = (s) => `\x1b[36m${s}\x1b[0m`;
const bold  = (s) => `\x1b[1m${s}\x1b[0m`;

let passed = 0;
let failed = 0;

function log(label, status, detail = '') {
  if (status === 'OK') {
    console.log(green(`  ✓ ${label}`) + (detail ? `  ${detail}` : ''));
    passed++;
  } else {
    console.log(red(`  ✗ ${label}`) + (detail ? `  ${detail}` : ''));
    failed++;
  }
}

async function api(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text; }
  return { status: res.status, body: json };
}

/**
 * Crea o actualiza un usuario en Supabase via Admin API.
 * email_confirm: true → no requiere confirmación por correo.
 */
async function upsertSupabaseUser(email, password, nombre) {
  // Buscar si ya existe
  const listRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?per_page=1000`, {
    headers: {
      'apikey': SUPABASE_SECRET_KEY,
      'Authorization': `Bearer ${SUPABASE_SECRET_KEY}`,
    },
  });
  const listJson = await listRes.json();
  const existing = (listJson.users || []).find(u => u.email === email);

  if (existing) {
    // Confirmar email y actualizar contraseña si ya existe
    await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${existing.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SECRET_KEY,
        'Authorization': `Bearer ${SUPABASE_SECRET_KEY}`,
      },
      body: JSON.stringify({ password, email_confirm: true }),
    });
    return existing.id;
  }

  const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SECRET_KEY,
      'Authorization': `Bearer ${SUPABASE_SECRET_KEY}`,
    },
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  const json = await createRes.json();
  if (!json.id) throw new Error(`No se pudo crear ${email}: ${JSON.stringify(json).substring(0, 120)}`);
  return json.id;
}

async function signinSupabase(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_SECRET_KEY },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!res.ok || !json.access_token) {
    throw new Error(`Signin fallido para ${email}: ${JSON.stringify(json).substring(0, 120)}`);
  }
  return { jwt: json.access_token, authId: json.user?.id };
}

async function main() {
  console.log(bold(cyan('\n═══════════════════════════════════════════════')));
  console.log(bold(cyan('   TraceFleet — Verificación de Endpoints')));
  console.log(bold(cyan('═══════════════════════════════════════════════')));

  // ══════════════════════════════════════════════════════════════════════════
  // PASO 1 — Crear usuarios en Supabase Auth
  // ══════════════════════════════════════════════════════════════════════════
  console.log(bold('\n🔐 PASO 1 — Usuarios en Supabase Auth (Admin API)'));

  const adminAuthId = await upsertSupabaseUser(ADMIN_EMAIL, ADMIN_PASSWORD, 'Admin TraceFleet');
  log('Upsert admin@tracefleet.com', 'OK', adminAuthId);

  const gerenteAuthId = await upsertSupabaseUser('gerente@verificacion.com', 'Gerente@2025!', 'Gerente de Prueba');
  log('Upsert gerente@verificacion.com', 'OK', gerenteAuthId);

  const choferAuthId = await upsertSupabaseUser('chofer@verificacion.com', 'Chofer@2025!', 'Chofer de Prueba');
  log('Upsert chofer@verificacion.com', 'OK', choferAuthId);

  // ══════════════════════════════════════════════════════════════════════════
  // PASO 2 — Sincronizar ADMIN con BD + obtener JWT
  // ══════════════════════════════════════════════════════════════════════════
  console.log(bold('\n📋 PASO 2 — Sincronizar con BD local y obtener JWTs'));

  const syncAdmin = await api('POST', '/auth/setup-user', {
    authId: adminAuthId,
    correo: ADMIN_EMAIL,
    nombre: 'Administrador TraceFleet',
    rol: 'ADMIN',
  });
  log('POST /auth/setup-user (ADMIN)', syncAdmin.status <= 201 ? 'OK' : 'FAIL',
    syncAdmin.body?.id ?? JSON.stringify(syncAdmin.body).substring(0, 80));

  const { jwt: adminJwt } = await signinSupabase(ADMIN_EMAIL, ADMIN_PASSWORD);
  log('Signin ADMIN', adminJwt ? 'OK' : 'FAIL', 'JWT obtenido');

  // ── Verificar /auth/me ─────────────────────────────────────────────────────
  const meRes = await api('GET', '/auth/me', null, adminJwt);
  if (meRes.status === 200 && meRes.body?.rol === 'ADMIN') {
    log('GET /auth/me', 'OK', `rol: ${meRes.body.rol}, id: ${meRes.body.id}`);
  } else {
    log('GET /auth/me', 'FAIL', JSON.stringify(meRes.body).substring(0, 120));
    throw new Error('El token JWT no resuelve al usuario ADMIN correctamente');
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PASO 3 — Crear Empresa
  // ══════════════════════════════════════════════════════════════════════════
  console.log(bold('\n🏗  PASO 3 — Crear Empresa'));

  const empRes = await api('POST', '/empresas', {
    nombre: 'Transportes Verificación S.A.',
    tipoIndustria: 'Carga',
  }, adminJwt);
  log('POST /empresas', empRes.status === 201 ? 'OK' : 'FAIL',
    empRes.body?.id ?? JSON.stringify(empRes.body).substring(0, 80));
  if (!empRes.body?.id) throw new Error('No se pudo crear empresa');
  const empresa = empRes.body;

  // ══════════════════════════════════════════════════════════════════════════
  // PASO 4 — Sincronizar Gerente y Chofer bajo la empresa creada
  // ══════════════════════════════════════════════════════════════════════════
  console.log(bold('\n👥 PASO 4 — Sincronizar Gerente y Chofer'));

  const syncGerente = await api('POST', '/auth/setup-user', {
    authId: gerenteAuthId,
    correo: 'gerente@verificacion.com',
    nombre: 'Gerente de Prueba',
    rol: 'GERENTE',
    empresaId: empresa.id,
  });
  log('POST /auth/setup-user (GERENTE)', syncGerente.status <= 201 ? 'OK' : 'FAIL',
    syncGerente.body?.id ?? JSON.stringify(syncGerente.body).substring(0, 80));
  const gerente = syncGerente.body;

  const syncChofer = await api('POST', '/auth/setup-user', {
    authId: choferAuthId,
    correo: 'chofer@verificacion.com',
    nombre: 'Chofer de Prueba',
    rol: 'CHOFER',
    empresaId: empresa.id,
  });
  log('POST /auth/setup-user (CHOFER)', syncChofer.status <= 201 ? 'OK' : 'FAIL',
    syncChofer.body?.id ?? JSON.stringify(syncChofer.body).substring(0, 80));
  const chofer = syncChofer.body;

  // JWT del gerente para crear recursos bajo su empresa
  const { jwt: gerenteJwt } = await signinSupabase('gerente@verificacion.com', 'Gerente@2025!');
  log('Signin GERENTE', gerenteJwt ? 'OK' : 'FAIL', 'JWT obtenido');

  // ══════════════════════════════════════════════════════════════════════════
  // PASO 5 — Crear todas las demás entidades
  // ══════════════════════════════════════════════════════════════════════════
  console.log(bold('\n🏗  PASO 5 — Crear Vehículo, Documentos, Viaje, Combustible, Gastos, Mantenimiento'));

  // Vehículo (como gerente)
  const vehiculoRes = await api('POST', '/vehiculos', {
    placa: 'VER-001',
    tipo: 'Tanquero',
    marca: 'Volvo',
    estadoOperativo: true,
  }, gerenteJwt);
  log('POST /vehiculos', vehiculoRes.status === 201 ? 'OK' : 'FAIL',
    vehiculoRes.body?.id ?? JSON.stringify(vehiculoRes.body).substring(0, 80));
  if (!vehiculoRes.body?.id) throw new Error('No se pudo crear vehículo');
  const vehiculo = vehiculoRes.body;

  // DocumentoVehiculo
  const docRes = await api('POST', '/documentos-vehiculo', {
    vehiculoId: vehiculo.id,
    tipoDocumento: 'Póliza de Seguro',
    fechaEmision: '2025-01-01',
    fechaExpiracion: '2026-01-01',
    costo: 1500.00,
  }, gerenteJwt);
  log('POST /documentos-vehiculo', docRes.status === 201 ? 'OK' : 'FAIL',
    docRes.body?.id ?? JSON.stringify(docRes.body).substring(0, 80));
  const documento = docRes.body;

  // Viaje
  const viajeRes = await api('POST', '/viajes', {
    vehiculoId: vehiculo.id,
    choferId: chofer.id,
    origen: 'Guayaquil',
    destino: 'Quito',
    tipoCarga: 'Diesel',
    cantidadCarga: 10000,
    unidadMedida: 'Galones',
  }, gerenteJwt);
  log('POST /viajes', viajeRes.status === 201 ? 'OK' : 'FAIL',
    viajeRes.body?.id ?? JSON.stringify(viajeRes.body).substring(0, 80));
  const viaje = viajeRes.body;

  // RegistroCombustible #1 (base)
  const comb1Res = await api('POST', '/combustible', {
    vehiculoId: vehiculo.id,
    choferId: chofer.id,
    viajeId: viaje.id,
    tipoCombustible: 'DIESEL',
    galones: 80,
    costoTotal: 320.00,
    distancia: 15000,
    estacion: 'BASTION',
  }, gerenteJwt);
  log('POST /combustible (registro base)', comb1Res.status === 201 ? 'OK' : 'FAIL',
    comb1Res.body?.id ?? JSON.stringify(comb1Res.body).substring(0, 80));
  const combustible1 = comb1Res.body;

  // RegistroCombustible #2 — verifica cálculo de rendimiento
  const comb2Res = await api('POST', '/combustible', {
    vehiculoId: vehiculo.id,
    choferId: chofer.id,
    tipoCombustible: 'DIESEL',
    galones: 90,
    costoTotal: 360.00,
    distancia: 15900,   // +900 km → rendimiento = 900/90 = 10 km/gal
    estacion: 'AYACUCHO',
  }, gerenteJwt);
  const rendimiento = comb2Res.body?.rendimientoCalculado;
  log('POST /combustible (rendimiento calculado)',
    comb2Res.status === 201 && rendimiento !== null ? 'OK' : 'FAIL',
    rendimiento != null ? `${rendimiento.toFixed(2)} km/gal (esperado ~10)` : JSON.stringify(comb2Res.body).substring(0, 80));
  const combustible2 = comb2Res.body;

  // GastoExtra
  const gastoRes = await api('POST', '/gastos', {
    vehiculoId: vehiculo.id,
    choferId: chofer.id,
    viajeId: viaje.id,
    categoria: 'Peaje',
    monto: 45.50,
    descripcion: 'Peaje Durán-Guayaquil',
  }, gerenteJwt);
  log('POST /gastos', gastoRes.status === 201 ? 'OK' : 'FAIL',
    gastoRes.body?.id ?? JSON.stringify(gastoRes.body).substring(0, 80));
  const gasto = gastoRes.body;

  // Mantenimiento
  const mantRes = await api('POST', '/mantenimientos', {
    vehiculoId: vehiculo.id,
    tipo: 'Preventivo',
    descripcion: 'Cambio de aceite y filtros',
    taller: 'Taller Central Guayaquil',
    costo: 250.00,
    kilometraje: 15900,
  }, gerenteJwt);
  log('POST /mantenimientos', mantRes.status === 201 ? 'OK' : 'FAIL',
    mantRes.body?.id ?? JSON.stringify(mantRes.body).substring(0, 80));
  const mantenimiento = mantRes.body;

  // ══════════════════════════════════════════════════════════════════════════
  // PASO 6 — GET all + GET one (como ADMIN ve todo)
  // ══════════════════════════════════════════════════════════════════════════
  console.log(bold('\n🔍 PASO 6 — Leer datos (como ADMIN — ve todas las empresas)'));

  const readChecks = [
    ['/empresas',            empresa.id],
    ['/usuarios',            chofer.id],
    ['/vehiculos',           vehiculo.id],
    ['/documentos-vehiculo', documento.id],
    ['/viajes',              viaje.id],
    ['/combustible',         combustible1.id],
    ['/gastos',              gasto.id],
    ['/mantenimientos',      mantenimiento.id],
  ];

  for (const [path, id] of readChecks) {
    const allRes = await api('GET', path, null, adminJwt);
    log(`GET ${path}`, allRes.status === 200 && Array.isArray(allRes.body) ? 'OK' : 'FAIL',
      `${allRes.body?.length ?? '?'} registros`);

    const oneRes = await api('GET', `${path}/${id}`, null, adminJwt);
    log(`GET ${path}/:id`, oneRes.status === 200 ? 'OK' : 'FAIL',
      oneRes.body?.id ?? JSON.stringify(oneRes.body).substring(0, 60));
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PASO 7 — PATCH (como ADMIN)
  // ══════════════════════════════════════════════════════════════════════════
  console.log(bold('\n✏️  PASO 7 — Modificar datos (PATCH como ADMIN)'));

  const patches = [
    ['/empresas',            empresa.id,        { nombre: 'Transportes Verificación MODIFICADA S.A.' }],
    ['/usuarios',            chofer.id,         { nombre: 'Chofer Modificado' }],
    ['/vehiculos',           vehiculo.id,       { marca: 'Mercedes-Benz' }],
    ['/documentos-vehiculo', documento.id,      { costo: 1800.00 }],
    ['/viajes',              viaje.id,          { estado: 'FINALIZADO' }],
    ['/combustible',         combustible1.id,   { estacion: 'MODIFICADA' }],
    ['/gastos',              gasto.id,          { monto: 55.00 }],
    ['/mantenimientos',      mantenimiento.id,  { taller: 'Taller Modificado' }],
  ];

  for (const [path, id, body] of patches) {
    const res = await api('PATCH', `${path}/${id}`, body, adminJwt);
    log(`PATCH ${path}/:id`, res.status === 200 ? 'OK' : 'FAIL',
      res.status !== 200 ? JSON.stringify(res.body).substring(0, 80) : JSON.stringify(body));
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PASO 8 — DELETE en orden inverso (como ADMIN)
  // ══════════════════════════════════════════════════════════════════════════
  console.log(bold('\n🗑  PASO 8 — Eliminar datos (DELETE, orden inverso)'));

  const deletes = [
    ['/mantenimientos',      mantenimiento.id],
    ['/gastos',              gasto.id],
    ['/combustible',         combustible2.id],
    ['/combustible',         combustible1.id],
    ['/viajes',              viaje.id],
    ['/documentos-vehiculo', documento.id],
    ['/vehiculos',           vehiculo.id],
    ['/usuarios',            chofer.id],
    ['/usuarios',            gerente.id],
    ['/empresas',            empresa.id],
  ];

  for (const [path, id] of deletes) {
    const res = await api('DELETE', `${path}/${id}`, null, adminJwt);
    log(`DELETE ${path}/${id.substring(0, 8)}…`, res.status === 200 ? 'OK' : 'FAIL',
      res.status !== 200 ? JSON.stringify(res.body).substring(0, 80) : '');
  }

  // ══════════════════════════════════════════════════════════════════════════
  // RESUMEN
  // ══════════════════════════════════════════════════════════════════════════
  console.log(bold(cyan('\n═══════════════════════════════════════════════')));
  console.log(bold(`  Resultados: ${green(passed + ' OK')}  ${failed > 0 ? red(failed + ' FAIL') : green('0 FAIL')}`));
  console.log(bold(cyan('═══════════════════════════════════════════════\n')));

  if (failed > 0) process.exit(1);
}

main().catch(err => {
  console.error(red('\n❌ Error fatal: ' + err.message));
  console.error(err.stack);
  process.exit(1);
});
