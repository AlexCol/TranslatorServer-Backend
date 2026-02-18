import { Provider } from '@nestjs/common';
import { databaseProviders } from './providers/Database';
import envConfig from '@/env.config';

export function buildTranslarionProvider() {
  const providers = new Map<string, Provider[]>([['database', databaseProviders]]);

  const providerName = envConfig.translations.provider;
  const providersList = providers.get(providerName);
  if (providersList) {
    return providersList;
  }

  throw new Error(`Unsupported auth provider: ${providerName}`);
}
