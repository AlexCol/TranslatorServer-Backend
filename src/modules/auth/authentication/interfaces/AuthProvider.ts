import { LoggedUser } from '../types/loggedUser';

export abstract class AuthProvider {
  abstract validateUser(username: string, password: string): Promise<LoggedUser>;
}
