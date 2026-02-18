import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthProvider } from '../../interfaces/AuthProvider';
import { LoggedUser } from '../../types/loggedUser';
import envConfig from '@/env.config';

export class RedmineAuthProvider extends AuthProvider {
  async validateUser(username: string, password: string): Promise<LoggedUser> {
    if (!password || !username) {
      throw new BadRequestException('Credenciais inválidas');
    }

    if (!envConfig.redmine.url) {
      throw new BadRequestException('REDMINE_URL não configurada');
    }

    const headers = { Authorization: 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64') };

    try {
      const response = await fetch(envConfig.redmine.url, { headers });
      if (!response.ok) {
        throw new UnauthorizedException('Credenciais inválidas');
      }

      const body = (await response.json()) as { user?: LoggedUser };
      const { user } = body;
      if (!user) {
        throw new UnauthorizedException('Resposta inválida do provedor de autenticação');
      }

      const loggedUser: LoggedUser = {
        id: user.id,
        login: user.login,
        firstname: user.firstname,
        lastname: user.lastname,
      };

      return loggedUser;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Erro ao autenticar com Redmine: ' + error.message);
    }
  }
}

/*
user redmine completo:
{
    "id": number,
    "login": string,
    "admin": boolean,
    "firstname": string,
    "lastname": string,
    "created_on": string,
    "updated_on": string,
    "last_login_on": string,
    "passwd_changed_on": string,
    "twofa_scheme": string | null,
    "api_key": string
}
*/
