import { Knex } from 'knex';
import { Language } from '../entities/language.entity';

export async function getLanguage(knex: Knex, environmentId: number, language: string): Promise<Language> {
  const row = await knex.select('*').from<Language>('languages').where({ environmentId, code: language }).first();
  if (!row) {
    throw new Error(`Language '${language}' does not exist for environment ID '${environmentId}'`);
  }
  return row;
}
