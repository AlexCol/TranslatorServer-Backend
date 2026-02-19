import { ModuleRef } from '@nestjs/core';
import { LanguageService } from '../core-translations/language/language.service';
import { NamespaceService } from '../core-translations/namespace/namespace.service';
import { TranslationsService } from '../core-translations/translations/translations.service';
import { TranslationsCacheService } from '../core-translations/translations-cache.service';
import { CdnPublisherService } from './cdn-publisher.service';

describe('CdnPublisherService', () => {
  const cacheMock = {
    deleteByPrefix: jest.fn(),
  } as unknown as jest.Mocked<TranslationsCacheService>;

  const cdnPublisherMock = {
    clearFiles: jest.fn(),
    uploadToCdn: jest.fn(),
  };

  const languageServiceMock = {
    listLanguages: jest.fn(),
  };

  const namespaceServiceMock = {
    listNamespaces: jest.fn(),
  };

  const translationsServiceMock = {
    loadWithFallBack: jest.fn(),
  };

  const modRefMock = {
    get: jest.fn(),
  } as unknown as jest.Mocked<ModuleRef>;

  let service: CdnPublisherService;

  beforeEach(() => {
    jest.clearAllMocks();
    modRefMock.get.mockImplementation((token: any) => {
      if (token === LanguageService) return languageServiceMock as any;
      if (token === NamespaceService) return namespaceServiceMock as any;
      if (token === TranslationsService) return translationsServiceMock as any;
      return undefined as any;
    });
    service = new CdnPublisherService(cacheMock, cdnPublisherMock as any, modRefMock);
  });

  it('publishes all namespaces for all languages and clears cache first', async () => {
    languageServiceMock.listLanguages.mockResolvedValue(['en', 'pt-BR']);
    namespaceServiceMock.listNamespaces.mockImplementation(async (_s: string, _e: string, language: string) => {
      if (language === 'en') return ['common'];
      return ['common', 'errors'];
    });
    translationsServiceMock.loadWithFallBack.mockImplementation(async ({ language, namespace }: any) => {
      if (language === 'pt-BR' && namespace === 'errors') return undefined;
      return { hello: 'world' };
    });

    const result = await service.pushToCdn('app', 'dev');

    expect(result).toContain('CDN');
    expect(cdnPublisherMock.clearFiles).toHaveBeenCalledWith('app', 'dev');
    expect(cacheMock.deleteByPrefix).toHaveBeenCalledWith('app:dev:');
    expect(cdnPublisherMock.uploadToCdn).toHaveBeenCalledTimes(2);
    expect(cdnPublisherMock.uploadToCdn).toHaveBeenCalledWith('app', 'dev', 'en', 'common', { hello: 'world' });
    expect(cdnPublisherMock.uploadToCdn).toHaveBeenCalledWith('app', 'dev', 'pt-BR', 'common', { hello: 'world' });
  });
});
