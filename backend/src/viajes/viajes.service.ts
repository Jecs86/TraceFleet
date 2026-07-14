import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RolUsuario, TipoCombustible, Usuario } from '../generated/prisma/client';
import { CreateViajeDto } from './dto/create-viaje.dto';
import { UpdateViajeDto } from './dto/update-viaje.dto';

type AuthUser = Usuario & { empresa: any };

@Injectable()
export class ViajesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createViajeDto: CreateViajeDto, currentUser: AuthUser) {
    const empresaId = currentUser.empresaId!;

    const vehiculo = await this.prisma.vehiculo.findUnique({
      where: { id: createViajeDto.vehiculoId },
    });
    if (
      !vehiculo ||
      (currentUser.rol !== RolUsuario.ADMIN && vehiculo.empresaId !== empresaId)
    ) {
      throw new ForbiddenException(
        'El vehículo no existe o no pertenece a tu empresa',
      );
    }

    const chofer = await this.prisma.usuario.findUnique({
      where: { id: createViajeDto.choferId },
    });
    if (
      !chofer ||
      (currentUser.rol !== RolUsuario.ADMIN && chofer.empresaId !== empresaId)
    ) {
      throw new ForbiddenException(
        'El chofer no existe o no pertenece a tu empresa',
      );
    }

    // ADMIN uses the vehicle's company for the viaje record
    const viajeEmpresaId =
      currentUser.rol === RolUsuario.ADMIN ? vehiculo.empresaId : empresaId;

