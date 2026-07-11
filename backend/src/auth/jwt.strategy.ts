import 'dotenv/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    const supabaseUrl = process.env.SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error(
        'SUPABASE_URL no está definida. Verifica que el archivo .env exista en la raíz del backend.',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      audience: 'authenticated',
      issuer: `${supabaseUrl}/auth/v1`,
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${supabaseUrl}/auth/v1/.well-known/jwks.json`,
      }),
      algorithms: ['ES256'],
    });
  }

  async validate(payload: any) {
    const authId = payload.sub;
    if (!authId) {
      throw new UnauthorizedException('Token payload inválido');
    }

    const usuario = await this.prisma.usuario.findUnique({
      where: { authId },
      include: { empresa: true },
    });

    if (!usuario) {
      throw new UnauthorizedException(
        'Usuario no registrado en la base de datos',
      );
    }

    if (!usuario.estadoActivo) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    return usuario;
  }
}
