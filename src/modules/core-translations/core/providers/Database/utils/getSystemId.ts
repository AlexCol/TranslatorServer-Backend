import { Knex } from 'knex';
import { System } from '../entities/system.entity';

export async function getSystemId(knex: Knex, system: string): Promise<number> {
  const row = await knex.select('*').from<System>('systems').where({ name: system }).first();
  if (!row) {
    throw new Error(`System '${system}' does not exist`);
  }
  return row.id;
}
