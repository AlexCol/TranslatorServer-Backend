import sqliteConfig from './sqlite/sqlliteConfig';

export function getKnexConfig() {
  return sqliteConfig();
}
