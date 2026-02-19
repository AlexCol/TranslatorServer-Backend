import { BadRequestException } from '@nestjs/common';
import { DatabaseTranslationProvider } from './DatabaseTranslationProvider';

const getSystemIdMock = jest.fn();
const getEnvironmentIdMock = jest.fn();
const getLanguagesMock = jest.fn();
const getNamespaceIdMock = jest.fn();

jest.mock('./utils', () => ({
  getSystemId: (...args: any[]) => getSystemIdMock(...args),
}));
jest.mock('./utils/getEnvironmentId', () => ({
  getEnvironmentId: (...args: any[]) => getEnvironmentIdMock(...args),
}));
jest.mock('./utils/getLanguages', () => ({
  getLanguages: (...args: any[]) => getLanguagesMock(...args),
}));
jest.mock('./utils/getNamespaceId', () => ({
  getNamespaceId: (...args: any[]) => getNamespaceIdMock(...args),
}));

describe('DatabaseTranslationProvider', () => {
  const createKnex = () => {
    const update = jest.fn();
    const where = jest.fn().mockReturnValue({ update });
    const insert = jest.fn();
    const first = jest.fn();
    const select = jest.fn().mockReturnValue({ from: jest.fn().mockReturnValue({ where: jest.fn().mockReturnValue({ first }) }) });
    const table = jest.fn().mockReturnValue({ where, insert });
    const transaction = jest.fn().mockImplementation(async (cb: any) => cb(table));
    return { knex: Object.assign(table, { transaction, select }) as any, update, insert, first };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads with fallback for base and derived language', async () => {
    const { knex } = createKnex();
    getSystemIdMock.mockResolvedValue(1);
    getEnvironmentIdMock.mockResolvedValue(2);
    getLanguagesMock.mockResolvedValue([{ code: 'en', isBase: 1 }, { code: 'pt-BR', isBase: 0 }]);
    const provider = new DatabaseTranslationProvider(knex);
    const getTranslationSpy = jest.spyOn(provider as any, 'getTranslation');

    getTranslationSpy.mockResolvedValueOnce({ id: 1, namespaceId: 1, json: '{"hello":"hello"}' });
    await expect(
      provider.loadWithFallBack({ system: 'app', environment: 'dev', language: 'en', namespace: 'common' }),
    ).resolves.toEqual({ hello: 'hello' });

    getTranslationSpy.mockResolvedValueOnce({ id: 1, namespaceId: 1, json: '{"hello":"hello"}' });
    getTranslationSpy.mockResolvedValueOnce({ id: 2, namespaceId: 2, json: '{"hello":"ola"}' });
    getTranslationSpy.mockResolvedValueOnce({ id: 3, namespaceId: 3, json: '{"bye":"tchau"}' });
    await expect(
      provider.loadWithFallBack({ system: 'app', environment: 'dev', language: 'pt-BR', namespace: 'common' }),
    ).resolves.toEqual({ hello: 'ola', bye: 'tchau' });
  });

  it('loads without fallback and nulls missing values', async () => {
    const { knex } = createKnex();
    getSystemIdMock.mockResolvedValue(1);
    getEnvironmentIdMock.mockResolvedValue(2);
    getLanguagesMock.mockResolvedValue([{ code: 'en', isBase: 1 }, { code: 'pt-BR', isBase: 0 }]);
    const provider = new DatabaseTranslationProvider(knex);
    const getTranslationSpy = jest.spyOn(provider as any, 'getTranslation');
    getTranslationSpy.mockResolvedValueOnce({ id: 1, namespaceId: 1, json: '{"k1":"v1","k2":"v2"}' });
    getTranslationSpy.mockResolvedValueOnce({ id: 2, namespaceId: 2, json: '{"k2":"v2-pt"}' });

    await expect(
      provider.loadWithoutFallBack({ system: 'app', environment: 'dev', language: 'pt-BR', namespace: 'common' }),
    ).resolves.toEqual({ k1: null, k2: 'v2-pt' });
  });

  it('creates and updates keys/translations', async () => {
    const { knex, update } = createKnex();
    const provider = new DatabaseTranslationProvider(knex);
    const getTranslationSpy = jest.spyOn(provider as any, 'getTranslation');

    getTranslationSpy.mockResolvedValueOnce({ id: 1, namespaceId: 10, json: '{"k1":"v1"}' });
    await provider.createKey(
      { system: 'app', environment: 'dev', language: 'en', namespace: 'common' },
      [{ key: 'k2', value: 'v2' }],
    );
    expect(update).toHaveBeenCalled();

    getTranslationSpy.mockResolvedValueOnce({ id: 1, namespaceId: 10, json: '{"k1":"v1"}' });
    getTranslationSpy.mockResolvedValueOnce({ id: 2, namespaceId: 20, json: '{"k1":"v1-pt"}' });
    await provider.createTranslation(
      { system: 'app', environment: 'dev', language: 'pt-BR', namespace: 'common' },
      [{ key: 'k1', value: 'novo' }],
    );
    expect(update).toHaveBeenCalled();

    getTranslationSpy.mockResolvedValueOnce({ id: 2, namespaceId: 20, json: '{"k1":"v1-pt"}' });
    await provider.updateKey(
      { system: 'app', environment: 'dev', language: 'pt-BR', namespace: 'common' },
      [{ key: 'k1', value: 'updated' }],
    );
    expect(update).toHaveBeenCalled();
  });

  it('deletes keys for all languages and computes translation status', async () => {
    const { knex, update } = createKnex();
    getSystemIdMock.mockResolvedValue(1);
    getEnvironmentIdMock.mockResolvedValue(2);
    getLanguagesMock.mockResolvedValue([
      { id: 1, code: 'en', isBase: 1 },
      { id: 2, code: 'pt-BR', isBase: 0 },
    ]);
    const provider = new DatabaseTranslationProvider(knex);
    const getTranslationSpy = jest.spyOn(provider as any, 'getTranslation');

    getTranslationSpy.mockResolvedValueOnce({ id: 1, namespaceId: 11, json: '{"k1":"v1","k2":"v2"}' });
    getTranslationSpy.mockResolvedValueOnce({ id: 2, namespaceId: 22, json: '{"k1":"v1-pt"}' });

    await provider.deleteKey({ system: 'app', environment: 'dev', language: 'en', namespace: 'common' }, ['k1']);
    expect(update).toHaveBeenCalled();

    jest.spyOn(provider, 'loadWithoutFallBack').mockResolvedValue({ k1: 'v1', k2: null });
    await expect(
      provider.getTranslationStatus({ system: 'app', environment: 'dev', language: 'pt-BR', namespace: 'common' }),
    ).resolves.toEqual({
      namespace: 'common',
      language: 'pt-BR',
      total: 2,
      translated: 1,
      missing: 1,
      percentage: 50,
    });
  });

  it('returns empty translation when row does not exist (private getTranslation)', async () => {
    const { knex, first } = createKnex();
    getSystemIdMock.mockResolvedValue(1);
    getEnvironmentIdMock.mockResolvedValue(2);
    getLanguagesMock.mockResolvedValue([{ id: 7, code: 'en', isBase: 1 }]);
    getNamespaceIdMock.mockResolvedValue(99);
    first.mockResolvedValue(undefined);
    const provider = new DatabaseTranslationProvider(knex);

    const row = await (provider as any).getTranslation({
      system: 'app',
      environment: 'dev',
      language: 'en',
      namespace: 'common',
    });

    expect(row).toEqual({ id: 0, namespaceId: 99, json: '{}' });
  });

  it('throws BadRequestException for unknown language in private getTranslation', async () => {
    const { knex } = createKnex();
    getSystemIdMock.mockResolvedValue(1);
    getEnvironmentIdMock.mockResolvedValue(2);
    getLanguagesMock.mockResolvedValue([{ id: 7, code: 'en', isBase: 1 }]);
    const provider = new DatabaseTranslationProvider(knex);

    await expect(
      (provider as any).getTranslation({
        system: 'app',
        environment: 'dev',
        language: 'pt-BR',
        namespace: 'common',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
