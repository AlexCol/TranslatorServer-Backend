import { BadRequestException } from '@nestjs/common';
import { DatabaseNamespaceProvider } from './DatabaseNamespaceProvider';

const getSystemIdMock = jest.fn();
const getEnvironmentIdMock = jest.fn();
const getLanguageMock = jest.fn();
const getLanguagesMock = jest.fn();

jest.mock('./utils', () => ({
  getSystemId: (...args: any[]) => getSystemIdMock(...args),
}));
jest.mock('./utils/getEnvironmentId', () => ({
  getEnvironmentId: (...args: any[]) => getEnvironmentIdMock(...args),
}));
jest.mock('./utils/getLanguage', () => ({
  getLanguage: (...args: any[]) => getLanguageMock(...args),
}));
jest.mock('./utils/getLanguages', () => ({
  getLanguages: (...args: any[]) => getLanguagesMock(...args),
}));

describe('DatabaseNamespaceProvider', () => {
  const createKnex = () => {
    const first = jest.fn();
    const select = jest.fn();
    const del = jest.fn();
    const where = jest.fn().mockReturnValue({ first, select, del });
    const returning = jest.fn().mockResolvedValue([{ id: 99 }]);
    const insert = jest.fn().mockReturnValue({ returning });
    const table = jest.fn().mockReturnValue({ where, insert });
    const transaction = jest.fn().mockImplementation(async (cb: any) => cb(table));
    return { knex: Object.assign(table, { transaction }) as any, first, select, del, insert };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    getSystemIdMock.mockResolvedValue(1);
    getEnvironmentIdMock.mockResolvedValue(2);
  });

  it('lists namespaces for language', async () => {
    const { knex, select } = createKnex();
    getLanguageMock.mockResolvedValue({ id: 10 });
    select.mockResolvedValue([{ name: 'common' }, { name: 'errors' }]);
    const provider = new DatabaseNamespaceProvider(knex);

    await expect(provider.listNamespaces('app', 'dev', 'en')).resolves.toEqual(['common', 'errors']);
  });

  it('creates namespace for all languages', async () => {
    const { knex, first, insert } = createKnex();
    getLanguagesMock.mockResolvedValue([
      { id: 11, isBase: 1 },
      { id: 12, isBase: 0 },
    ]);
    first.mockResolvedValue(undefined);
    const provider = new DatabaseNamespaceProvider(knex);

    await provider.createNamespace('app', 'common');

    expect(insert).toHaveBeenCalled();
  });

  it('blocks create/delete when base language missing', async () => {
    const { knex } = createKnex();
    getLanguagesMock.mockResolvedValue([{ id: 12, isBase: 0 }]);
    const provider = new DatabaseNamespaceProvider(knex);

    await expect(provider.createNamespace('app', 'common')).rejects.toBeInstanceOf(BadRequestException);
    await expect(provider.deleteNamespace('app', 'common')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('deletes namespace for all languages', async () => {
    const { knex, first, del } = createKnex();
    getLanguagesMock.mockResolvedValue([
      { id: 11, isBase: 1 },
      { id: 12, isBase: 0 },
    ]);
    const provider = new DatabaseNamespaceProvider(knex);

    first.mockResolvedValueOnce({ id: 7 });
    await provider.deleteNamespace('app', 'common');
    expect(del).toHaveBeenCalled();

    first.mockResolvedValueOnce(undefined);
    await expect(provider.deleteNamespace('app', 'missing')).rejects.toBeInstanceOf(BadRequestException);
  });
});
