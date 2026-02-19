import envConfig from '@/env.config';
import setCookies from './setCookies';

describe('setCookies', () => {
  const originalIsProd = envConfig.node.isProd;
  const originalSecret = envConfig.session.cookieSecret;

  afterEach(() => {
    envConfig.node.isProd = originalIsProd;
    envConfig.session.cookieSecret = originalSecret;
  });

  it('registers cookie plugin with secret when available', async () => {
    envConfig.node.isProd = false;
    envConfig.session.cookieSecret = 'secret';
    const app = { register: jest.fn() } as any;

    await setCookies(app);

    expect(app.register).toHaveBeenCalledTimes(1);
    expect(app.register).toHaveBeenCalledWith(expect.any(Function), { secret: 'secret' });
  });

  it('throws in production without cookie secret', async () => {
    envConfig.node.isProd = true;
    envConfig.session.cookieSecret = '';
    const app = { register: jest.fn() } as any;

    await expect(setCookies(app)).rejects.toThrow('COOKIE_SECRET');
    expect(app.register).not.toHaveBeenCalled();
  });
});
