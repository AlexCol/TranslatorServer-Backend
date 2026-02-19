import { BadRequestException } from '@nestjs/common';
import { DatabaseLanguageProvider } from './DatabaseLanguageProvider';

const getSystemIdMock = jest.fn();
const getEnvironmentIdMock = jest.fn();

jest.mock('./utils', () => ({
  getSystemId: (...args: any[]) => getSystemIdMock(...args),
}));
jest.mock('./utils/getEnvironmentId', () => ({
  getEnvironmentId: (...args: any[]) => getEnvironmentIdMock(...args),
}));

describe('DatabaseLanguageProvider', () => {
  const createKnex = () => {
    const first = jest.fn();
    const select = jest.fn();
    const del = jest.fn();
    const update = jest.fn();
    const where = jest.fn().mockReturnValue({ first, select, del, update });
    const returning = jest.fn().mockResolvedValue([{ id: 44 }]);
    const insert = jest.fn().mockReturnValue({ returning });
    const table = jest.fn().mockReturnValue({ where, insert });
    const transaction = jest.fn().mockImplementation(async (cb: any) => cb(table));
    return { knex: Object.assign(table, { transaction }) as any, first, select, del, update, insert };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    getSystemIdMock.mockResolvedValue(1);
    getEnvironmentIdMock.mockResolvedValue(2);
  });

  it('lists languages and gets base language', async () => {
    const { knex, select, first } = createKnex();
    select.mockResolvedValueOnce([{ code: 'en' }, { code: 'pt-BR' }]);
    first.mockResolvedValueOnce({ code: 'en' });
    const provider = new DatabaseLanguageProvider(knex);

    await expect(provider.listLanguages('app', 'dev')).resolves.toEqual(['en', 'pt-BR']);
    await expect(provider.getBaseLanguage('app', 'dev')).resolves.toBe('en');
  });

  it('creates language and replicates namespaces', async () => {
    const { knex, first, insert } = createKnex();
    first.mockResolvedValueOnce(undefined);
    insert.mockResolvedValueOnce(undefined);
    const provider = new DatabaseLanguageProvider(knex);
    const replicateSpy = jest.spyOn(provider as any, 'replicateBaseLanguageNamespaces').mockResolvedValue(undefined);

    await provider.createLanguage('app', 'es');

    expect(insert).toHaveBeenCalledWith({ environment_id: 2, code: 'es', is_base: false });
    expect(replicateSpy).toHaveBeenCalledWith('app', 'dev', 'es');
  });

  it('handles delete validations and delete success', async () => {
    const { knex, first, del } = createKnex();
    const provider = new DatabaseLanguageProvider(knex);

    first.mockResolvedValueOnce(undefined);
    await expect(provider.deleteLanguage('app', 'es')).rejects.toBeInstanceOf(BadRequestException);

    first.mockResolvedValueOnce({ isBase: 1 });
    await expect(provider.deleteLanguage('app', 'en')).rejects.toBeInstanceOf(BadRequestException);

    first.mockResolvedValueOnce({ isBase: 0 });
    await provider.deleteLanguage('app', 'es');
    expect(del).toHaveBeenCalled();
  });

  it('demotes and promotes base language with validation', async () => {
    const { knex, first, update } = createKnex();
    const provider = new DatabaseLanguageProvider(knex);

    first.mockResolvedValueOnce(undefined);
    await expect(provider.demoteBaseLanguage('app', 'en')).rejects.toBeInstanceOf(BadRequestException);

    first.mockResolvedValueOnce({ id: 1, code: 'en', is_base: true });
    await provider.demoteBaseLanguage('app', 'en');
    expect(update).toHaveBeenCalledWith({ is_base: false });

    first.mockResolvedValueOnce(undefined);
    await expect(provider.promoteToBaseLanguage('app', 'pt-BR')).rejects.toBeInstanceOf(BadRequestException);

    first.mockResolvedValueOnce({ id: 2, code: 'pt-BR' });
    await provider.promoteToBaseLanguage('app', 'pt-BR');
    expect(update).toHaveBeenCalled();
  });
});
