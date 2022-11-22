import { Knex } from 'knex';

export type Migration = {
    name: string;
    up(knex: Knex): PromiseLike<unknown>;
    down(knex: Knex): PromiseLike<unknown>;
};

export default [
    {
        name: '01_create_uuid_extension',
        up: (knex: Knex) => {
            return knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
        },
        down: (knex: Knex) => {
            return knex.raw('DROP EXTENSION IF EXISTS "uuid-ossp"');
        },
    },
    {
        name: '02_create_modules_table',
        up: (knex: Knex) => {
            return knex.schema.createTable('modules', (table) => {
                table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
                table.string('name').nullable();
                table.string('description').nullable();
            });
        },
        down: (knex: Knex) => {
            return knex.schema.dropTable('modules');
        },
    },
] as Array<Migration>;