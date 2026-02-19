describe('envConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    delete process.env.NODE_ENV;
    delete process.env.SESSION_TTL;
    delete process.env.TRANSLATIONS_CACHE_TTL;
    delete process.env.AUTH_PROVIDER;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('uses defaults when env vars are not defined', async () => {
    const { default: envConfig } = await import('./env.config');

    expect(envConfig.node.env).toBe('development');
    expect(envConfig.node.isDev).toBe(true);
    expect(envConfig.session.ttl).toBe(604800);
    expect(envConfig.auth.provider).toBe('mock');
  });

  it('maps environment values correctly', async () => {
    process.env.NODE_ENV = 'production';
    process.env.SESSION_TTL = '60';
    process.env.TRANSLATIONS_CACHE_TTL = '120';
    process.env.AUTH_PROVIDER = 'redmine';

    const { default: envConfig } = await import('./env.config');

    expect(envConfig.node.env).toBe('production');
    expect(envConfig.node.isProd).toBe(true);
    expect(envConfig.node.isTest).toBe(false);
    expect(envConfig.session.ttl).toBe(60);
    expect(envConfig.translations.ttl).toBe(120);
    expect(envConfig.auth.provider).toBe('redmine');
  });
});

