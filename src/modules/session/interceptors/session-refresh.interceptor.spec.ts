import { UnauthorizedException } from '@nestjs/common';
import { of } from 'rxjs';
import addSessionCookie from '@/modules/auth/authentication/functions/addSessionCookie';
import { SessionRefreshInterceptor } from './session-refresh.interceptor';

jest.mock('@/modules/auth/authentication/functions/addSessionCookie', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('SessionRefreshInterceptor', () => {
  const sessionServiceMock = {
    refreshSession: jest.fn(),
  };

  const reflectorMock = {
    getAllAndOverride: jest.fn(),
  };

  const next = { handle: jest.fn(() => of('ok')) };

  const createContext = (req: any, res: any) =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => req,
        getResponse: () => res,
      }),
    }) as any;

  let interceptor: SessionRefreshInterceptor;

  beforeEach(() => {
    jest.clearAllMocks();
    interceptor = new SessionRefreshInterceptor(sessionServiceMock as any, reflectorMock as any);
  });

  it('bypasses refresh for public routes', async () => {
    reflectorMock.getAllAndOverride.mockReturnValue(true);
    const req = { cookies: {} };
    const res = { clearCookie: jest.fn() };

    const output = await interceptor.intercept(createContext(req, res), next as any);

    expect(sessionServiceMock.refreshSession).not.toHaveBeenCalled();
    expect(output).toBeDefined();
  });

  it('bypasses refresh when token is missing', async () => {
    reflectorMock.getAllAndOverride.mockReturnValue(false);
    const req = { cookies: {} };
    const res = { clearCookie: jest.fn() };

    await interceptor.intercept(createContext(req, res), next as any);

    expect(sessionServiceMock.refreshSession).not.toHaveBeenCalled();
  });

  it('refreshes and renews cookie when session was extended', async () => {
    reflectorMock.getAllAndOverride.mockReturnValue(false);
    sessionServiceMock.refreshSession.mockResolvedValue(true);
    const req = { cookies: { sessionToken: 'token-1' }, headers: { 'remember-me': 'true' } };
    const res = { clearCookie: jest.fn() };

    await interceptor.intercept(createContext(req, res), next as any);

    expect(sessionServiceMock.refreshSession).toHaveBeenCalledWith('token-1');
    expect(addSessionCookie).toHaveBeenCalledWith(res, 'token-1', true);
  });

  it('clears cookie and rethrows on refresh error', async () => {
    reflectorMock.getAllAndOverride.mockReturnValue(false);
    sessionServiceMock.refreshSession.mockRejectedValue(new UnauthorizedException('expired'));
    const req = { cookies: { sessionToken: 'token-2' }, headers: {} };
    const res = { clearCookie: jest.fn() };

    await expect(interceptor.intercept(createContext(req, res), next as any)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(res.clearCookie).toHaveBeenCalledWith('sessionToken');
  });
});
