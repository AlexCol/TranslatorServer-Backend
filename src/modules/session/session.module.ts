import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { SessionRefreshInterceptor } from './interceptors/session-refresh.interceptor';
import { SessionCacheService } from './session-cache.service';
import { SessionService } from './session.service';

@Module({
  providers: [SessionService, SessionCacheService, { provide: APP_INTERCEPTOR, useClass: SessionRefreshInterceptor }],
  exports: [SessionService, SessionCacheService],
})
export class SessionModule {}
