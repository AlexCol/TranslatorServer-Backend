import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';

//! além de importar no appmodule, ativar:
//! { provide: APP_GUARD, useClass: ThrottlerGuard },
@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 1000, // tempo em milissegundos (1 segundo)
          limit: 10, // número de requisições permitidas por ttl
          blockDuration: 60000, // tempo em milissegundos (60 segundos) que o IP será bloqueado após exceder o limite, sem isso o bloqueio fica até o ttl
        },
      ],
    }),
  ],
  controllers: [],
  providers: [],
})
export class GlobalThrottlerModule {}
