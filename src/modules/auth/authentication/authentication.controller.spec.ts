import { UnauthorizedException } from '@nestjs/common';
import { AuthenticationController } from './authentication.controller';

describe('AuthenticationController', () => {
  const authServiceMock = {
    login: jest.fn(),
  };

  const sessionServiceMock = {
    deleteSession: jest.fn(),
    getSession: jest.fn(),
  };

  let controller: AuthenticationController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AuthenticationController(authServiceMock as any, sessionServiceMock as any);
  });

  it('logs in and returns user session payload', async () => {
    authServiceMock.login.mockResolvedValue({
      sessionToken: 'token-1',
      userSession: { id: 1, login: 'alex', firstname: 'Alex', lastname: 'Silva' },
    });
    const req = { headers: { 'remember-me': 'true' }, cookies: {} } as any;
    const res = { cookie: jest.fn(), clearCookie: jest.fn() } as any;

    const payload = await controller.login(req, res, { username: 'alex', password: '123' });

    expect(authServiceMock.login).toHaveBeenCalledWith('alex', '123');
    expect(res.cookie).toHaveBeenCalledWith('sessionToken', 'token-1', expect.objectContaining({ maxAge: 604800 }));
    expect(payload).toEqual({ id: 1, login: 'alex', firstname: 'Alex', lastname: 'Silva' });
  });

  it('logs out and clears cookie even without session token', async () => {
    const req = { cookies: {} } as any;
    const res = { clearCookie: jest.fn() } as any;

    const result = await controller.logout(req, res);

    expect(sessionServiceMock.deleteSession).not.toHaveBeenCalled();
    expect(res.clearCookie).toHaveBeenCalledWith('sessionToken', expect.any(Object));
    expect(result).toEqual({ data: 'Logout successful' });
  });

  it('deletes existing session on logout', async () => {
    const req = { cookies: { sessionToken: 'token-2' } } as any;
    const res = { clearCookie: jest.fn() } as any;

    await controller.logout(req, res);

    expect(sessionServiceMock.deleteSession).toHaveBeenCalledWith('token-2');
  });

  it('returns payload when session is valid', async () => {
    sessionServiceMock.getSession.mockResolvedValue({
      payload: { id: 1, login: 'alex', firstname: 'Alex', lastname: 'Silva' },
    });
    const req = { cookies: { sessionToken: 'token-3' } } as any;
    const res = { clearCookie: jest.fn() } as any;

    const result = await controller.checkSession(req, res);

    expect(result).toEqual({ id: 1, login: 'alex', firstname: 'Alex', lastname: 'Silva' });
  });

  it('clears cookie and throws when session is missing', async () => {
    const req = { cookies: {} } as any;
    const res = { clearCookie: jest.fn() } as any;

    await expect(controller.checkSession(req, res)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(res.clearCookie).toHaveBeenCalledWith('sessionToken', expect.any(Object));
  });
});
