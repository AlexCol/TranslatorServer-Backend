import { DiagnosticService } from './diagnostic.service';

describe('DiagnosticService', () => {
  const systemServiceMock = {
    listSystems: jest.fn(),
  };

  const environmentServiceMock = {
    listEnvironments: jest.fn(),
  };

  const languageServiceMock = {
    listLanguages: jest.fn(),
    getBaseLanguage: jest.fn(),
  };

  const namespaceServiceMock = {
    listNamespaces: jest.fn(),
  };

  const translationsServiceMock = {
    getTranslationStatus: jest.fn(),
  };

  let service: DiagnosticService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new DiagnosticService(
      systemServiceMock as any,
      environmentServiceMock as any,
      languageServiceMock as any,
      namespaceServiceMock as any,
      translationsServiceMock as any,
    );
  });

  it('builds overview with sorting, totals and non-base percentage rules', async () => {
    systemServiceMock.listSystems.mockResolvedValue(['zeta', 'alpha']);

    environmentServiceMock.listEnvironments.mockImplementation(async (system: string) => {
      if (system === 'alpha') return ['prod', 'dev'];
      if (system === 'zeta') return ['dev'];
      return [];
    });

    languageServiceMock.listLanguages.mockImplementation(async (system: string, environment: string) => {
      if (system === 'alpha' && environment === 'dev') return [];
      if (system === 'alpha' && environment === 'prod') return ['pt-BR', 'en'];
      if (system === 'zeta' && environment === 'dev') return ['pt-BR', 'en'];
      return [];
    });

    languageServiceMock.getBaseLanguage.mockImplementation(async (system: string, environment: string) => {
      if (system === 'alpha' && environment === 'prod') return null;
      if (system === 'zeta' && environment === 'dev') return 'en';
      return null;
    });

    namespaceServiceMock.listNamespaces.mockImplementation(
      async (system: string, environment: string, language: string) => {
        if (system === 'zeta' && environment === 'dev' && language === 'en') return ['common'];
        if (system === 'zeta' && environment === 'dev' && language === 'pt-BR') return ['errors', 'common'];
        return [];
      },
    );

    translationsServiceMock.getTranslationStatus.mockImplementation(async ({ language, namespace }: any) => {
      if (language === 'en' && namespace === 'common') {
        return { namespace: 'common', language: 'en', total: 10, translated: 10, missing: 0, percentage: 100 };
      }
      if (language === 'pt-BR' && namespace === 'common') {
        return { namespace: 'common', language: 'pt-BR', total: 10, translated: 8, missing: 2, percentage: 80 };
      }
      return { namespace: 'errors', language: 'pt-BR', total: 5, translated: 0, missing: 5, percentage: 0 };
    });

    const overview = await service.getOverview();

    expect(overview.totals).toEqual({
      systems: 2,
      environments: 3,
      languages: 2,
      namespaces: 3,
      totalTerms: 25,
      translatedTerms: 18,
      missingTerms: 7,
      translatedPercentage: 53,
    });

    expect(overview.systems.map((s) => s.system)).toEqual(['alpha', 'zeta']);
    expect(overview.systems[0].environments.map((e) => e.environment)).toEqual(['dev', 'prod']);
    expect(overview.systems[0].environments[1].baseLanguage).toBeNull();
    expect(overview.systems[0].environments[1].languages.map((l) => l.language)).toEqual(['en', 'pt-BR']);
    expect(overview.systems[1].translatedPercentage).toBe(53);
    expect(overview.systems[1].environments[0].languages[0]).toEqual(
      expect.objectContaining({
        language: 'en',
        isBase: true,
        translatedPercentage: 0,
      }),
    );
  });
});