    return this.prisma.viaje.create({
      data: {
        ...createViajeDto,
        empresaId: viajeEmpresaId,
        fechaSalida: createViajeDto.fechaSalida
          ? new Date(createViajeDto.fechaSalida)
          : undefined,
        fechaLlegada: createViajeDto.fechaLlegada
          ? new Date(createViajeDto.fechaLlegada)
          : undefined,
      },
    });
  }

  /** ADMIN ve todos los viajes; los demás solo los de su empresa. */
  findAll(currentUser: AuthUser) {
    if (currentUser.rol === RolUsuario.ADMIN) {
      return this.prisma.viaje.findMany({
        include: { vehiculo: true, chofer: true, empresa: true },
      });
    }
    return this.prisma.viaje.findMany({
      where: { empresaId: currentUser.empresaId! },
      include: { vehiculo: true, chofer: true },
    });
  }

  async findOne(id: string, currentUser: AuthUser) {
    const viaje = await this.prisma.viaje.findUnique({
      where: { id },
      include: { vehiculo: true, chofer: true },
    });

    if (!viaje) {
      throw new NotFoundException(`Viaje #${id} no encontrado`);
    }

    if (
      currentUser.rol !== RolUsuario.ADMIN &&
      viaje.empresaId !== currentUser.empresaId
    ) {
      throw new ForbiddenException('No tienes acceso a este viaje');
    }

    return viaje;
  }

  async update(id: string, updateViajeDto: UpdateViajeDto, currentUser: AuthUser) {
    await this.findOne(id, currentUser);
    const empresaId = currentUser.empresaId!;

    if (updateViajeDto.vehiculoId) {
      const vehiculo = await this.prisma.vehiculo.findUnique({
        where: { id: updateViajeDto.vehiculoId },
      });
      if (
        !vehiculo ||
        (currentUser.rol !== RolUsuario.ADMIN && vehiculo.empresaId !== empresaId)
      ) {
        throw new ForbiddenException(
          'El vehículo no existe o no pertenece a tu empresa',
        );
      }
    }

    if (updateViajeDto.choferId) {
      const chofer = await this.prisma.usuario.findUnique({
        where: { id: updateViajeDto.choferId },
      });
      if (
        !chofer ||
        (currentUser.rol !== RolUsuario.ADMIN && chofer.empresaId !== empresaId)
      ) {
        throw new ForbiddenException(
          'El chofer no existe o no pertenece a tu empresa',
        );
      }
    }

    return this.prisma.viaje.update({
      where: { id },
      data: {
        ...updateViajeDto,
        fechaSalida: updateViajeDto.fechaSalida
          ? new Date(updateViajeDto.fechaSalida)
          : undefined,
        fechaLlegada: updateViajeDto.fechaLlegada
          ? new Date(updateViajeDto.fechaLlegada)
          : undefined,
      },
    });
  }

  async remove(id: string, currentUser: AuthUser) {
    await this.findOne(id, currentUser);
    return this.prisma.viaje.delete({ where: { id } });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CONSULTAS DE LIQUIDACIÓN
  // ─────────────────────────────────────────────────────────────────────────────

  /** Devuelve todas las liquidaciones de la empresa del usuario. */
  async findAllLiquidaciones(currentUser: AuthUser) {
    const where =
      currentUser.rol === RolUsuario.ADMIN
        ? {}
        : { viaje: { empresaId: currentUser.empresaId! } };

    return this.prisma.liquidacionViaje.findMany({
      where,
      include: {
        viaje: {
          select: {
            id: true,
            origen: true,
            destino: true,
            fechaSalida: true,
            fechaLlegada: true,
            ingresoServicio: true,
            chofer: { select: { id: true, nombre: true } },
            vehiculo: { select: { id: true, placa: true, tipo: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Devuelve la liquidación de un viaje específico. */
  async findLiquidacionByViaje(viajeId: string, currentUser: AuthUser) {
    const liquidacion = await this.prisma.liquidacionViaje.findUnique({
      where: { viajeId },
      include: {
        viaje: {
          include: {
            chofer: { select: { id: true, nombre: true } },
            vehiculo: { select: { id: true, placa: true, tipo: true } },
            registrosCombustible: {
              select: {
                id: true,
                fecha: true,
                estacion: true,
                tipoCombustible: true,
                galones: true,
                costoTotal: true,
                precioPorGalon: true,
                rendimientoCalculado: true,
                estado: true,
              },
            },
            gastos: {
              select: {
                id: true,
                fecha: true,
                categoria: true,
                monto: true,
                descripcion: true,
              },
            },
          },
        },
      },
    });

    if (!liquidacion) {
      throw new NotFoundException(
        `No existe liquidación para el viaje #${viajeId}`,
      );
    }

    if (
      currentUser.rol !== RolUsuario.ADMIN &&
      liquidacion.viaje.empresaId !== currentUser.empresaId
    ) {
      throw new ForbiddenException('No tienes acceso a esta liquidación');
    }

    return liquidacion;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CIERRE FINANCIERO: Liquidación del Viaje
  // Se ejecuta cuando el estado del viaje cambia a "FINALIZADO".
  // Usa una transacción de Prisma para garantizar atomicidad.
  // ─────────────────────────────────────────────────────────────────────────────
  async finalizarViaje(id: string, currentUser: AuthUser) {
    // 1. Cargar el viaje con todos sus registros asociados, ordenados por odómetro
    const viaje = await this.prisma.viaje.findUnique({
      where: { id },
      include: {
        registrosCombustible: { orderBy: { distancia: 'asc' } },
        gastos: true,
        vehiculo: { include: { mantenimientos: true } },
        liquidacion: true,
      },
    });

    if (!viaje) throw new NotFoundException(`Viaje #${id} no encontrado`);
    if (
      currentUser.rol !== RolUsuario.ADMIN &&
      viaje.empresaId !== currentUser.empresaId
    ) throw new ForbiddenException('No tienes acceso a este viaje');
    if (viaje.estado === 'FINALIZADO')
      throw new BadRequestException('Este viaje ya fue finalizado');
    if (viaje.liquidacion)
      throw new BadRequestException('Este viaje ya tiene una liquidación registrada');

    const registros = viaje.registrosCombustible;

    // 2. Totales directos
    const totalCombustibleReal = registros.reduce((sum, r) => sum + r.costoTotal, 0);
    const totalGastosExtra = viaje.gastos.reduce((sum, g) => sum + g.monto, 0);
    const totalGalonesConsumidos = registros.reduce((sum, r) => sum + r.galones, 0);

    // 3. Distancia real del viaje: odómetro final - odómetro inicial
    //    (distancia es el km del odómetro en cada tanqueo, NO km recorridos en ese tramo)
    const distanciaTotal =
      registros.length >= 2
        ? registros[registros.length - 1].distancia - registros[0].distancia
        : 0;

    // 4. Cargar precios oficiales vigentes para calcular discrepancias por tipo
    const preciosOficiales = await this.prisma.precioCombustible.findMany();
    const mapaPrecios = new Map<TipoCombustible, number>(
      preciosOficiales.map((p) => [p.tipo, p.precioPorGalon]),
    );

    // 5. Discrepancia de precio: por cada tanqueo, comparar lo pagado vs. el precio oficial
    //    Si no hay precio oficial para ese tipo, ese tanqueo no genera discrepancia.
    let discrepanciaPrecioCombustible = 0;
    for (const r of registros) {
      const precioOficial = mapaPrecios.get(r.tipoCombustible);
      if (precioOficial && r.precioPorGalon !== null && r.precioPorGalon !== undefined) {
        const sobrecoste = (r.precioPorGalon - precioOficial) * r.galones;
        if (sobrecoste > 0) discrepanciaPrecioCombustible += sobrecoste;
      }
    }

    // 6. Discrepancia de galones: ¿Consumió más galones de los que la distancia justifica?
    //    Usa el precio promedio ponderado de los tanqueos para convertir galones a USD.
    const RENDIMIENTO_IDEAL = 10; // km/galón — base MVP, configurable en versiones futuras
    let discrepanciaGalones = 0;
    if (distanciaTotal > 0 && totalGalonesConsumidos > 0) {
      const galonesEsperados = distanciaTotal / RENDIMIENTO_IDEAL;
      if (totalGalonesConsumidos > galonesEsperados) {
        const galonesPerdidos = totalGalonesConsumidos - galonesEsperados;
        // Precio promedio real pagado para convertir los galones perdidos a USD
        const precioPromedioPagado = totalCombustibleReal / totalGalonesConsumidos;
        discrepanciaGalones = galonesPerdidos * precioPromedioPagado;
      }
    }

    // 7. KPI de mantenimiento: vehículo con mantenimientos al día → estimamos 5% de ahorro
    const tieneMantenimiento = viaje.vehiculo.mantenimientos.length > 0;
    const ahorroMantenimientoEstimado = tieneMantenimiento
      ? totalCombustibleReal * 0.05
      : 0;

    // 8. Rentabilidad neta
    const utilidadNetaViaje =
      viaje.ingresoServicio - (totalCombustibleReal + totalGastosExtra);

    // 9. Guardar en transacción atómica
    return this.prisma.$transaction(async (tx) => {
      await tx.viaje.update({
        where: { id },
        data: { estado: 'FINALIZADO', fechaLlegada: new Date() },
      });

      return tx.liquidacionViaje.create({
        data: {
          viajeId: viaje.id,
          totalCombustibleReal,
          totalGastosExtra,
          discrepanciaPrecioCombustible,
          discrepanciaGalones,
          ahorroMantenimientoEstimado,
          utilidadNetaViaje,
        },
      });
    });
  }
}
