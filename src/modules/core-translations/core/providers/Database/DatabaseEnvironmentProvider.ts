import { BadRequestException, Inject, Logger } from '@nestjs/common';
import { Knex } from 'knex';
import { getSystemId } from './utils';
import { EnvironmentProvider } from '@/modules/core-translations/core/interfaces/EnvironmentProvider';
import { KNEX_CONNECTION } from '@/modules/infra/database/knex/constants';

export class DatabaseEnvironmentProvider implements EnvironmentProvider {
  private readonly logger = new Logger(DatabaseEnvironmentProvider.name);

  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  //#region Metodos da interface
  /******************************************************/
  /* Metodos da interface                               */
  /******************************************************/
  async listEnvironments(system: string): Promise<string[]> {
    try {
      const systemId = await getSystemId(this.knex, system);
      const rows = await this.knex('environments').where({ system_id: systemId }).select('name').orderBy('name');
      return rows.map((row) => row.name);
    } catch (error) {
      this.logger.error(`Error listing environments for system '${system}': ${error}`);
      throw new BadRequestException(`Error listing environments for system '${system}': ${error.message}`);
    }
  }

  async createEnvironment(system: string, environment: string): Promise<void> {
    try {
      const systemId = await getSystemId(this.knex, system);
      const exists = await this.knex('environments').where({ system_id: systemId, name: environment }).first();
      if (exists) {
        throw new BadRequestException(`Environment '${environment}' already exists for system '${system}'`);
      }

      await this.knex('environments').insert({ system_id: systemId, name: environment });
      this.logger.debug(`Environment '${environment}' created successfully for system '${system}'`);
    } catch (error) {
      this.logger.error(`Error creating environment '${environment}' for system '${system}': ${error}`);
      throw new BadRequestException(
        `Error creating environment '${environment}' for system '${system}': ${error.message}`,
      );
    }
  }

  async deleteEnvironment(system: string, environment: string): Promise<void> {
    try {
      if (environment === 'dev' || environment === 'prod') {
        throw new BadRequestException(`Cannot delete reserved environment '${environment}' for system '${system}'`);
      }

      const systemId = await getSystemId(this.knex, system);
      const exists = await this.knex('environments').where({ system_id: systemId, name: environment }).first();
      if (!exists) {
        throw new BadRequestException(`Environment '${environment}' does not exist for system '${system}'`);
      }

      await this.knex('environments').where({ system_id: systemId, name: environment }).del();
      this.logger.debug(`Environment '${environment}' deleted successfully for system '${system}'`);
    } catch (error) {
      this.logger.error(`Error deleting environment '${environment}' for system '${system}': ${error}`);
      throw new BadRequestException(
        `Error deleting environment '${environment}' for system '${system}': ${error.message}`,
      );
    }
  }
  //#endregion
}
