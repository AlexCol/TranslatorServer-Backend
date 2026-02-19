import { BadRequestException } from '@nestjs/common';
import { DatabaseSystemProvider } from './DatabaseSystemProvider';

describe('DatabaseSystemProvider', () => {
  const createKnex = () => {
    const systemsWhereFirst = jest.fn();
    const systemsWhereDel = jest.fn();
    const systemsInsert = jest.fn();
    const environmentsInsert = jest.fn();
    const systemsWhere = jest.fn().mockImplementation(() => ({
      first: systemsWhereFirst,
      del: systemsWhereDel,
    }));
    const table = jest.fn().mockImplementation((name: string) => {
      if (name === 'systems') {
        return {
          where: systemsWhere,
          insert: systemsInsert,
        };
      }
      if (name === 'environments') {
        return {
          insert: environmentsInsert,
        };
      }
      throw new Error(`unknown table ${name}`);
    });

    const orderBy = jest.fn();
    const from = jest.fn().mockReturnValue({ orderBy });
    const select = jest.fn().mockReturnValue({ from });
    const knex = Object.assign(table, { select });

    return {
      knex: knex as any,
      orderBy,
      systemsWhereFirst,
      systemsWhereDel,
      systemsInsert,
      environmentsInsert,
    };
  };

  it('lists systems ordered by name', async () => {
    const { knex, orderBy } = createKnex();
    orderBy.mockResolvedValue([{ name: 'alpha' }, { name: 'zeta' }]);
    const provider = new DatabaseSystemProvider(knex);

    await expect(provider.listSystems()).resolves.toEqual(['alpha', 'zeta']);
  });

  it('creates system and base environments', async () => {
    const { knex, systemsWhereFirst, systemsInsert, environmentsInsert } = createKnex();
    systemsWhereFirst.mockResolvedValue(undefined);
    systemsInsert.mockResolvedValue([10]);
    environmentsInsert.mockResolvedValue(undefined);
    const provider = new DatabaseSystemProvider(knex);

    await provider.createSystem('app');

    expect(systemsInsert).toHaveBeenCalledWith({ name: 'app' });
    expect(environmentsInsert).toHaveBeenCalledWith([
      { system_id: 10, name: 'dev' },
      { system_id: 10, name: 'prod' },
    ]);
  });

  it('throws when creating existing system', async () => {
    const { knex, systemsWhereFirst } = createKnex();
    systemsWhereFirst.mockResolvedValue({ id: 1, name: 'app' });
    const provider = new DatabaseSystemProvider(knex);

    await expect(provider.createSystem('app')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('deletes existing system and errors for missing one', async () => {
    const { knex, systemsWhereFirst, systemsWhereDel } = createKnex();
    const provider = new DatabaseSystemProvider(knex);

    systemsWhereFirst.mockResolvedValueOnce({ id: 1, name: 'app' });
    await provider.deleteSystem('app');
    expect(systemsWhereDel).toHaveBeenCalledTimes(1);

    systemsWhereFirst.mockResolvedValueOnce(undefined);
    await expect(provider.deleteSystem('missing')).rejects.toBeInstanceOf(BadRequestException);
  });
});
