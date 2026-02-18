import { Knex } from 'knex';
import { Namespace } from '../entities/namespace.entity';

export async function getNamespaceId(knex: Knex, languageId: number, namespace: string): Promise<number> {
  const row = await knex.select('*').from<Namespace>('namespaces').where({ languageId, name: namespace }).first();
  if (!row) {
    throw new Error(`Namespace '${namespace}' does not exist for language ID '${languageId}'`);
  }
  return row.id;
}
