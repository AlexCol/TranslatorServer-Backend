import { Knex } from 'knex';
import { Environment } from '../entities/environment.entity';

export async function getEnvironmentId(knex: Knex, systemId: number, environment: string): Promise<number> {
  const row = await knex.select('*').from<Environment>('environments').where({ systemId, name: environment }).first();
  if (!row) {
    throw new Error(`Environment '${environment}' does not exist for system ID '${systemId}'`);
  }
  return row.id;
}
