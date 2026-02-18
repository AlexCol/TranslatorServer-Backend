import { Injectable } from '@nestjs/common';
import { AuthProvider } from './interfaces/AuthProvider';
import { SessionDataDto } from '@/modules/session/dto/session.data.dto';
import { SessionService } from '@/modules/session/session.service';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly authProvider: AuthProvider,
    private readonly sessionService: SessionService,
  ) {}

  async login(username: string, password: string): Promise<SessionDataDto> {
    const loggedUser = await this.authProvider.validateUser(username, password);
    const sessionData = await this.sessionService.createSession(loggedUser);
    return sessionData;
  }
}
