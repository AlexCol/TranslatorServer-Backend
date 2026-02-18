import { Knex } from 'knex';
import { Language } from '../entities/language.entity';

export async function getLanguages(knex: Knex, environmentId: number): Promise<Language[]> {
  const row = await knex.select('*').from<Language>('languages').where({ environmentId });
  if (!row || row.length === 0) {
    throw new Error(`Languages do not exist for environment ID '${environmentId}'`);
  }
  return row;
}
