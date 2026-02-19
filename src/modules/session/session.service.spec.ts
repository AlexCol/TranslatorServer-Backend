import { LoggedUser } from '../auth/authentication/types/loggedUser';
import { SessionCacheService } from './session-cache.service';
import { SessionService } from './session.service';

describe('SessionService', () => {
  const sessionCacheServiceMock = {
    setSession: jest.fn(),
  } as unknown as jest.Mocked<SessionCacheService>;

  let service: SessionService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SessionService(sessionCacheServiceMock);
  });

  it('creates session token and payload', async () => {
    const usuario: LoggedUser = {
      id: 1,
      login: 'alexandre',
      firstname: 'Alexandre',
      lastname: 'Silva',
    };

    sessionCacheServiceMock.setSession.mockResolvedValue('token-abc');

    const result = await service.createSession(usuario);

    expect(sessionCacheServiceMock.setSession).toHaveBeenCalledWith({
      id: 1,
      login: 'alexandre',
      firstname: 'Alexandre',
      lastname: 'Silva',
    });
    expect(result).toEqual({
      sessionToken: 'token-abc',
      userSession: {
        id: 1,
        login: 'alexandre',
        firstname: 'Alexandre',
        lastname: 'Silva',
      },
    });
  });

  it('maps LoggedUser into SessionPayload', async () => {
    const payload = await service.montarPayload({
      id: 10,
      login: 'john',
      firstname: 'John',
      lastname: 'Doe',
    });

    expect(payload).toEqual({
      id: 10,
      login: 'john',
      firstname: 'John',
      lastname: 'Doe',
    });
  });
});
