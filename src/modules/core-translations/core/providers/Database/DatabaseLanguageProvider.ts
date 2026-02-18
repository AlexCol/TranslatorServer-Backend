import { BadRequestException, Inject, Logger } from '@nestjs/common';
import { Knex } from 'knex';
import { Namespace } from './entities/namespace.entity';
import { getSystemId } from './utils';
import { getEnvironmentId } from './utils/getEnvironmentId';
import { LanguageProvider } from '@/modules/core-translations/core/interfaces/LanguageProvider';
import { KNEX_CONNECTION } from '@/modules/infra/database/knex/constants';

export class DatabaseLanguageProvider implements LanguageProvider {
  private readonly logger = new Logger(DatabaseLanguageProvider.name);

  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  //#region Metodos da interface
  /******************************************************/
  /* Metodos da interface                               */
  /******************************************************/
  async listLanguages(system: string, env: string): Promise<string[]> {
    try {
      const systemId = await getSystemId(this.knex, system);
      const envId = await getEnvironmentId(this.knex, systemId, env);
      const rows = await this.knex('languages').where({ environment_id: envId }).select('code');
      return rows.map((row) => row.code);
    } catch (error) {
      this.logger.error(`Error listing languages for system ${system} and env ${env}:`, error);
      throw new BadRequestException(`Error listing languages for system ${system} and env ${env}: ${error.message}`);
    }
  }

  async createLanguage(system: string, language: string): Promise<void> {
    try {
      const systemId = await getSystemId(this.knex, system);
      const envId = await getEnvironmentId(this.knex, systemId, 'dev');
      const exists = await this.knex('languages').where({ environment_id: envId, code: language }).first();

      if (exists) {
        throw new Error(`Language '${language}' already exists for system '${system}' in 'dev' environment`);
      }

      await this.knex('languages').insert({
        environment_id: envId,
        code: language,
        is_base: false,
      });

      await this.replicateBaseLanguageNamespaces(system, 'dev', language);

      this.logger.debug(`Language '${language}' created successfully for system '${system}' in 'dev' environment`);
    } catch (error) {
      this.logger.error(`Error creating language '${language}' for system '${system}':`, error);
      throw error;
    }
  }

  async deleteLanguage(system: string, language: string): Promise<void> {
    try {
      const systemId = await getSystemId(this.knex, system);
      const envId = await getEnvironmentId(this.knex, systemId, 'dev');
      const exists = await this.knex('languages').where({ environment_id: envId, code: language }).first();
      if (!exists) {
        throw new BadRequestException(
          `Language '${language}' does not exist for system '${system}' in 'dev' environment`,
        );
      }

      const isBase = exists.isBase === 1;
      if (isBase) {
        throw new BadRequestException(
          `Cannot delete base language '${language}' for system '${system}' in 'dev' environment. Please promote another language to base before deleting.`,
        );
      }

      await this.knex('languages').where({ environment_id: envId, code: language }).del();
      this.logger.debug(`Language '${language}' deleted successfully for system '${system}' in 'dev' environment`);
    } catch (error) {
      this.logger.error(`Error deleting language '${language}' for system '${system}':`, error);
      throw new BadRequestException(`Error deleting language '${language}' for system '${system}': ${error.message}`);
    }
  }

  async getBaseLanguage(system: string, env: string): Promise<string | null> {
    try {
      const systemId = await getSystemId(this.knex, system);
      const envId = await getEnvironmentId(this.knex, systemId, env);
      const row = await this.knex('languages').where({ environment_id: envId, is_base: true }).first();
      return row ? row.code : null;
    } catch (error) {
      this.logger.error(`Error getting base language for system '${system}' and env '${env}':`, error);
      throw new BadRequestException(
        `Error getting base language for system '${system}' and env '${env}': ${error.message}`,
      );
    }
  }

