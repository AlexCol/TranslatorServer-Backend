import { validateLanguage } from '../common/validateLanguage';
import { TranslationsCacheService } from '../translations-cache.service';
import { LanguageService } from './language.service';

jest.mock('../common/validateLanguage', () => ({
  validateLanguage: jest.fn(),
}));

describe('LanguageService', () => {
  const cacheMock = {
    deleteByPrefix: jest.fn(),
  } as unknown as jest.Mocked<TranslationsCacheService>;

  const providerMock = {
    listLanguages: jest.fn(),
    createLanguage: jest.fn(),
    deleteLanguage: jest.fn(),
    getBaseLanguage: jest.fn(),
    demoteBaseLanguage: jest.fn(),
    promoteToBaseLanguage: jest.fn(),
  };

  let service: LanguageService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new LanguageService(cacheMock, providerMock as any);
  });

  it('lists languages and gets base language', async () => {
    providerMock.listLanguages.mockResolvedValue(['en', 'pt-BR']);
    providerMock.getBaseLanguage.mockResolvedValue('en');

    const list = await service.listLanguages('app', 'dev');
    const base = await service.getBaseLanguage('app', 'dev');

    expect(list).toEqual(['en', 'pt-BR']);
    expect(base).toBe('en');
  });

  it('validates language and invalidates cache on create/delete', async () => {
    await service.createLanguage('app', 'pt-BR');
    await service.deleteLanguage('app', 'pt-BR');

    expect(validateLanguage).toHaveBeenCalledWith('pt-BR');
    expect(providerMock.createLanguage).toHaveBeenCalledWith('app', 'pt-BR');
    expect(providerMock.deleteLanguage).toHaveBeenCalledWith('app', 'pt-BR');
    expect(cacheMock.deleteByPrefix).toHaveBeenNthCalledWith(1, 'app:dev:pt-BR:');
    expect(cacheMock.deleteByPrefix).toHaveBeenNthCalledWith(2, 'app:dev:pt-BR:');
  });

  it('validates language for promote/demote operations', async () => {
    await service.demoteBaseLanguage('app', 'pt-BR');
    await service.promoteToBaseLanguage('app', 'pt-BR');

    expect(validateLanguage).toHaveBeenCalledWith('pt-BR');
    expect(providerMock.demoteBaseLanguage).toHaveBeenCalledWith('app', 'pt-BR');
    expect(providerMock.promoteToBaseLanguage).toHaveBeenCalledWith('app', 'pt-BR');
  });
});
