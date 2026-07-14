import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RolUsuario, TipoCombustible, Usuario } from '../generated/prisma/client';
import { CreateCombustibleDto } from './dto/create-combustible.dto';
import { UpdateCombustibleDto } from './dto/update-combustible.dto';

type AuthUser = Usuario & { empresa: any };

@Injectable()
export class CombustibleService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateCombustibleDto, currentUser: AuthUser) {
    const empresaId = currentUser.empresaId!;
    const isAdmin = currentUser.rol === RolUsuario.ADMIN;

    const vehiculo = await this.prisma.vehiculo.findUnique({
      where: { id: createDto.vehiculoId },
    });
    if (!vehiculo || (!isAdmin && vehiculo.empresaId !== empresaId)) {
      throw new ForbiddenException(
        'El vehículo no existe o no pertenece a tu empresa',
      );
    }

    const chofer = await this.prisma.usuario.findUnique({
      where: { id: createDto.choferId },
    });
    if (!chofer || (!isAdmin && chofer.empresaId !== empresaId)) {
      throw new ForbiddenException(
        'El chofer no existe o no pertenece a tu empresa',
      );
    }

    if (createDto.viajeId) {
      const viaje = await this.prisma.viaje.findUnique({
        where: { id: createDto.viajeId },
      });
      if (!viaje || (!isAdmin && viaje.empresaId !== empresaId)) {
        throw new ForbiddenException(
          'El viaje no existe o no pertenece a tu empresa',
        );
      }
    }

    // 1. Calcular rendimiento: km recorridos desde el último tanqueo / galones cargados
    let rendimientoCalculado: number | null = null;
    const ultimoRegistro = await this.prisma.registroCombustible.findFirst({
      where: { vehiculoId: createDto.vehiculoId },
      orderBy: { distancia: 'desc' },
    });

    if (
      ultimoRegistro &&
      createDto.distancia > ultimoRegistro.distancia &&
      createDto.galones > 0
    ) {
      rendimientoCalculado =
        (createDto.distancia - ultimoRegistro.distancia) / createDto.galones;
    }

    // 2. Precio real pagado por galón
    const precioPorGalon = createDto.galones > 0
      ? createDto.costoTotal / createDto.galones
      : null;

    // 3. Comparar contra el precio oficial vigente para detectar anomalía de precio
    //    Si no hay precio oficial cargado, se omite la verificación de precio.
    const precioOficial = await this.prisma.precioCombustible.findUnique({
      where: { tipo: createDto.tipoCombustible as TipoCombustible },
    });

    // 4. Lógica de anomalía combinada:
    //    - Rendimiento bajo el mínimo esperado (< 8 km/galón), O
    //    - Precio pagado supera en más de un 10% el precio oficial vigente
    const RENDIMIENTO_MINIMO_ESPERADO = 8; // km/galón — umbral base MVP
    const TOLERANCIA_PRECIO = 0.10;        // 10% de margen sobre el precio oficial

    let esAnomalia = false;
    if (rendimientoCalculado !== null && rendimientoCalculado < RENDIMIENTO_MINIMO_ESPERADO) {
      esAnomalia = true;
    }
    if (precioOficial && precioPorGalon !== null) {
      const limiteAceptable = precioOficial.precioPorGalon * (1 + TOLERANCIA_PRECIO);
      if (precioPorGalon > limiteAceptable) {
        esAnomalia = true;
      }
    }

    const estado = esAnomalia ? 'ANOMALIA' : (createDto.estado ?? 'OK');

    // 5. Guardar con los campos calculados
    return this.prisma.registroCombustible.create({
      data: {
        ...createDto,
        tipoCombustible: createDto.tipoCombustible as TipoCombustible,
        rendimientoCalculado,
        precioPorGalon,
        estado,
        fecha: createDto.fecha ? new Date(createDto.fecha) : undefined,
      },
    });
  }

  /** ADMIN ve todos los registros; los demás solo los de su empresa. */
  findAll(currentUser: AuthUser) {
    if (currentUser.rol === RolUsuario.ADMIN) {
      return this.prisma.registroCombustible.findMany({
        include: { vehiculo: true, chofer: true, viaje: true },
      });
    }
    return this.prisma.registroCombustible.findMany({
      where: { vehiculo: { empresaId: currentUser.empresaId! } },
      include: { vehiculo: true, chofer: true, viaje: true },
    });
  }

  async findOne(id: string, currentUser: AuthUser) {
    const registro = await this.prisma.registroCombustible.findUnique({
      where: { id },
      include: { vehiculo: true, chofer: true, viaje: true },
    });

    if (!registro) {
      throw new NotFoundException(`RegistroCombustible #${id} no encontrado`);
    }

    if (
      currentUser.rol !== RolUsuario.ADMIN &&
      registro.vehiculo.empresaId !== currentUser.empresaId
    ) {
      throw new ForbiddenException('No tienes acceso a este registro');
    }

    return registro;
  }

  async update(id: string, updateDto: UpdateCombustibleDto, currentUser: AuthUser) {
    await this.findOne(id, currentUser);
    const isAdmin = currentUser.rol === RolUsuario.ADMIN;
    const empresaId = currentUser.empresaId!;

    if (updateDto.vehiculoId) {
      const vehiculo = await this.prisma.vehiculo.findUnique({
        where: { id: updateDto.vehiculoId },
      });
      if (!vehiculo || (!isAdmin && vehiculo.empresaId !== empresaId)) {
        throw new ForbiddenException(
          'El vehículo no existe o no pertenece a tu empresa',
        );
      }
    }

    if (updateDto.choferId) {
      const chofer = await this.prisma.usuario.findUnique({
        where: { id: updateDto.choferId },
      });
      if (!chofer || (!isAdmin && chofer.empresaId !== empresaId)) {
        throw new ForbiddenException(
          'El chofer no existe o no pertenece a tu empresa',
        );
      }
    }

    return this.prisma.registroCombustible.update({
      where: { id },
      data: {
        ...updateDto,
        fecha: updateDto.fecha ? new Date(updateDto.fecha) : undefined,
      },
    });
  }

  async remove(id: string, currentUser: AuthUser) {
    await this.findOne(id, currentUser);
    return this.prisma.registroCombustible.delete({ where: { id } });
  }
}
