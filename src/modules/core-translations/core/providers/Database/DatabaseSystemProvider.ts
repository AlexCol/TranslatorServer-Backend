import { BadRequestException, Inject, Logger } from '@nestjs/common';
import { Knex } from 'knex';
import { System } from './entities/system.entity';
import { SystemProvider } from '@/modules/core-translations/core/interfaces/SystemProvider';
import { KNEX_CONNECTION } from '@/modules/infra/database/knex/constants';

export class DatabaseSystemProvider implements SystemProvider {
  private readonly logger = new Logger(DatabaseSystemProvider.name);

  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  //#region Metodos da interface
  /******************************************************/
  /* Metodos da interface                               */
  /******************************************************/
  async listSystems(): Promise<string[]> {
    try {
      const rows = await this.knex.select('*').from<System>('systems').orderBy('name', 'asc');
      return rows.map((row) => row.name);
    } catch (error) {
      this.logger.error(`Error listing systems: ${error}`);
      throw new BadRequestException(`Error listing systems: ${error.message}`);
    }
  }

  async createSystem(system: string): Promise<void> {
    try {
      const exists = await this.knex('systems').where({ name: system }).first();
      if (exists) {
        throw new BadRequestException(`System '${system}' already exists`);
      }

      const newSystem = await this.knex('systems').insert({ name: system });
      await this.insertBaseEnvironments(newSystem[0]);

      this.logger.debug(`System '${system}' created successfully`);
    } catch (error) {
      this.logger.error(`Error creating system: ${error}`);
      throw new BadRequestException(`Error creating system: ${error.message}`);
    }
  }

  async deleteSystem(system: string): Promise<void> {
    try {
      const exists = await this.knex('systems').where({ name: system }).first();
      if (!exists) {
        throw new BadRequestException(`System '${system}' does not exist`);
      }

      await this.knex('systems').where({ name: system }).del();
      this.logger.debug(`System '${system}' deleted successfully`);
    } catch (error) {
      this.logger.error(`Error deleting system: ${error}`);
      throw new BadRequestException(`Error deleting system: ${error.message}`);
    }
  }

  private async insertBaseEnvironments(systemId: number): Promise<void> {
    try {
      const baseEnvironments = ['dev', 'prod'];
      const environmentsToInsert = baseEnvironments.map((env) => ({ system_id: systemId, name: env }));
      await this.knex('environments').insert(environmentsToInsert);
    } catch (error) {
      this.logger.error(`Error inserting base environments for system ID ${systemId}: ${error}`);
      throw new BadRequestException(`Error inserting base environments for system ID ${systemId}: ${error.message}`);
    }
  }
  //#endregion
}
