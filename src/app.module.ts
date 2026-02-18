import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { GlobalErrorFilter } from './filters/globalError.filter';
import { AuthenticationModule } from './modules/auth/authentication/authentication.module';
import { CdnPublisherModule } from './modules/cdn-publisher/cdn-publisher.module';
import { CoreTranslationsModule } from './modules/core-translations/core-translations.module';
import { InfraModule } from './modules/infra/infra.module';
import { SessionModule } from './modules/session/session.module';
import { GlobalThrottlerModule } from './modules/throttler/global-throttler.module';

@Module({
  imports: [
    GlobalThrottlerModule,
    InfraModule,
    CoreTranslationsModule,
    CdnPublisherModule,
    AuthenticationModule,
    SessionModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_FILTER, useClass: GlobalErrorFilter },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
