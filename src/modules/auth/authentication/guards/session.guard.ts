import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FastifyReply, FastifyRequest } from 'fastify';
import { SessionCacheService } from 'src/modules/session/session-cache.service';
import { IS_PUBLIC } from '../constants';

@Injectable()
export class SessionTokenGuard implements CanActivate {
  constructor(
    private readonly sessionService: SessionCacheService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [context.getHandler(), context.getClass()]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<FastifyRequest>();
    const sessionToken = this.extractSessionTokenFromCookie(req);

    try {
      if (!sessionToken) throw new UnauthorizedException('No session token provided');

      const sessionData = await this.sessionService.getSession(sessionToken);
      if (!sessionData) throw new UnauthorizedException('Session invalid or expired');

      //não controlar se usuário está ativo ou não aqui, apenas validar a sessão
      //se desejar 'deslogar' um usuário que for inativo, usar processo de limpeza
      //de sessões ao editar o usuário

      req.user = {
        payload: sessionData.payload,
      };

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        const res = context.switchToHttp().getResponse<FastifyReply>();
        res.clearCookie('sessionToken');
      }
      throw error;
    }
  }

  private extractSessionTokenFromCookie(request: FastifyRequest): string | null {
    try {
      const cookies = (request as any).cookies as Record<string, string> | null;
      if (!cookies) return null;

      const token = cookies['sessionToken'];
      if (!token) return null;

      return typeof token === 'string' ? token : null;
    } catch {
      return null;
    }
  }
}
