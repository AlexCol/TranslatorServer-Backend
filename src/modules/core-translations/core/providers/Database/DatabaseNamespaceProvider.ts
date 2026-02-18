import { BadRequestException, Inject, Logger } from '@nestjs/common';
import { Knex } from 'knex';
import { Namespace } from './entities/namespace.entity';
import { getSystemId } from './utils';
import { getEnvironmentId } from './utils/getEnvironmentId';
import { getLanguage } from './utils/getLanguage';
import { getLanguages } from './utils/getLanguages';
import { NamespaceProvider } from '@/modules/core-translations/core/interfaces/NamespaceProvider';
import { KNEX_CONNECTION } from '@/modules/infra/database/knex/constants';

export class DatabaseNamespaceProvider implements NamespaceProvider {
  private readonly logger = new Logger(DatabaseNamespaceProvider.name);

  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  //#region Metodos da interface
  /******************************************************/
  /* Metodos da interface                               */
  /******************************************************/
  async listNamespaces(system: string, env: string, language: string): Promise<string[]> {
    try {
      const systemId = await getSystemId(this.knex, system);
      const envId = await getEnvironmentId(this.knex, systemId, env);
      const lang = await getLanguage(this.knex, envId, language);
      if (!lang) {
        throw new BadRequestException(
          `Language '${language}' does not exist for system ${system} and environment ${env}`,
        );
      }

      const rows = await this.knex('namespaces').where({ language_id: lang.id }).select('name');
      return rows.map((row) => row.name);
    } catch (error) {
      this.logger.error(`Error listing namespaces for system ${system}, env ${env}, and language ${language}:`, error);
      throw new BadRequestException(
        `Error listing namespaces for system ${system}, env ${env}, and language ${language}: ${error.message}`,
      );
    }
  }

  async createNamespace(system: string, namespace: string): Promise<void> {
    try {
      const systemId = await getSystemId(this.knex, system);
      const envId = await getEnvironmentId(this.knex, systemId, 'dev');
      const langs = await getLanguages(this.knex, envId);

      const baseLang = langs.find((lang) => lang.isBase === 1);
      if (!baseLang) {
        throw new BadRequestException(`No base language found for system ${system} in 'dev' environment`);
      }

      const existing = await this.knex('namespaces').where({ language_id: baseLang.id, name: namespace }).first('id');
      if (existing) {
        throw new BadRequestException(`Namespace '${namespace}' already exists for system ${system}.`);
      }

      await this.knex.transaction(async (trx) => {
        for (const lang of langs) {
          const newObj = await trx('namespaces')
            .insert({ language_id: lang.id, name: namespace })
            .returning<Namespace[]>('*');
          await trx('translations').insert({ namespace_id: newObj[0].id, json: '{}' });
        }
      });

      this.logger.log(`Namespace '${namespace}' created for system ${system}.`);
    } catch (error) {
      this.logger.error(`Error creating namespace '${namespace}' for system ${system}: ${error.message}`);
      throw new BadRequestException(`Error creating namespace '${namespace}' for system ${system}: ${error.message}`);
    }
  }

  async deleteNamespace(system: string, namespace: string): Promise<void> {
    try {
      const systemId = await getSystemId(this.knex, system);
      const envId = await getEnvironmentId(this.knex, systemId, 'dev');
      const langs = await getLanguages(this.knex, envId);

      const baseLang = langs.find((lang) => lang.isBase === 1);
      if (!baseLang) {
        throw new BadRequestException(`No base language found for system ${system} in 'dev' environment`);
      }

      const existing = await this.knex('namespaces').where({ language_id: baseLang.id, name: namespace }).first('id');
      if (!existing) {
        throw new BadRequestException(`Namespace '${namespace}' does not exist for system ${system}.`);
      }

      await this.knex.transaction(async (trx) => {
        for (const lang of langs) {
          await trx('namespaces').where({ language_id: lang.id, name: namespace }).del();
        }
      });

      this.logger.log(`Namespace '${namespace}' deleted for system ${system}.`);
    } catch (error) {
      this.logger.error(`Error deleting namespace '${namespace}' for system ${system}: ${error.message}`);
      throw new BadRequestException(`Error deleting namespace '${namespace}' for system ${system}: ${error.message}`);
    }
  }
  //#endregion
}
