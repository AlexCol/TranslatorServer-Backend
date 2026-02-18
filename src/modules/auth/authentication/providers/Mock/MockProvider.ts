import { BadRequestException } from '@nestjs/common';
import { AuthProvider } from '../../interfaces/AuthProvider';
import { LoggedUser } from '../../types/loggedUser';

export class MockAuthProvider extends AuthProvider {
  async validateUser(username: string, password: string): Promise<LoggedUser> {
    if (!password || !username) {
      throw new BadRequestException('Credenciais inválidas');
    }

    if (username !== 'mockuser' || password !== 'mockpassword') {
      throw new BadRequestException('Credenciais inválidas');
    }

    const loggedUser: LoggedUser = {
      id: 1,
      login: 'mockuser',
      firstname: 'Mock',
      lastname: 'User',
    };

    return loggedUser;
  }
}
