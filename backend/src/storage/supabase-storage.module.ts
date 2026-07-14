import { Global, Module } from '@nestjs/common';
import { SupabaseStorageService } from './supabase-storage.service';

/**
 * @Global — cualquier módulo que importe AppModule tiene acceso al servicio
 * sin necesidad de importar StorageModule explícitamente.
 */
@Global()
@Module({
  providers: [SupabaseStorageService],
  exports: [SupabaseStorageService],
})
export class SupabaseStorageModule {}
