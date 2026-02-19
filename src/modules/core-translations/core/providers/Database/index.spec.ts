import { DatabaseEnvironmentProvider } from './DatabaseEnvironmentProvider';
import { DatabaseLanguageProvider } from './DatabaseLanguageProvider';
import { DatabaseNamespaceProvider } from './DatabaseNamespaceProvider';
import { DatabasePublisherProvider } from './DatabasePublisherProvider';
import { DatabaseSystemProvider } from './DatabaseSystemProvider';
import { DatabaseTranslationProvider } from './DatabaseTranslationProvider';
import { databaseProviders } from './index';

describe('databaseProviders', () => {
  it('exposes all database provider bindings', () => {
    const classes = databaseProviders.map((provider: any) => provider.useClass);
    expect(classes).toEqual(
      expect.arrayContaining([
        DatabaseTranslationProvider,
        DatabaseLanguageProvider,
        DatabaseEnvironmentProvider,
        DatabaseNamespaceProvider,
        DatabasePublisherProvider,
        DatabaseSystemProvider,
      ]),
    );
  });
});
