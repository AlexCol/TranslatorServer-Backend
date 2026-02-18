import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { SessionTokenGuard } from './guards/session.guard';
import { AuthProvider } from './interfaces/AuthProvider';
import { buildAuthProvider } from './providers';
import { SessionModule } from '@/modules/session/session.module';

@Module({
  imports: [SessionModule],
  providers: [
    AuthenticationService,
    {
      provide: AuthProvider,
      useFactory: buildAuthProvider,
    },
    { provide: APP_GUARD, useClass: SessionTokenGuard },
  ],
  controllers: [AuthenticationController],
})
export class AuthenticationModule {}
