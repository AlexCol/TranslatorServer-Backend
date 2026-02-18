import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('environments', (table) => {
    table.increments('id').primary();
    table.integer('system_id').unsigned().notNullable();
    table.string('name').notNullable(); // 'dev', 'prod', 'staging'
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.foreign('system_id').references('id').inTable('systems').onDelete('CASCADE');

    table.unique(['system_id', 'name']); // Garante que não haja ambientes duplicados para o mesmo system

    table.index(['system_id']);
    table.index(['name']);
  });

  //await seed(knex);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('environments');
}
