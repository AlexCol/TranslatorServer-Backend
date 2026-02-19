import { KNEX_CONNECTION } from './index';

describe('knex constants index', () => {
  it('exports KNEX_CONNECTION token', () => {
    expect(KNEX_CONNECTION).toBe('KNEX_CONNECTION');
  });
});

