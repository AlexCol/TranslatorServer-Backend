import { BadRequestException } from '@nestjs/common';
import { DatabasePublisherProvider } from './DatabasePublisherProvider';

const getSystemIdMock = jest.fn();
const getEnvironmentIdMock = jest.fn();
const getLanguageMock = jest.fn();
const getNamespaceIdMock = jest.fn();
const getTranslationMock = jest.fn();
const getLanguagesMock = jest.fn();

jest.mock('./utils', () => ({
  getSystemId: (...args: any[]) => getSystemIdMock(...args),
  getEnvironmentId: (...args: any[]) => getEnvironmentIdMock(...args),
  getLanguage: (...args: any[]) => getLanguageMock(...args),
  getNamespaceId: (...args: any[]) => getNamespaceIdMock(...args),
  getTranslation: (...args: any[]) => getTranslationMock(...args),
  getLanguages: (...args: any[]) => getLanguagesMock(...args),
}));

describe('DatabasePublisherProvider', () => {
  const createKnex = () => {
    const first = jest.fn();
    const select = jest.fn().mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({ first }),
      }),
    });
    const update = jest.fn();
    const del = jest.fn();
    const returning = jest.fn().mockResolvedValue([{ id: 100 }]);
    const insert = jest.fn().mockReturnValue({ returning });
    const where = jest.fn().mockReturnValue({ update, del, first });
    const table = jest.fn().mockReturnValue({ where, insert, select });
    const trx = Object.assign(table, { select, fn: { now: jest.fn(() => 'now') } });
    const transaction = jest.fn().mockImplementation(async (cb: any) => cb(trx));
    const knex = Object.assign(table, { transaction, fn: { now: jest.fn(() => 'now') } });
    return { knex: knex as any, trx, update, del, insert, first };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('publishes one namespace end-to-end', async () => {
    const { knex, update } = createKnex();
    const provider = new DatabasePublisherProvider(knex);

    getSystemIdMock.mockResolvedValue(1);
    getEnvironmentIdMock.mockResolvedValueOnce(2).mockResolvedValueOnce(3);
    getLanguageMock.mockResolvedValue({ id: 10, isBase: 1 });
    getNamespaceIdMock.mockResolvedValue(20);
    getTranslationMock.mockResolvedValue({ id: 30, namespaceId: 20, json: '{"hello":"ola"}' });
    jest.spyOn(provider as any, 'getToLanguageIdOrCreate').mockResolvedValue(11);
    jest.spyOn(provider as any, 'getToNamespaceIdOrCreate').mockResolvedValue(21);
    jest.spyOn(provider as any, 'getToTranslationOrCreate').mockResolvedValue({ id: 31, namespaceId: 21, json: '{}' });
    jest.spyOn(provider as any, 'updateBaseLanguage').mockResolvedValue(undefined);

    await expect(
      provider.publishNamespace({ system: 'app', language: 'pt-BR', namespace: 'common', from: 'dev', to: 'prod' }),
    ).resolves.toBe('Namespace published successfully!');
    expect(update).toHaveBeenCalled();
  });

  it('publishes all environments by recreating target and copying languages', async () => {
    const { knex, del } = createKnex();
    const provider = new DatabasePublisherProvider(knex);

    getSystemIdMock.mockResolvedValue(1);
    getEnvironmentIdMock.mockResolvedValue(2);
    getLanguagesMock.mockResolvedValue([{ id: 10, code: 'en', isBase: 1 }]);
    jest.spyOn(provider as any, 'createToEnvironment').mockResolvedValue({ id: 50, systemId: 1, name: 'prod' });
    const createToLanguageSpy = jest.spyOn(provider as any, 'createToLanguage').mockResolvedValue(undefined);

    await expect(provider.publishAll({ system: 'app', from: 'dev', to: 'prod' })).resolves.toBe(
      'All environments published successfully!',
    );
    expect(del).toHaveBeenCalled();
    expect(createToLanguageSpy).toHaveBeenCalledWith(expect.anything(), 50, { id: 10, code: 'en', isBase: 1 });
  });

  it('throws when updateBaseLanguage cannot find languages', async () => {
    const { knex, first } = createKnex();
    const provider = new DatabasePublisherProvider(knex);

    first.mockResolvedValueOnce(undefined);
    await expect((provider as any).updateBaseLanguage(knex, 1, 2, 3)).rejects.toBeInstanceOf(BadRequestException);
  });
});
