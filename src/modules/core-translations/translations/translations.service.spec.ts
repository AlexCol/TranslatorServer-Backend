import { TranslationsCacheService } from '../translations-cache.service';
import { TranslationsService } from './translations.service';

describe('TranslationsService', () => {
  const cacheMock: jest.Mocked<TranslationsCacheService> = {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    deleteByPrefix: jest.fn(),
    clear: jest.fn(),
  } as unknown as jest.Mocked<TranslationsCacheService>;

  const providerMock = {
    loadWithFallBack: jest.fn(),
    loadWithoutFallBack: jest.fn(),
    createKey: jest.fn(),
    createTranslation: jest.fn(),
    updateKey: jest.fn(),
    deleteKey: jest.fn(),
    getTranslationStatus: jest.fn(),
  };

  let service: TranslationsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TranslationsService(cacheMock, providerMock as any);
  });

  it('returns cached json for loadWithFallBack cache hit', async () => {
    const entry = { system: 'app', environment: 'dev', language: 'pt-BR', namespace: 'common' };
    cacheMock.get.mockResolvedValue({ hello: 'cache' });

    const result = await service.loadWithFallBack(entry);

    expect(result).toEqual({ hello: 'cache' });
    expect(providerMock.loadWithFallBack).not.toHaveBeenCalled();
    expect(cacheMock.get).toHaveBeenCalledWith('app:dev:pt-BR:common');
  });

  it('loads provider and stores cache for loadWithoutFallBack cache miss', async () => {
    const entry = { system: 'app', environment: 'dev', language: 'pt-BR', namespace: 'common' };
    cacheMock.get.mockResolvedValue(undefined);
    providerMock.loadWithoutFallBack.mockResolvedValue({ hello: 'provider' });

    const result = await service.loadWithoutFallBack(entry);

    expect(result).toEqual({ hello: 'provider' });
    expect(providerMock.loadWithoutFallBack).toHaveBeenCalledWith(entry);
    expect(cacheMock.set).toHaveBeenCalledWith('app:dev:pt-BR:common:clean', { hello: 'provider' });
  });

  it('invalidates dev cache on key create/update/delete and translation create', async () => {
    const keys = [{ key: 'hello', value: 'ola' }] as any;

    await service.createKey('app', 'common', keys);
    await service.createTranslation('app', 'pt-BR', 'common', keys);
    await service.updateKey('app', 'pt-BR', 'common', keys);
    await service.deleteKey('app', 'common', ['hello']);

    expect(providerMock.createKey).toHaveBeenCalledWith(
      { system: 'app', environment: 'dev', language: '', namespace: 'common' },
      keys,
    );
    expect(providerMock.createTranslation).toHaveBeenCalledWith(
      { system: 'app', environment: 'dev', language: 'pt-BR', namespace: 'common' },
      keys,
    );
    expect(providerMock.updateKey).toHaveBeenCalledWith(
      { system: 'app', environment: 'dev', language: 'pt-BR', namespace: 'common' },
      keys,
    );
    expect(providerMock.deleteKey).toHaveBeenCalledWith(
      { system: 'app', environment: 'dev', language: '', namespace: 'common' },
      ['hello'],
    );
    expect(cacheMock.deleteByPrefix).toHaveBeenCalledTimes(4);
    expect(cacheMock.deleteByPrefix).toHaveBeenCalledWith('app:dev');
  });

  it('delegates translation status retrieval', async () => {
    const entry = { system: 'app', environment: 'dev', language: 'pt-BR', namespace: 'common' };
    const status = {
      namespace: 'common',
      language: 'pt-BR',
      total: 10,
      translated: 8,
      missing: 2,
      percentage: 80,
    };
    providerMock.getTranslationStatus.mockResolvedValue(status);

    const result = await service.getTranslationStatus(entry);

    expect(result).toEqual(status);
    expect(providerMock.getTranslationStatus).toHaveBeenCalledWith(entry);
  });
});
