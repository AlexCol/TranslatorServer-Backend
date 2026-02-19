import { UnauthorizedException } from '@nestjs/common';
import envConfig from '@/env.config';
import { generateToken } from '@/common/util/generateToken';
import { Cache } from '../infra/cache/interface/Cache';
import { SessionCacheService } from './session-cache.service';

jest.mock('@/common/util/generateToken', () => ({
  generateToken: jest.fn(),
}));

describe('SessionCacheService', () => {
  const cacheMock: jest.Mocked<Cache> = {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    deleteByPrefix: jest.fn(),
    clear: jest.fn(),
    getKeysByPrefix: jest.fn(),
    delKey: jest.fn(),
  };

  let service: SessionCacheService;
  const mockedGenerateToken = generateToken as jest.MockedFunction<typeof generateToken>;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SessionCacheService(cacheMock);
  });

  it('gets session when present and not expired', async () => {
    const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(1_000);
    cacheMock.get.mockResolvedValue(
      JSON.stringify({
        payload: { id: 1, login: 'alex', firstname: 'Alex', lastname: 'S' },
        createdAt: 100,
        expiresAt: 2_000,
      }),
    );

    try {
      const session = await service.getSession('token-1');
      expect(session?.payload.login).toBe('alex');
      expect(cacheMock.get).toHaveBeenCalledWith('session:token-1');
    } finally {
      nowSpy.mockRestore();
    }
  });

  it('removes expired session on read', async () => {
    const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(5_000);
    cacheMock.get.mockResolvedValue(
      JSON.stringify({
        payload: { id: 1, login: 'alex', firstname: 'Alex', lastname: 'S' },
        createdAt: 100,
        expiresAt: 4_999,
      }),
    );

    try {
      const session = await service.getSession('token-2');
      expect(session).toBeUndefined();
      expect(cacheMock.delete).toHaveBeenCalledWith('session:token-2');
    } finally {
      nowSpy.mockRestore();
    }
  });

  it('creates session with generated token and ttl', async () => {
    mockedGenerateToken.mockReturnValue('generated-token');
    const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(1_000);

    try {
      const token = await service.setSession({
        id: 7,
        login: 'alex',
        firstname: 'Alex',
        lastname: 'Silva',
      });

      expect(token).toBe('generated-token');
      expect(cacheMock.set).toHaveBeenCalledWith(
        'session:generated-token',
        JSON.stringify({
          payload: { id: 7, login: 'alex', firstname: 'Alex', lastname: 'Silva' },
          createdAt: 1_000,
          expiresAt: 1_000 + envConfig.session.ttl * 1000,
        }),
        envConfig.session.ttl,
      );
    } finally {
      nowSpy.mockRestore();
    }
  });

  it('updates active sessions by login and skips expired ones', async () => {
    cacheMock.getKeysByPrefix.mockResolvedValue(['session:1', 'session:2', 'session:3']);

    const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(10_000);
    cacheMock.get.mockImplementation(async (key: string) => {
      const dataByKey: Record<string, string | undefined> = {
        'session:1': JSON.stringify({
          payload: { id: 1, login: 'alex', firstname: 'A', lastname: 'S' },
          createdAt: 1,
          expiresAt: 15_000,
        }),
        'session:2': JSON.stringify({
          payload: { id: 2, login: 'other', firstname: 'O', lastname: 'T' },
          createdAt: 1,
          expiresAt: 15_000,
        }),
        'session:3': JSON.stringify({
          payload: { id: 3, login: 'alex', firstname: 'A', lastname: 'S' },
          createdAt: 1,
          expiresAt: 9_000,
        }),
      };
      return dataByKey[key];
    });

    try {
      const updated = await service.updateSessionsByUserId('alex', {
        id: 1,
        login: 'alex',
        firstname: 'Alexandre',
        lastname: 'Silva',
      });

      expect(updated).toBe(1);
      expect(cacheMock.set).toHaveBeenCalledTimes(1);
      expect(cacheMock.set).toHaveBeenCalledWith(
        'session:1',
        JSON.stringify({
          payload: { id: 1, login: 'alex', firstname: 'Alexandre', lastname: 'Silva' },
          createdAt: 1,
          expiresAt: 15_000,
        }),
        5,
      );
      expect(cacheMock.delete).toHaveBeenCalledWith('session:3');
    } finally {
      nowSpy.mockRestore();
    }
  });

  it('refreshes only when session is near expiration', async () => {
    const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(1_000);
    const oneDayMs = 24 * 60 * 60 * 1000;

    cacheMock.get.mockResolvedValue(
      JSON.stringify({
        payload: { id: 1, login: 'alex', firstname: 'Alex', lastname: 'S' },
        createdAt: 100,
        expiresAt: 1_000 + oneDayMs * 2,
      }),
    );

    try {
      const refreshed = await service.refreshSession('token-1');
      expect(refreshed).toBe(false);
      expect(cacheMock.set).not.toHaveBeenCalled();
    } finally {
      nowSpy.mockRestore();
    }
  });

  it('extends expiration when session has less than one day left', async () => {
    const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(10_000);
    const oneDayMs = 24 * 60 * 60 * 1000;
    cacheMock.get.mockResolvedValue(
      JSON.stringify({
        payload: { id: 1, login: 'alex', firstname: 'Alex', lastname: 'S' },
        createdAt: 100,
        expiresAt: 10_000 + 1_000,
      }),
    );

    try {
      const refreshed = await service.refreshSession('token-2');
      expect(refreshed).toBe(true);
      expect(cacheMock.set).toHaveBeenCalledWith(
        'session:token-2',
        JSON.stringify({
          payload: { id: 1, login: 'alex', firstname: 'Alex', lastname: 'S' },
          createdAt: 100,
          expiresAt: 10_000 + oneDayMs,
        }),
        oneDayMs / 1000,
      );
    } finally {
      nowSpy.mockRestore();
    }
  });

  it('throws UnauthorizedException for invalid session refresh', async () => {
    cacheMock.get.mockResolvedValue(undefined);

    await expect(service.refreshSession('unknown')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('deletes one session, clears all, and revokes all user sessions', async () => {
    await service.deleteSession('abc');
    await service.clearSessions();

    cacheMock.getKeysByPrefix.mockResolvedValue(['session:1', 'session:2']);
    cacheMock.get.mockImplementation(async (key: string) => {
      const values: Record<string, string | undefined> = {
        'session:1': JSON.stringify({
          payload: { id: 1, login: 'alex', firstname: 'A', lastname: 'S' },
          createdAt: 0,
          expiresAt: 100_000,
        }),
        'session:2': JSON.stringify({
          payload: { id: 2, login: 'other', firstname: 'O', lastname: 'T' },
          createdAt: 0,
          expiresAt: 100_000,
        }),
      };
      return values[key];
    });

    const revoked = await service.deleteAllUserSessions('alex');

    expect(cacheMock.delete).toHaveBeenCalledWith('session:abc');
    expect(cacheMock.deleteByPrefix).toHaveBeenCalledWith('session:');
    expect(revoked).toBe(1);
    expect(cacheMock.delete).toHaveBeenCalledWith('session:1');
  });
});
