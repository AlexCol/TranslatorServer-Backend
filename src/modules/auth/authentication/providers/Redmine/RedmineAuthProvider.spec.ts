import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import envConfig from '@/env.config';
import { RedmineAuthProvider } from './RedmineAuthProvider';

describe('RedmineAuthProvider', () => {
  const provider = new RedmineAuthProvider();
  const originalUrl = envConfig.redmine.url;
  const originalFetch = global.fetch;

  afterEach(() => {
    envConfig.redmine.url = originalUrl;
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('throws for missing credentials', async () => {
    await expect(provider.validateUser('', '')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws when redmine url is missing', async () => {
    envConfig.redmine.url = '';
    await expect(provider.validateUser('u', 'p')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws UnauthorizedException for non-ok response', async () => {
    envConfig.redmine.url = 'http://redmine/users/current.json';
    global.fetch = jest.fn().mockResolvedValue({ ok: false });

    await expect(provider.validateUser('u', 'p')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('throws UnauthorizedException when body has no user', async () => {
    envConfig.redmine.url = 'http://redmine/users/current.json';
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as any);

    await expect(provider.validateUser('u', 'p')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('returns mapped logged user for valid response', async () => {
    envConfig.redmine.url = 'http://redmine/users/current.json';
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        user: {
          id: 10,
          login: 'alex',
          firstname: 'Alex',
          lastname: 'Silva',
        },
      }),
    } as any);

    await expect(provider.validateUser('alex', '123')).resolves.toEqual({
      id: 10,
      login: 'alex',
      firstname: 'Alex',
      lastname: 'Silva',
    });
  });

  it('wraps unknown fetch errors as BadRequestException', async () => {
    envConfig.redmine.url = 'http://redmine/users/current.json';
    global.fetch = jest.fn().mockRejectedValue(new Error('network down'));

    await expect(provider.validateUser('alex', '123')).rejects.toBeInstanceOf(BadRequestException);
  });
});
