import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FastifyReply, FastifyRequest } from 'fastify';
import { SessionCacheService } from '../session-cache.service';
import { IS_PUBLIC } from '@/modules/auth/authentication/constants';
import addSessionCookie from '@/modules/auth/authentication/functions/addSessionCookie';

@Injectable()
export class SessionRefreshInterceptor implements NestInterceptor {
  constructor(
    private readonly sessionService: SessionCacheService,
    private readonly reflector: Reflector,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    const req = context.switchToHttp().getRequest<FastifyRequest>();
    const res = context.switchToHttp().getResponse<FastifyReply>();

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [context.getHandler(), context.getClass()]);
    if (isPublic) return next.handle();

    const sessionToken = req.cookies['sessionToken'];
    if (!sessionToken) return next.handle();

    try {
      const refreshed = await this.sessionService.refreshSession(sessionToken); //? regra em session.service.ts

      if (refreshed) {
        const rememberMe = req.headers['remember-me'] === 'true';
        addSessionCookie(res, sessionToken, rememberMe); //renovar o cookie também
      }
    } catch (error) {
      res.clearCookie('sessionToken');
      throw error;
    }

    return next.handle();
  }
}
