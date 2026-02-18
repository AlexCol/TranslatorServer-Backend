import { Knex } from 'knex';
import { Translation } from '../entities/translation.entity';

export async function getTranslation(knex: Knex, namespaceId: number, namespace: string): Promise<Translation> {
  const row = await knex.select('*').from<Translation>('translations').where({ namespaceId }).first();
  if (!row) {
    throw new Error(`Namespace '${namespace}' does not exist for language ID '${namespaceId}'`);
  }
  return row;
}
