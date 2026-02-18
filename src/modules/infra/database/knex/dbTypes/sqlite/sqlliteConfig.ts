import * as path from 'path';
import { Knex } from 'knex';
import { objectToCamel, toSnake } from 'ts-case-convert';

const isKnexCLI = process.argv.some((arg) => arg.includes('knex'));
let basePath = '';
if (isKnexCLI) {
  basePath = path.resolve('./sqlite/');
} else {
  basePath = path.join(process.cwd(), 'src/modules/infra/database/knex/dbTypes/sqlite');
}

export default function sqliteConfig(): Knex.Config {
  const config: Knex.Config = {
    client: 'sqlite3',
    connection: { filename: process.env.SQLITE_DB_PATH || path.resolve(basePath, 'app.db') },
    migrations: { directory: path.resolve(basePath, '../migrations') },
    //seeds: { directory: path.resolve(__dirname, '../seeds') },
    useNullAsDefault: true,
    postProcessResponse: objectToCamel,
    wrapIdentifier(value, origImpl) {
      if (!value) return origImpl(value);
      return origImpl(toSnake(value));
    },
    pool: {
      afterCreate: (conn: any, done) => {
        conn.run('PRAGMA foreign_keys = ON', (err: any) => {
          done(err, conn);
        });
      },
    },
  };

  return config;
}
