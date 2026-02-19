import { BadRequestException } from '@nestjs/common';
import { DatabaseEnvironmentProvider } from './DatabaseEnvironmentProvider';

const getSystemIdMock = jest.fn();

jest.mock('./utils', () => ({
  getSystemId: (...args: any[]) => getSystemIdMock(...args),
}));

describe('DatabaseEnvironmentProvider', () => {
  const createKnex = () => {
    const first = jest.fn();
    const del = jest.fn();
    const orderBy = jest.fn();
    const select = jest.fn().mockReturnValue({ orderBy });
    const where = jest.fn().mockReturnValue({ first, del, select });
    const insert = jest.fn();
    const table = jest.fn().mockReturnValue({ where, insert });
    return { knex: table as any, first, del, orderBy, insert };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists environments', async () => {
    const { knex, orderBy } = createKnex();
    getSystemIdMock.mockResolvedValue(1);
    orderBy.mockResolvedValue([{ name: 'dev' }, { name: 'prod' }]);
    const provider = new DatabaseEnvironmentProvider(knex);

    await expect(provider.listEnvironments('app')).resolves.toEqual(['dev', 'prod']);
  });

  it('creates environment and blocks duplicate', async () => {
    const { knex, first, insert } = createKnex();
    getSystemIdMock.mockResolvedValue(1);
    const provider = new DatabaseEnvironmentProvider(knex);

    first.mockResolvedValueOnce(undefined);
    await provider.createEnvironment('app', 'qa');
    expect(insert).toHaveBeenCalledWith({ system_id: 1, name: 'qa' });

    first.mockResolvedValueOnce({ id: 3 });
    await expect(provider.createEnvironment('app', 'qa')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('deletes environment with validations', async () => {
    const { knex, first, del } = createKnex();
    getSystemIdMock.mockResolvedValue(1);
    const provider = new DatabaseEnvironmentProvider(knex);

    await expect(provider.deleteEnvironment('app', 'dev')).rejects.toBeInstanceOf(BadRequestException);

    first.mockResolvedValueOnce(undefined);
    await expect(provider.deleteEnvironment('app', 'qa')).rejects.toBeInstanceOf(BadRequestException);

    first.mockResolvedValueOnce({ id: 3 });
    await provider.deleteEnvironment('app', 'qa');
    expect(del).toHaveBeenCalledTimes(1);
  });
});
