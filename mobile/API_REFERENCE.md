# TraceFleet — Referencia de API

> **Base URL:** `http://localhost:3000` (desarrollo)  
> **Autenticación:** JWT Bearer Token emitido por Supabase Auth  
> **Header requerido:** `Authorization: Bearer <token>`

---

## Índice

1. [Autenticación y Seguridad](#1-autenticación-y-seguridad)
2. [Auth — `/auth`](#2-auth)
3. [Empresas — `/empresas`](#3-empresas)
4. [Usuarios — `/usuarios`](#4-usuarios)
5. [Vehículos — `/vehiculos`](#5-vehículos)
6. [Viajes — `/viajes`](#6-viajes)
7. [Combustible — `/combustible`](#7-combustible)
8. [Gastos Extra — `/gastos`](#8-gastos-extra)
9. [Mantenimientos — `/mantenimientos`](#9-mantenimientos)
10. [Precio Combustible — `/precio-combustible`](#10-precio-combustible)
11. [Documentos de Vehículo — `/documentos-vehiculo`](#11-documentos-de-vehículo)

---

## 1. Autenticación y Seguridad

### JWT

Todos los endpoints (excepto `POST /auth/setup-user`) requieren un token JWT válido de Supabase Auth en el header:

```
Authorization: Bearer eyJhbGciOiJFUzI1NiIsInR5cCI6...
```

El token es validado contra el JWKS de Supabase (`ES256`). Si el usuario no existe en la base de datos local o está inactivo (`estadoActivo = false`), la petición es rechazada con `401 Unauthorized`.

### Roles

| Rol | Descripción |
|-----|-------------|
| `ADMIN` | Acceso total a todas las empresas. Bypasea todas las restricciones de rol. |
| `GERENTE` | Acceso completo dentro de su empresa. |
| `CHOFER` | Acceso limitado dentro de su empresa. |

La mayoría de endpoints no requieren un rol específico; el aislamiento se aplica en la capa de servicio filtrando por `empresaId`. Solo `POST /precio-combustible` restringe explícitamente a `ADMIN` o `GERENTE`.

---

## 2. Auth

### `GET /auth/me`

Retorna el perfil del usuario autenticado.

**Requiere:** JWT válido  
**Respuesta:** Objeto `Usuario` con relación `empresa` incluida.

```json
{
  "id": "uuid",
  "nombre": "Juan Pérez",
  "correo": "juan@empresa.com",
  "rol": "GERENTE",
  "estadoActivo": true,
  "empresaId": "uuid",
  "empresa": { "id": "uuid", "nombre": "Logística del Sur S.A." }
}
```

---

### `POST /auth/setup-user`

Sincroniza un usuario de Supabase Auth con la base de datos local. Hace un upsert: si el usuario ya existe (por `authId` o `correo`) lo actualiza; si no, lo crea.

**Requiere:** Ningún token (endpoint público)

**Body:**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `authId` | `string` | ✅ | UUID del usuario en Supabase Auth (`auth.users.id`) |
| `correo` | `string` | ✅ | Email del usuario |
| `nombre` | `string` | ✅ | Nombre completo |
| `rol` | `ADMIN \| GERENTE \| CHOFER` | ❌ | Rol asignado. Default: `GERENTE` |
| `empresaId` | `string (UUID)` | ❌ | ID de empresa existente. Omitir para usuarios `ADMIN` |

**Ejemplo:**

```json
{
  "authId": "a1b2c3d4-e5f6-...",
  "correo": "gerente@flota.com",
  "nombre": "María González",
  "rol": "GERENTE",
  "empresaId": "f9e8d7c6-..."
}
```

> **Nota:** Si no se envía `empresaId` y el rol no es `ADMIN`, el sistema asigna automáticamente la primera empresa existente o crea una empresa demo.

---

### `POST /auth/setup-test-user` *(deprecated)*

Alias de `POST /auth/setup-user`. No usar en código nuevo.

---

## 3. Empresas

Gestión de empresas (tenants del SaaS). Todos los endpoints requieren JWT.

### `POST /empresas`

Crea una nueva empresa.

**Body:**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `nombre` | `string` | ✅ | Nombre de la empresa. Ej: `"Logística del Sur S.A."` |
| `tipoIndustria` | `string` | ❌ | Ej: `"Combustible"`, `"Pasajeros"`, `"Carga"` |

**Ejemplo:**

```json
{
  "nombre": "TransBuses S.A.",
  "tipoIndustria": "Pasajeros"
}
```

---

### `GET /empresas`

Lista las empresas accesibles para el usuario autenticado.

- `ADMIN`: ve todas las empresas.
- `GERENTE / CHOFER`: ve solo su empresa.

---

### `GET /empresas/:id`

Retorna una empresa por su UUID.

**Parámetro:** `id` — UUID de la empresa.

---

### `PATCH /empresas/:id`

Actualiza parcialmente una empresa.

**Parámetro:** `id` — UUID de la empresa.  
**Body:** Mismos campos que `POST /empresas`, todos opcionales.

---

### `DELETE /empresas/:id`

Elimina una empresa.

**Parámetro:** `id` — UUID de la empresa.

---

## 4. Usuarios

Gestión de usuarios dentro de una empresa. Todos los endpoints requieren JWT.

### `POST /usuarios`

Crea un nuevo usuario. El usuario creado queda asociado a la empresa del usuario autenticado.

**Body:**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `nombre` | `string` | ✅ | Nombre completo |
| `correo` | `string` | ✅ | Email válido |
| `authId` | `string` | ✅ | UUID de Supabase Auth |
| `rol` | `ADMIN \| GERENTE \| CHOFER` | ❌ | Default: determinado por servicio |
| `estadoActivo` | `boolean` | ❌ | Default: `true` |

**Ejemplo:**

```json
{
  "nombre": "Carlos Rivas",
  "correo": "carlos@flota.com",
  "authId": "abc-123-...",
  "rol": "CHOFER"
}
```

---

### `GET /usuarios`

Lista los usuarios de la empresa del usuario autenticado.

---

### `GET /usuarios/:id`

Retorna un usuario por UUID.

**Parámetro:** `id` — UUID del usuario.

---

### `PATCH /usuarios/:id`

Actualiza parcialmente un usuario.

**Parámetro:** `id` — UUID del usuario.  
**Body:** Mismos campos que `POST /usuarios`, todos opcionales.

---

### `DELETE /usuarios/:id`

Elimina o desactiva un usuario.

**Parámetro:** `id` — UUID del usuario.

---

## 5. Vehículos

Gestión de la flota. Todos los endpoints requieren JWT.

### `POST /vehiculos`

Crea un vehículo. Acepta solo JSON. Para subir la imagen usar `POST /vehiculos/:id/imagen` después.

**Body:**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `placa` | `string` | ✅ | Placa única. Ej: `"GBN8210"` |
| `tipo` | `string` | ✅ | Ej: `"Tanquero"`, `"Bus de pasajeros"`, `"Mula"` |
| `marca` | `string` | ❌ | Ej: `"Chevrolet"` |
| `estadoOperativo` | `boolean` | ❌ | Default: `true` |
| `empresaId` | `string (UUID)` | ❌ | Solo necesario si el usuario autenticado es `ADMIN` |

**Ejemplo:**

```json
{
  "placa": "GTI1548",
  "tipo": "Tanquero",
  "marca": "International",
  "estadoOperativo": true
}
```

---

### `GET /vehiculos`

Lista los vehículos de la empresa del usuario autenticado.

---

### `GET /vehiculos/:id`

Retorna un vehículo por UUID.

---

### `PATCH /vehiculos/:id`

Actualiza metadatos del vehículo. Acepta solo JSON (no imagen).

**Body:** Mismos campos que `POST /vehiculos`, todos opcionales.

---

### `DELETE /vehiculos/:id`

Elimina un vehículo.

---

### `POST /vehiculos/:id/imagen`

Sube o reemplaza la foto del vehículo en Supabase Storage.

**Content-Type:** `multipart/form-data`  
**Campo del archivo:** `imagen`  
**Tipos aceptados:** `image/jpeg`, `image/jpg`, `image/png`, `image/webp`, `image/heic`  
**Tamaño máximo:** 10 MB  
**Procesamiento:** La imagen se comprime automáticamente a WebP a 800px de ancho.

**Ejemplo con curl:**

```bash
curl -X POST http://localhost:3000/vehiculos/<id>/imagen \
  -H "Authorization: Bearer <token>" \
  -F "imagen=@foto_camion.jpg"
```

**Respuesta:** Objeto del vehículo actualizado con `imagenUrl` pública de Supabase Storage.

---

## 6. Viajes

Gestión de viajes y liquidaciones financieras. Todos los endpoints requieren JWT.

### `POST /viajes`

Crea un nuevo viaje.

**Body:**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `vehiculoId` | `string (UUID)` | ✅ | Vehículo asignado |
| `choferId` | `string (UUID)` | ✅ | Chofer asignado |
| `origen` | `string` | ✅ | Ciudad / punto de origen |
| `destino` | `string` | ✅ | Ciudad / punto de destino |
| `fechaSalida` | `string (ISO date)` | ❌ | Default: fecha actual |
| `fechaLlegada` | `string (ISO date)` | ❌ | Fecha estimada o real de llegada |
| `estado` | `string` | ❌ | `EN_RUTA` \| `FINALIZADO` \| `RETRASADO`. Default: `EN_RUTA` |
| `tipoCarga` | `string` | ❌ | Ej: `"Diesel"`, `"Pasajeros"`, `"Cacao"` |
| `cantidadCarga` | `number` | ❌ | Cantidad de carga |
| `unidadMedida` | `string` | ❌ | Ej: `"Galones"`, `"Personas"`, `"Toneladas"` |
| `ingresoServicio` | `number (> 0)` | ❌ | Ingreso por flete que paga el cliente |

**Ejemplo:**

```json
{
  "vehiculoId": "uuid-vehiculo",
  "choferId": "uuid-chofer",
  "origen": "Guayaquil",
  "destino": "Quito",
  "tipoCarga": "Diesel (Mercancía)",
  "cantidadCarga": 10000,
  "unidadMedida": "Galones",
  "ingresoServicio": 1500.00
}
```

---

### `GET /viajes`

Lista los viajes de la empresa del usuario autenticado.

---

### `GET /viajes/liquidaciones`

Lista todas las liquidaciones de viajes finalizados de la empresa.

> ⚠️ Esta ruta estática debe consultarse **antes** de `GET /viajes/:id` para evitar conflictos de parámetros.

---

### `GET /viajes/:id`

Retorna un viaje por UUID.

---

### `PATCH /viajes/:id`

Actualiza un viaje.

**Body:** Mismos campos que `POST /viajes`, todos opcionales.

---

### `DELETE /viajes/:id`

Elimina un viaje.

---

### `POST /viajes/:id/finalizar`

Cierra financieramente el viaje. Realiza las siguientes acciones:

1. Cambia `estado` a `FINALIZADO`.
2. Crea un registro `LiquidacionViaje` con:
   - `totalCombustibleReal` — suma de costos de combustible del viaje.
   - `totalGastosExtra` — suma de gastos extra del viaje.
   - `discrepanciaPrecioCombustible` — alerta si el precio por galón pagado fue mayor al oficial.
   - `discrepanciaGalones` — alerta si el rendimiento real fue menor al esperado.
   - `ahorroMantenimientoEstimado` — KPI de valor por mantenimiento preventivo.
   - `utilidadNetaViaje` — `ingresoServicio - (combustible + gastos)`.

**No requiere body.**

---

### `GET /viajes/:id/liquidacion`

Retorna la liquidación completa de un viaje específico.

**Incluye:** totales, discrepancias, KPIs, todos los registros de combustible y gastos del viaje.

---

## 7. Combustible

Registro de tanqueos. Todos los endpoints requieren JWT.

### `POST /combustible`

Registra un tanqueo de combustible.

> El servicio calcula automáticamente `rendimientoCalculado` (km/galón) y `precioPorGalon` (`costoTotal / galones`) para auditoría.

**Body:**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `vehiculoId` | `string (UUID)` | ✅ | Vehículo tanqueado |
| `choferId` | `string (UUID)` | ✅ | Chofer que cargó combustible |
| `viajeId` | `string (UUID)` | ❌ | Vincula el tanqueo a un viaje |
| `fecha` | `string (ISO date)` | ❌ | Default: fecha actual |
| `estacion` | `string` | ❌ | Nombre de la estación. Ej: `"BASTION"` |
| `tipoCombustible` | `ECO \| SUPER \| DIESEL` | ✅ | Tipo de combustible |
| `galones` | `number (> 0)` | ✅ | Cantidad de galones |
| `costoTotal` | `number (> 0)` | ✅ | Costo total pagado (USD) |
| `distancia` | `number (> 0)` | ✅ | Lectura del odómetro al momento del tanqueo (km) |
| `estado` | `string` | ❌ | `OK` \| `ANOMALIA`. Default: `OK` |
| `facturaUrl` | `string` | ❌ | URL de la foto de factura en Supabase Storage |

**Ejemplo:**

```json
{
  "vehiculoId": "uuid-vehiculo",
  "choferId": "uuid-chofer",
  "viajeId": "uuid-viaje",
  "estacion": "BASTION",
  "tipoCombustible": "DIESEL",
  "galones": 120.5,
  "costoTotal": 228.95,
  "distancia": 45230
}
```

---

### `GET /combustible`

Lista todos los registros de combustible de la empresa.

---

### `GET /combustible/:id`

Retorna un registro de combustible por UUID.

---

### `PATCH /combustible/:id`

Actualiza un registro de combustible.

**Body:** Mismos campos que `POST /combustible`, todos opcionales.

---

### `DELETE /combustible/:id`

Elimina un registro de combustible.

---

## 8. Gastos Extra

Registro de gastos en ruta (peajes, viáticos, etc.). Todos los endpoints requieren JWT.

### `POST /gastos`

Registra un gasto extra.

**Body:**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `vehiculoId` | `string (UUID)` | ✅ | Vehículo asociado |
| `choferId` | `string (UUID)` | ✅ | Chofer que realizó el gasto |
| `viajeId` | `string (UUID)` | ❌ | Vincula el gasto a un viaje |
| `fecha` | `string (ISO date)` | ❌ | Default: fecha actual |
| `categoria` | `string` | ✅ | Ej: `"Peaje"`, `"Alimentación"`, `"Estacionamiento"` |
| `monto` | `number (> 0)` | ✅ | Monto del gasto (USD) |
| `descripcion` | `string` | ❌ | Descripción adicional |
| `comprobanteUrl` | `string` | ❌ | URL de la foto del comprobante en Supabase Storage |

**Ejemplo:**

```json
{
  "vehiculoId": "uuid-vehiculo",
  "choferId": "uuid-chofer",
  "viajeId": "uuid-viaje",
  "categoria": "Peaje",
  "monto": 4.50,
  "descripcion": "Peaje Durán-Boliche km 26"
}
```

---

### `GET /gastos`

Lista todos los gastos extra de la empresa.

---

### `GET /gastos/:id`

Retorna un gasto extra por UUID.

---

### `PATCH /gastos/:id`

Actualiza un gasto extra.

**Body:** Mismos campos que `POST /gastos`, todos opcionales.

---

### `DELETE /gastos/:id`

Elimina un gasto extra.

---

## 9. Mantenimientos

Historial de taller. Todos los endpoints requieren JWT.

### `POST /mantenimientos`

Registra un evento de mantenimiento.

**Body:**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `vehiculoId` | `string (UUID)` | ✅ | Vehículo mantenido |
| `fecha` | `string (ISO date)` | ❌ | Default: fecha actual |
| `tipo` | `string` | ✅ | Ej: `"Preventivo"`, `"Correctivo"` |
| `descripcion` | `string` | ✅ | Ej: `"Cambio de aceite y filtros de aire"` |
| `taller` | `string` | ❌ | Nombre del taller |
| `costo` | `number (> 0)` | ✅ | Costo del mantenimiento (USD) |
| `kilometraje` | `number (> 0)` | ✅ | Odómetro del vehículo al ingresar al taller (km) |
| `facturaUrl` | `string` | ❌ | URL de la factura del taller en Supabase Storage |

**Ejemplo:**

```json
{
  "vehiculoId": "uuid-vehiculo",
  "tipo": "Preventivo",
  "descripcion": "Cambio de aceite 15W-40 y filtros",
  "taller": "Taller Central Guayaquil",
  "costo": 85.00,
  "kilometraje": 152000
}
```

---

### `GET /mantenimientos`

Lista todos los mantenimientos de la empresa.

---

### `GET /mantenimientos/:id`

Retorna un mantenimiento por UUID.

---

### `PATCH /mantenimientos/:id`

Actualiza un mantenimiento.

**Body:** Mismos campos que `POST /mantenimientos`, todos opcionales.

---

### `DELETE /mantenimientos/:id`

Elimina un mantenimiento.

---

## 10. Precio Combustible

Precios oficiales de combustible (regulados por el gobierno ecuatoriano). Todos los endpoints requieren JWT.

### `GET /precio-combustible`

Retorna los precios vigentes para todos los tipos de combustible.

**Requiere:** Solo JWT (cualquier rol).

**Respuesta:**

```json
[
  { "id": "uuid", "tipo": "ECO",    "precioPorGalon": 2.40, "actualizadoEn": "2026-07-01T..." },
  { "id": "uuid", "tipo": "SUPER",  "precioPorGalon": 2.75, "actualizadoEn": "2026-07-01T..." },
  { "id": "uuid", "tipo": "DIESEL", "precioPorGalon": 1.90, "actualizadoEn": "2026-07-01T..." }
]
```

---

### `GET /precio-combustible/:tipo`

Retorna el precio vigente de un tipo específico.

**Requiere:** Solo JWT (cualquier rol).  
**Parámetro:** `tipo` — `ECO`, `SUPER` o `DIESEL` (case-insensitive).

**Ejemplo:**

```
GET /precio-combustible/diesel
```

---

### `POST /precio-combustible`

Crea o actualiza el precio oficial de un tipo de combustible (upsert). Existe un único registro por tipo; se sobreescribe al actualizar.

**Requiere:** JWT + rol `ADMIN` o `GERENTE`.

**Body:**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `tipo` | `ECO \| SUPER \| DIESEL` | ✅ | Tipo de combustible |
| `precioPorGalon` | `number (> 0)` | ✅ | Precio oficial en USD |

**Ejemplo:**

```json
{
  "tipo": "DIESEL",
  "precioPorGalon": 1.90
}
```

---

## 11. Documentos de Vehículo

Control documental con alertas de caducidad. Todos los endpoints requieren JWT.

### `POST /documentos-vehiculo`

Crea el registro de un documento. Acepta solo JSON. Para adjuntar el archivo usar `POST /documentos-vehiculo/:id/archivo` después.

**Body:**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `vehiculoId` | `string (UUID)` | ✅ | Vehículo al que pertenece el documento |
| `tipoDocumento` | `string` | ✅ | Ej: `"Póliza de Seguro"`, `"Matrícula"`, `"Permiso Bomberos"` |
| `fechaEmision` | `string (ISO date)` | ❌ | Fecha de emisión del documento |
| `fechaExpiracion` | `string (ISO date)` | ❌ | Fecha de vencimiento (clave para alertas) |
| `costo` | `number` | ❌ | Costo del documento (USD) |
| `archivoUrl` | `string` | ❌ | URL preexistente del archivo (si ya fue subido) |

**Ejemplo:**

```json
{
  "vehiculoId": "uuid-vehiculo",
  "tipoDocumento": "Matrícula",
  "fechaEmision": "2026-01-15",
  "fechaExpiracion": "2027-01-15",
  "costo": 45.00
}
```

---

### `GET /documentos-vehiculo`

Lista todos los documentos de la empresa.

---

### `GET /documentos-vehiculo/:id`

Retorna un documento por UUID.

---

### `PATCH /documentos-vehiculo/:id`

Actualiza los metadatos de un documento. Acepta solo JSON.

**Body:** Mismos campos que `POST /documentos-vehiculo`, todos opcionales.

---

### `DELETE /documentos-vehiculo/:id`

Elimina el registro del documento **y** el archivo en Supabase Storage si existe.

---

### `POST /documentos-vehiculo/:id/archivo`

Adjunta o reemplaza el archivo de un documento en Supabase Storage.

**Content-Type:** `multipart/form-data`  
**Campo del archivo:** `archivo`  
**Tipos aceptados:** `application/pdf`, `image/jpeg`, `image/jpg`, `image/png`, `image/webp`  
**Tamaño máximo:** 20 MB  
**Ruta en Storage:** `documentos/{empresa}/{placa}/{tipoDocumento}-{timestamp}.{ext}`

**Ejemplo con curl:**

```bash
curl -X POST http://localhost:3000/documentos-vehiculo/<id>/archivo \
  -H "Authorization: Bearer <token>" \
  -F "archivo=@poliza_seguro.pdf"
```

**Respuesta:** Objeto del documento actualizado con `archivoUrl` pública.

---

## Notas generales

### Aislamiento multi-tenant

Todos los endpoints de lista y detalle filtran automáticamente los datos por la empresa del usuario autenticado. Los usuarios `ADMIN` (sin empresa asignada) tienen visibilidad global entre todos los tenants.

### Patrón de subida de archivos

Los recursos con archivos siguen un flujo en dos pasos:

1. `POST /<recurso>` — crea el registro con datos JSON.
2. `POST /<recurso>/:id/imagen` o `POST /<recurso>/:id/archivo` — sube el archivo vía `multipart/form-data`.

Solo la URL pública del archivo (`imagenUrl`, `archivoUrl`, `facturaUrl`, `comprobanteUrl`) se almacena en la base de datos. El archivo vive en Supabase Storage.

### Campos calculados automáticamente

El servidor calcula y persiste estos campos sin necesidad de enviarlos en el body:

| Campo | Recurso | Cálculo |
|-------|---------|---------|
| `rendimientoCalculado` | `RegistroCombustible` | `distancia_actual - distancia_anterior / galones` |
| `precioPorGalon` | `RegistroCombustible` | `costoTotal / galones` |
| `totalCombustibleReal` | `LiquidacionViaje` | Suma de `costoTotal` de tanqueos del viaje |
| `totalGastosExtra` | `LiquidacionViaje` | Suma de `monto` de gastos del viaje |
| `utilidadNetaViaje` | `LiquidacionViaje` | `ingresoServicio - (combustible + gastos)` |

### Tipos y enums

```
RolUsuario:      ADMIN | GERENTE | CHOFER
TipoCombustible: ECO | SUPER | DIESEL
EstadoViaje:     EN_RUTA | FINALIZADO | RETRASADO
EstadoCombustible: OK | ANOMALIA
```
