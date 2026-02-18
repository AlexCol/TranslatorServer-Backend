import { Type } from '@nestjs/common';
import { AuthProvider } from '../interfaces/AuthProvider';
import { MockAuthProvider } from './Mock/MockProvider';
import { RedmineAuthProvider } from './Redmine/RedmineAuthProvider';
import envConfig from '@/env.config';

export function buildAuthProvider() {
  const isProduction = envConfig.node.isProd;
  const providers = new Map<string, Type<AuthProvider>>([
    ['redmine', RedmineAuthProvider],
    ['mock', MockAuthProvider],
  ]);

  const providerName = envConfig.auth.provider;
  // if (isProduction && providerName === 'mock') {
  //   throw new Error('Mock auth provider is not allowed in production environment');
  // }

  const ProviderClass = providers.get(providerName);

  if (ProviderClass) {
    return new ProviderClass();
  }
  throw new Error(`Unsupported auth provider: ${providerName}`);
}
