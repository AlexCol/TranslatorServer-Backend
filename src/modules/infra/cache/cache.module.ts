import { Global, Module } from '@nestjs/common';
import { Cache } from './interface/Cache';
import { InMemoryCache } from './providers/InMemoryCache';

@Global()
@Module({
  providers: [{ provide: Cache, useClass: InMemoryCache }],
  exports: [Cache],
})
export class CacheModule {}
