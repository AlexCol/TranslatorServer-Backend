import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('languages', (table) => {
    table.increments('id').primary();
    table.integer('environment_id').unsigned().notNullable();
    table.string('code').notNullable(); // 'pt-BR', 'en-US'
    table.boolean('is_base').notNullable().defaultTo(false); // Marca linguagem base
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.foreign('environment_id').references('id').inTable('environments').onDelete('CASCADE');

    table.unique(['environment_id', 'code']); // Garante que não haja linguagens duplicadas para o mesmo ambiente

    table.index(['code']);
    table.index(['is_base']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('languages');
}
