import { AuthenticationService } from './authentication.service';

describe('AuthenticationService', () => {
  const authProviderMock = {
    validateUser: jest.fn(),
  };

  const sessionServiceMock = {
    createSession: jest.fn(),
  };

  let service: AuthenticationService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthenticationService(authProviderMock as any, sessionServiceMock as any);
  });

  it('validates user and creates session', async () => {
    const loggedUser = {
      id: 1,
      login: 'alex',
      firstname: 'Alex',
      lastname: 'Silva',
    };
    const sessionData = {
      sessionToken: 'token-1',
      userSession: loggedUser,
    };
    authProviderMock.validateUser.mockResolvedValue(loggedUser);
    sessionServiceMock.createSession.mockResolvedValue(sessionData);

    const result = await service.login('alex', '123');

    expect(authProviderMock.validateUser).toHaveBeenCalledWith('alex', '123');
    expect(sessionServiceMock.createSession).toHaveBeenCalledWith(loggedUser);
    expect(result).toEqual(sessionData);
  });
});
