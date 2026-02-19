import { UnauthorizedException } from '@nestjs/common';
import { SessionTokenGuard } from './session.guard';

describe('SessionTokenGuard', () => {
  const sessionServiceMock = {
    getSession: jest.fn(),
  };

  const reflectorMock = {
    getAllAndOverride: jest.fn(),
  };

  const createContext = (req: any, res: any) =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => req,
        getResponse: () => res,
      }),
    }) as any;

  let guard: SessionTokenGuard;

  beforeEach(() => {
    jest.clearAllMocks();
    guard = new SessionTokenGuard(sessionServiceMock as any, reflectorMock as any);
  });

  it('allows public routes without session validation', async () => {
    reflectorMock.getAllAndOverride.mockReturnValue(true);
    const req = { cookies: {} } as any;
    const res = { clearCookie: jest.fn() } as any;

    const allowed = await guard.canActivate(createContext(req, res));

    expect(allowed).toBe(true);
    expect(sessionServiceMock.getSession).not.toHaveBeenCalled();
  });

  it('throws and clears cookie when session token is missing', async () => {
    reflectorMock.getAllAndOverride.mockReturnValue(false);
    const req = { cookies: {} } as any;
    const res = { clearCookie: jest.fn() } as any;

    await expect(guard.canActivate(createContext(req, res))).rejects.toBeInstanceOf(UnauthorizedException);
    expect(res.clearCookie).toHaveBeenCalledWith('sessionToken');
  });

  it('throws and clears cookie when session is invalid', async () => {
    reflectorMock.getAllAndOverride.mockReturnValue(false);
    sessionServiceMock.getSession.mockResolvedValue(undefined);
    const req = { cookies: { sessionToken: 'token-1' } } as any;
    const res = { clearCookie: jest.fn() } as any;

    await expect(guard.canActivate(createContext(req, res))).rejects.toBeInstanceOf(UnauthorizedException);
    expect(sessionServiceMock.getSession).toHaveBeenCalledWith('token-1');
    expect(res.clearCookie).toHaveBeenCalledWith('sessionToken');
  });

  it('attaches user payload and allows when session is valid', async () => {
    reflectorMock.getAllAndOverride.mockReturnValue(false);
    sessionServiceMock.getSession.mockResolvedValue({
      payload: { id: 1, login: 'alex', firstname: 'Alex', lastname: 'Silva' },
    });
    const req = { cookies: { sessionToken: 'token-2' } } as any;
    const res = { clearCookie: jest.fn() } as any;

    const allowed = await guard.canActivate(createContext(req, res));

    expect(allowed).toBe(true);
    expect(req.user).toEqual({
      payload: { id: 1, login: 'alex', firstname: 'Alex', lastname: 'Silva' },
    });
  });
});
