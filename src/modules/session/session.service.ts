import { Injectable } from '@nestjs/common';
import { LoggedUser } from '../auth/authentication/types/loggedUser';
import { SessionPayload } from './dto/SessionPayload';
import { SessionCacheService } from './session-cache.service';

@Injectable()
export class SessionService {
  constructor(private readonly sessionCacheService: SessionCacheService) {}

  /*****************************************************************************/
  /* Metodos Publicos                                                          */
  /*****************************************************************************/
  async createSession(usuario: LoggedUser) {
    const userSession = await this.montarPayload(usuario);
    const sessionToken = await this.sessionCacheService.setSession(userSession);
    return {
      sessionToken,
      userSession,
    };
  }

  async montarPayload(usuario: LoggedUser): Promise<SessionPayload> {
    //const dadosAdicionais = await this.buscarDadosAdicionaisUsuario(usuario);
    const userSession: SessionPayload = {
      id: usuario.id,
      login: usuario.login,
      firstname: usuario.firstname,
      lastname: usuario.lastname,
    };
    return userSession;
  }
}
