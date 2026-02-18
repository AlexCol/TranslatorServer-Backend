import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('translations', (table) => {
    table.increments('id').primary();
    table.integer('namespace_id').unsigned().notNullable();
    table.text('json').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.foreign('namespace_id').references('id').inTable('namespaces').onDelete('CASCADE');

    table.unique(['namespace_id']); // Garante que não haja traduções duplicadas para o mesmo namespace

    table.index(['namespace_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('translations');
}
