import { Module } from '@nestjs/common';
import { PrecioCombustibleService } from './precio-combustible.service';
import { PrecioCombustibleController } from './precio-combustible.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PrecioCombustibleController],
  providers: [PrecioCombustibleService],
  exports: [PrecioCombustibleService],
})
export class PrecioCombustibleModule {}
