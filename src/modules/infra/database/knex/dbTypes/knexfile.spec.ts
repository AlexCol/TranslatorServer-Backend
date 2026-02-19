import { getKnexConfig } from './knexConfig';

jest.mock('./knexConfig', () => ({
  getKnexConfig: jest.fn(() => ({ client: 'sqlite3', useNullAsDefault: true })),
}));

describe('knexfile', () => {
  it('exports knex config from getKnexConfig()', () => {
    const config = require('./knexfile');

    expect(getKnexConfig).toHaveBeenCalledTimes(1);
    expect(config).toEqual({ client: 'sqlite3', useNullAsDefault: true });
  });
});

