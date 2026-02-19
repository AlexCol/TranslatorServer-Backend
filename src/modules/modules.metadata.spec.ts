import 'reflect-metadata';

import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { AuthenticationModule } from '@/modules/auth/authentication/authentication.module';
import { CdnPublisherModule } from '@/modules/cdn-publisher/cdn-publisher.module';
import { CoreTranslationsModule } from '@/modules/core-translations/core-translations.module';
import { InfraModule } from '@/modules/infra/infra.module';
import { CacheModule } from '@/modules/infra/cache/cache.module';
import { DatabaseModule } from '@/modules/infra/database/database.module';
import { KnexModule } from '@/modules/infra/database/knex/knex.module';
import { SessionModule } from '@/modules/session/session.module';
import { GlobalThrottlerModule } from '@/modules/throttler/global-throttler.module';

describe('module metadata', () => {
  it('registers providers in app and auth/session modules', () => {
    const appProviders = Reflect.getMetadata('providers', AppModule) as any[];
    const authProviders = Reflect.getMetadata('providers', AuthenticationModule) as any[];
    const sessionProviders = Reflect.getMetadata('providers', SessionModule) as any[];

    expect(appProviders.some((provider) => provider.provide === APP_GUARD)).toBe(true);
    expect(authProviders.some((provider) => provider.provide === APP_GUARD)).toBe(true);
    expect(sessionProviders.some((provider) => provider.provide === APP_INTERCEPTOR)).toBe(true);
  });

  it('has expected imports/exports in infra and database modules', () => {
    const infraImports = Reflect.getMetadata('imports', InfraModule) as any[];
    const cacheExports = Reflect.getMetadata('exports', CacheModule) as any[];
    const dbImports = Reflect.getMetadata('imports', DatabaseModule) as any[];
    const dbExports = Reflect.getMetadata('exports', DatabaseModule) as any[];

    expect(infraImports).toEqual(expect.arrayContaining([DatabaseModule, CacheModule]));
    expect(dbImports).toEqual(expect.arrayContaining([KnexModule]));
    expect(dbExports).toEqual(expect.arrayContaining([KnexModule]));
    expect(cacheExports).toHaveLength(1);
  });

  it('loads remaining modules metadata', () => {
    expect(Reflect.getMetadata('imports', AppModule)).toBeDefined();
    expect(Reflect.getMetadata('imports', CoreTranslationsModule)).toBeDefined();
    expect(Reflect.getMetadata('imports', CdnPublisherModule)).toBeDefined();
    expect(Reflect.getMetadata('imports', GlobalThrottlerModule)).toBeDefined();
    expect(Reflect.getMetadata('providers', KnexModule)).toBeDefined();
  });

  it('builds knex provider factory from module metadata', async () => {
    const providers = Reflect.getMetadata('providers', KnexModule) as any[];
    const knexProvider = providers.find((provider) => typeof provider.useFactory === 'function');
    const knexInstance = await knexProvider.useFactory();

    expect(knexInstance).toBeDefined();
    expect(typeof knexInstance.destroy).toBe('function');
    await knexInstance.destroy();
  });
});
