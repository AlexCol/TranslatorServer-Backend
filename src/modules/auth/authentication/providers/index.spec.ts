import { MockAuthProvider } from './Mock/MockProvider';
import { RedmineAuthProvider } from './Redmine/RedmineAuthProvider';
import { buildAuthProvider } from './index';
import envConfig from '@/env.config';

describe('buildAuthProvider', () => {
  const originalProvider = envConfig.auth.provider;

  afterEach(() => {
    envConfig.auth.provider = originalProvider;
  });

  it('builds mock provider', () => {
    envConfig.auth.provider = 'mock';
    expect(buildAuthProvider()).toBeInstanceOf(MockAuthProvider);
  });

  it('builds redmine provider', () => {
    envConfig.auth.provider = 'redmine';
    expect(buildAuthProvider()).toBeInstanceOf(RedmineAuthProvider);
  });

  it('throws for unsupported provider', () => {
    envConfig.auth.provider = 'unknown';
    expect(() => buildAuthProvider()).toThrow('Unsupported auth provider: unknown');
  });
});
