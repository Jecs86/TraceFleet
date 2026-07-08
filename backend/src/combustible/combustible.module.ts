import { Module } from '@nestjs/common';
import { CombustibleService } from './combustible.service';
import { CombustibleController } from './combustible.controller';

@Module({
  controllers: [CombustibleController],
  providers: [CombustibleService],
})
export class CombustibleModule {}
