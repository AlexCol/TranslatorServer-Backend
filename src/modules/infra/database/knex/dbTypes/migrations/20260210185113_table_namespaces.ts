import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('namespaces', (table) => {
    table.increments('id').primary();
    table.integer('language_id').unsigned().notNullable();
    table.string('name').notNullable(); // 'common', 'errors', 'pages'
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.foreign('language_id').references('id').inTable('languages').onDelete('CASCADE');

    table.unique(['language_id', 'name']); // Garante que não haja namespaces duplicados para a mesma linguagem

    table.index(['language_id']);
    table.index(['name']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('namespaces');
}
