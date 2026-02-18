import { Body, Controller, Get, HttpCode, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthenticationService } from './authentication.service';
import { IsPublic } from './decorators/isPublic';
import { LoginDto } from './dto/login.dto';
import addSessionCookie, { getSessionCookieOptions } from './functions/addSessionCookie';
import { StringResponseDto } from '@/common/dto/MessageResponseDto';
import { ApiDoc } from '@/decorators/api-doc/api-doc';
import { SessionPayload } from '@/modules/session/dto/SessionPayload';
import { SessionCacheService } from '@/modules/session/session-cache.service';

@Controller('auth')
export class AuthenticationController {
  constructor(
    private readonly authService: AuthenticationService,
    private readonly sessionService: SessionCacheService,
  ) {}

  @IsPublic()
  @ApiDoc({
    summary: 'Login',
    description: 'Authenticate user and return access token',
    body: LoginDto,
    response: SessionPayload,
  })
  @HttpCode(200)
  @Post('/login')
  async login(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
    @Body() loginDto: LoginDto,
  ): Promise<SessionPayload> {
    const response = await this.authService.login(loginDto.username, loginDto.password);

    const rememberMe = req.headers['remember-me'] === 'true';
    addSessionCookie(res, response.sessionToken, rememberMe);

    return response.userSession;
  }

  @ApiDoc({
    summary: 'Logout',
    description: 'Invalidate user session and clear session cookie',
    errStatus: [401],
    response: StringResponseDto,
  })
  @HttpCode(200)
  @Post('logout')
  async logout(@Req() req: FastifyRequest, @Res({ passthrough: true }) res: FastifyReply) {
    const sessionToken = req.cookies['sessionToken'];

    if (sessionToken) {
      await this.sessionService.deleteSession(sessionToken);
    }

    res.clearCookie('sessionToken', getSessionCookieOptions());

    const response: StringResponseDto = { data: 'Logout successful' };
    return response;
  }

  /****************************************************************************/
  /* Tratamentos para sessões                                                 */
  /****************************************************************************/
  @ApiDoc({
    summary: 'Verificação de sessão',
    description: 'Verifica se a sessão do usuário é válida e retorna os dados da sessão.',
    errStatus: [401],
    response: SessionPayload,
  })
  @Get('session')
  @HttpCode(200)
  async checkSession(@Req() req: FastifyRequest, @Res({ passthrough: true }) res: FastifyReply) {
    try {
      const sessionToken = req.cookies['sessionToken'];
      if (!sessionToken) throw new UnauthorizedException('No session token provided');

      const sessionData = await this.sessionService.getSession(sessionToken);
      if (!sessionData) throw new UnauthorizedException('Session invalid or expired');

      return sessionData.payload;
    } catch (error) {
      res.clearCookie('sessionToken', getSessionCookieOptions());
      throw error;
    }
  }
}
