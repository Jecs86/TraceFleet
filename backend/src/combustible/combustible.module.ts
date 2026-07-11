import { Module } from '@nestjs/common';
import { CombustibleService } from './combustible.service';
import { CombustibleController } from './combustible.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CombustibleController],
  providers: [CombustibleService],
})
export class CombustibleModule {}
