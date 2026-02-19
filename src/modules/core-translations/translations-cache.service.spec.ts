import envConfig from '@/env.config';
import { Cache } from '../infra/cache/interface/Cache';
import { TranslationsCacheService } from './translations-cache.service';

describe('TranslationsCacheService', () => {
  const cacheMock: jest.Mocked<Cache> = {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    deleteByPrefix: jest.fn(),
    clear: jest.fn(),
    getKeysByPrefix: jest.fn(),
    delKey: jest.fn(),
  };

  let service: TranslationsCacheService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TranslationsCacheService(cacheMock);
  });

  it('gets and parses cached value', async () => {
    cacheMock.get.mockResolvedValue(JSON.stringify({ hello: 'ola' }));

    const result = await service.get('app:dev:pt-BR:common');

    expect(cacheMock.get).toHaveBeenCalledWith('translations:app:dev:pt-BR:common');
    expect(result).toEqual({ hello: 'ola' });
  });

  it('returns undefined when cache misses', async () => {
    cacheMock.get.mockResolvedValue(undefined);

    const result = await service.get('missing');

    expect(result).toBeUndefined();
  });

  it('sets value with prefix and ttl from config', async () => {
    await service.set('app:dev:pt-BR:common', { hello: 'ola' });

    expect(cacheMock.set).toHaveBeenCalledWith(
      'translations:app:dev:pt-BR:common',
      JSON.stringify({ hello: 'ola' }),
      envConfig.translations.ttl,
    );
  });

  it('deletes by key and prefix and clears namespace', async () => {
    await service.delete('k');
    await service.deleteByPrefix('app:dev');
    await service.clear();

    expect(cacheMock.delete).toHaveBeenCalledWith('translations:k');
    expect(cacheMock.deleteByPrefix).toHaveBeenNthCalledWith(1, 'translations:app:dev');
    expect(cacheMock.deleteByPrefix).toHaveBeenNthCalledWith(2, 'translations:');
  });
});
