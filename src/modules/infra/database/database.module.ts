import { Module } from '@nestjs/common';
import { KnexModule } from './knex/knex.module';

@Module({
  providers: [],
  imports: [KnexModule],
  exports: [KnexModule],
})
export class DatabaseModule {}
