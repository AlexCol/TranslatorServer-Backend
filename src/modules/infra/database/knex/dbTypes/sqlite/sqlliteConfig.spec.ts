describe('sqliteConfig', () => {
  const originalArgv = process.argv.slice();
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.argv = originalArgv.slice();
    process.env = { ...originalEnv };
    delete process.env.SQLITE_DB_PATH;
  });

  afterAll(() => {
    process.argv = originalArgv;
    process.env = originalEnv;
  });

  it('builds runtime config and maps identifiers to snake_case', async () => {
    const { default: sqliteConfig } = await import('./sqlliteConfig');
    const config = sqliteConfig();

    expect(config.client).toBe('sqlite3');
    expect((config.connection as any).filename).toContain('src');
    expect((config.migrations as any).directory).toContain('migrations');
    expect(config.useNullAsDefault).toBe(true);

    const origImpl = jest.fn((value) => `[${value}]`);
    expect(config.wrapIdentifier?.('', origImpl as any, {})).toBe('[]');
    expect(config.wrapIdentifier?.('updatedAt', origImpl as any, {})).toBe('[updated_at]');
  });

  it('uses SQLITE_DB_PATH when provided', async () => {
    process.env.SQLITE_DB_PATH = 'custom/path.db';
    const { default: sqliteConfig } = await import('./sqlliteConfig');
    const config = sqliteConfig();

    expect((config.connection as any).filename).toBe('custom/path.db');
  });

  it('uses knex CLI base path when argv includes knex', async () => {
    process.argv = ['node', 'knex'];
    const { default: sqliteConfig } = await import('./sqlliteConfig');
    const config = sqliteConfig();

    expect((config.connection as any).filename).toContain('sqlite');
    expect((config.migrations as any).directory).toContain('migrations');
  });

  it('enables foreign keys in sqlite pool afterCreate hook', async () => {
    const { default: sqliteConfig } = await import('./sqlliteConfig');
    const config = sqliteConfig();

    const conn = {
      run: jest.fn((sql: string, callback: (err: Error | null) => void) => callback(null)),
    };
    const done = jest.fn();

    config.pool?.afterCreate?.(conn, done as any);

    expect(conn.run).toHaveBeenCalledWith('PRAGMA foreign_keys = ON', expect.any(Function));
    expect(done).toHaveBeenCalledWith(null, conn);
  });
});
