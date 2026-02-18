import { Global, Module } from '@nestjs/common';
import knex, { Knex } from 'knex';
import { KNEX_CONNECTION } from './constants';
import { getKnexConfig } from './dbTypes/knexConfig';

@Global()
@Module({
  imports: [],
  providers: [
    {
      provide: KNEX_CONNECTION,
      useFactory: async (): Promise<Knex> => {
        const knexInstance = knex(getKnexConfig());
        return knexInstance;
      },
    },
  ],
  exports: [KNEX_CONNECTION],
})
export class KnexModule {}