  async demoteBaseLanguage(system: string, language: string): Promise<void> {
    try {
      const systemId = await getSystemId(this.knex, system);
      const envId = await getEnvironmentId(this.knex, systemId, 'dev');

      //! verifica se o idioma existe e é base
      const row = await this.knex('languages').where({ environment_id: envId, code: language, is_base: true }).first();
      if (!row) {
        throw new BadRequestException(
          `Language '${language}' is not the base language for system '${system}' in 'dev' environment or does not exist`,
        );
      }

      await this.knex('languages').where({ environment_id: envId, code: language }).update({ is_base: false });

      this.logger.debug(`Language '${language}' demoted from base successfully for system '${system}'`);
    } catch (error) {
      this.logger.error(`Error demoting base language '${language}' for system '${system}':`, error);
      throw new BadRequestException(
        `Error demoting base language '${language}' for system '${system}': ${error.message}`,
      );
    }
  }

  async promoteToBaseLanguage(system: string, language: string): Promise<void> {
    try {
      const systemId = await getSystemId(this.knex, system);
      const envId = await getEnvironmentId(this.knex, systemId, 'dev');

      //! verifica se o idioma existe
      const row = await this.knex('languages').where({ environment_id: envId, code: language }).first();
      if (!row) {
        throw new BadRequestException(
          `Language '${language}' does not exist for system '${system}' in 'dev' environment`,
        );
      }

      //! despromove o idioma base atual, se existir
      await this.knex('languages').where({ environment_id: envId, is_base: true }).update({ is_base: false });

      //! promove o novo idioma base
      await this.knex('languages').where({ environment_id: envId, code: language }).update({ is_base: true });

      this.logger.debug(`Language '${language}' promoted to base successfully for system '${system}'`);
    } catch (error) {
      this.logger.error(`Error promoting language '${language}' to base for system '${system}':`, error);
      throw new BadRequestException(
        `Error promoting language '${language}' to base for system '${system}': ${error.message}`,
      );
    }
  }
  //#endregion

  //#region Metodos privados
  /******************************************************/
  /* Metodos privados                                   */
  /******************************************************/
  async replicateBaseLanguageNamespaces(system: string, env: string, language: string): Promise<void> {
    try {
      const systemId = await getSystemId(this.knex, system);
      const envId = await getEnvironmentId(this.knex, systemId, env);
      const baseLangRow = await this.knex('languages').where({ environment_id: envId, is_base: true }).first();
      if (!baseLangRow) {
        const msg = `No base language found for system '${system}' and env '${env}'. Skipping namespace replication.`;
        this.logger.warn(msg);
        return;
      }
      const baseLangId = baseLangRow.id;

      const newLangRow = await this.knex('languages').where({ environment_id: envId, code: language }).first();
      if (!newLangRow) {
        const msg = `New language '${language}' not found for system '${system}' and env '${env}'. Skipping namespace replication.`;
        this.logger.warn(msg);
        return;
      }
      const newLangId = newLangRow.id;

      await this.knex.transaction(async (trx) => {
        const namespaces = await trx('namespaces').where({ language_id: baseLangId }).select('name');
        for (const ns of namespaces) {
          const exists = await trx('namespaces').where({ language_id: newLangId, name: ns.name }).first();
          if (!exists) {
            const obj = await trx('namespaces')
              .insert({ language_id: newLangId, name: ns.name })
              .returning<Namespace[]>('*');
            await trx('translations').insert({ namespace_id: obj[0].id, json: '{}' });
            const msg = `Namespace '${ns.name}' replicated to language '${language}' for system '${system}' and env '${env}'.`;
            this.logger.debug(msg);
          } else {
            const msg = `Namespace '${ns.name}' already exists for language '${language}' in system '${system}' and env '${env}'. Skipping.`;
            this.logger.debug(msg);
          }
        }
      });
    } catch (error) {
      const msg = `Error replicating namespaces from base language to '${language}' for system '${system}' and env '${env}': ${error.message}`;
      this.logger.error(msg);
      throw new BadRequestException(msg);
    }
  }
  //#endregion
}
