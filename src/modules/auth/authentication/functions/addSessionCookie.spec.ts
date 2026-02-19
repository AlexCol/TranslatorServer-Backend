import envConfig from '@/env.config';
import addSessionCookie, { getSessionCookieOptions } from './addSessionCookie';

describe('addSessionCookie', () => {
  it('sets session cookie with computed options', () => {
    const res = { cookie: jest.fn() } as any;

    addSessionCookie(res, 'token-1', true);

    expect(res.cookie).toHaveBeenCalledWith('sessionToken', 'token-1', expect.objectContaining({ maxAge: 604800 }));
  });
});

describe('getSessionCookieOptions', () => {
  it('returns lax cookie in non production', () => {
    const original = envConfig.node.isProd;
    (envConfig.node as any).isProd = false;

    try {
      const options = getSessionCookieOptions(false);
      expect(options.secure).toBe(false);
      expect(options.sameSite).toBe('lax');
      expect(options.maxAge).toBeUndefined();
    } finally {
      (envConfig.node as any).isProd = original;
    }
  });

  it('returns secure none cookie in production', () => {
    const original = envConfig.node.isProd;
    (envConfig.node as any).isProd = true;

    try {
      const options = getSessionCookieOptions(true);
      expect(options.secure).toBe(true);
      expect(options.sameSite).toBe('none');
      expect(options.maxAge).toBe(604800);
    } finally {
      (envConfig.node as any).isProd = original;
    }
  });
});
