import envConfig from '@/env.config';
import { databaseProviders } from './providers/Database';
import { buildTranslarionProvider } from './index';

describe('buildTranslarionProvider', () => {
  const originalProvider = envConfig.translations.provider;

  afterEach(() => {
    envConfig.translations.provider = originalProvider;
  });

  it('returns database providers when configured', () => {
    envConfig.translations.provider = 'database';
    expect(buildTranslarionProvider()).toBe(databaseProviders);
  });

  it('throws for unsupported provider', () => {
    envConfig.translations.provider = 'unsupported';
    expect(() => buildTranslarionProvider()).toThrow('Unsupported auth provider: unsupported');
  });
});
