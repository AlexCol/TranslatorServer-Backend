import { BadRequestException, Inject, Logger } from '@nestjs/common';
import { Knex } from 'knex';
import { TranslationKey } from '../../types/TranslationKey';
import { Translation } from './entities/translation.entity';
import { getSystemId } from './utils';
import { getEnvironmentId } from './utils/getEnvironmentId';
import { getLanguages } from './utils/getLanguages';
import { getNamespaceId } from './utils/getNamespaceId';
import { TranslationProvider } from '@/modules/core-translations/core/interfaces/TranslationProvider';
import { CatalogEntry, TranslationStatus } from '@/modules/core-translations/core/types';
import { KNEX_CONNECTION } from '@/modules/infra/database/knex/constants';

export class DatabaseTranslationProvider implements TranslationProvider {
  private readonly logger = new Logger(DatabaseTranslationProvider.name);

  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  //#region Metodos da interface
  /******************************************************/
  /* Metodos da interface                               */
  /******************************************************/
  //!carrega o json da tradução
  async loadWithFallBack(entry: CatalogEntry): Promise<Record<string, any>> {
    try {
      const sysId = await getSystemId(this.knex, entry.system);
      const envId = await getEnvironmentId(this.knex, sysId, entry.environment);
      const langs = await getLanguages(this.knex, envId);

      const baseLang = langs.filter((l) => l.isBase === 1)[0];
      const baseJson = await this.getTranslation({ ...entry, language: baseLang.code });
      const baseJsonObj = JSON.parse(baseJson.json || '{}');

      if (entry.language === baseLang.code) {
        return baseJsonObj;
      }

      //!se for 'linguagem derivada', mescla ela com a base. ex, es-AR com es, senão só devolve a linguagem específica
      const language = entry.language;
      const mergedJsonObj = { ...baseJsonObj };
      if (language.length !== 2 && language.includes('-')) {
        let baseLanguageTranslation: Translation;
        try {
          baseLanguageTranslation = await this.getTranslation({ ...entry, language: language.split('-')[0] });
        } catch {
          baseLanguageTranslation = { id: 0, namespaceId: 0, json: '{}' };
        }
        const languageTranslation = await this.getTranslation(entry);

        const baseLanguageJsonObj = JSON.parse(baseLanguageTranslation.json || '{}');
        const languageJsonObj = JSON.parse(languageTranslation.json || '{}');

        Object.assign(mergedJsonObj, baseLanguageJsonObj, languageJsonObj);
      } else {
        const languageTranslation = await this.getTranslation(entry);
        const languageJsonObj = JSON.parse(languageTranslation.json || '{}');
        Object.assign(mergedJsonObj, languageJsonObj);
      }
      return mergedJsonObj;
    } catch (error) {
      this.logger.error(`Error loading translation: ${error.message}`);
      throw new BadRequestException(`Failed to load translation: ${error.message}`);
    }
  }

  async loadWithoutFallBack(entry: CatalogEntry): Promise<Record<string, any>> {
    try {
      //? dados para busca
      const sysId = await getSystemId(this.knex, entry.system);
      const envId = await getEnvironmentId(this.knex, sysId, entry.environment);
      const langs = await getLanguages(this.knex, envId);

      const baseLang = langs.filter((l) => l.isBase === 1)[0];
      const baseJson = await this.getTranslation({ ...entry, language: baseLang.code });
      const baseJsonObj = JSON.parse(baseJson.json || '{}');

      //? se é base language, não pq limpar
      if (entry.language === baseLang.code) {
        return baseJsonObj;
      }

      Object.keys(baseJsonObj).forEach((key) => {
        baseJsonObj[key] = null; //limpando os valores para manter as chaves
      });

      const langJson = await this.getTranslation(entry);
      const langJsonObj = JSON.parse(langJson.json || '{}');

      //? mesclando com a base, mas mantendo as chaves sem tradução como null
      const mergedJsonObj = { ...baseJsonObj, ...langJsonObj };
      return mergedJsonObj;
    } catch (error) {
      this.logger.error(`Error loading translation without fallback: ${error.message}`);
      throw new BadRequestException(`Failed to load translation without fallback: ${error.message}`);
    }
  }

  //!sobre chaves
  async createKey(entry: CatalogEntry, translationKeys: TranslationKey[]): Promise<void> {
    try {
      const baseTranslation = await this.getTranslation(entry);
      const baseJson = JSON.parse(baseTranslation?.json || '{}');

      for (const { key, value } of translationKeys) {
        if (Object.hasOwn(baseJson, key)) {
          throw new BadRequestException(`Key "${key}" already exists.`);
        }

        baseJson[key] = value;
      }

      if (baseTranslation.id > 0) {
        await this.knex('translations')
          .where({ id: baseTranslation.id })
          .update({ json: JSON.stringify(baseJson) });
      } else {
        await this.knex('translations').insert({
          namespaceId: baseTranslation?.namespaceId,
          json: JSON.stringify(baseJson),
        });
      }

      this.logger.log(`Keys created in "${entry.system}/${entry.environment}/${entry.language}".`);
    } catch (error) {
      this.logger.error(`Error creating key: ${error.message}`);
      throw new BadRequestException(`Failed to create key: ${error.message}`);
    }
  }

  async createTranslation(entry: CatalogEntry, translationKeys: TranslationKey[]): Promise<void> {
    try {
      const baseJson = await this.getTranslation({ ...entry, language: '' });
      const baseJsonObj = JSON.parse(baseJson.json || '{}');

      const langJson = await this.getTranslation(entry);
      const langJsonObj = JSON.parse(langJson.json || '{}');

      for (const { key, value } of translationKeys) {
        if (!Object.hasOwn(baseJsonObj, key)) {
          throw new BadRequestException(`Key "${key}" does not exist in base language.`);
        }
        langJsonObj[key] = value;
      }

      if (langJson.id > 0) {
        await this.knex('translations')
          .where({ id: langJson.id })
          .update({ json: JSON.stringify(langJsonObj) });
      } else {
        await this.knex('translations').insert({
          namespaceId: langJson?.namespaceId,
          json: JSON.stringify(langJsonObj),
        });
      }

      const msg = `Translations created in "${entry.system}/${entry.environment}/${entry.language}".`;
      this.logger.log(msg);
    } catch (error) {
      this.logger.error(`Error creating translation: ${error.message}`);
      throw new BadRequestException(`Failed to create translation: ${error.message}`);
    }
  }

  async updateKey(entry: CatalogEntry, translationKeys: TranslationKey[]): Promise<void> {
    try {
      const json = await this.getTranslation(entry);
      const jsonObj = JSON.parse(json.json || '{}');

      for (const { key, value } of translationKeys) {
        if (!Object.hasOwn(jsonObj, key)) {
          throw new BadRequestException(`Key "${key}" does not exist.`);
        }
        jsonObj[key] = value;
      }

      await this.knex('translations')
        .where({ id: json.id })
        .update({ json: JSON.stringify(jsonObj) });

      this.logger.log(`Keys updated in "${entry.system}/${entry.environment}/${entry.language}".`);
    } catch (error) {
      this.logger.error(`Error updating keys: ${error.message}`);
      throw new BadRequestException(`Failed to update keys: ${error.message}`);
    }
  }

  async deleteKey(entry: CatalogEntry, keys: string[]): Promise<void> {
    try {
      await this.knex.transaction(async (trx) => {
        const sysId = await getSystemId(trx, entry.system);
        const envId = await getEnvironmentId(trx, sysId, entry.environment);
        const langs = await getLanguages(trx, envId);
        for (const lang of langs) {
          const translation = await this.getTranslation({ ...entry, language: lang.code }, trx);
          const jsonObj = JSON.parse(translation.json || '{}');

          let deleted = false;
          for (const key of keys) {
            if (Object.hasOwn(jsonObj, key)) {
              delete jsonObj[key];
              deleted = true;
            }
          }
          if (deleted) {
            await trx('translations')
              .where({ id: translation.id })
              .update({ json: JSON.stringify(jsonObj) });
            this.logger.log(`Keys deleted from "${entry.system}/${entry.environment}/${lang.code}".`);
          }
        }
      });

      this.logger.log(`Keys deleted from all languages in "${entry.system}/${entry.environment}".`);
    } catch (error) {
      this.logger.error(`Error deleting keys: ${error.message}`);
      throw new BadRequestException(`Failed to delete keys: ${error.message}`);
    }
  }

  //!status e informações gerais
  async getTranslationStatus(entry: CatalogEntry): Promise<TranslationStatus> {
    try {
      const json = await this.loadWithoutFallBack(entry);
      const totalKeys = Object.keys(json).length;
      const translatedKeys = Object.values(json).filter((value) => value !== null).length;
      const missingKeys = totalKeys - translatedKeys;

      const status: TranslationStatus = {
        namespace: entry.namespace,
        language: entry.language,
        total: totalKeys,
        translated: translatedKeys,
        missing: missingKeys,
        percentage: totalKeys > 0 ? Math.round((translatedKeys / totalKeys) * 100) : 0,
      } satisfies TranslationStatus;

      return status;
    } catch (error) {
      this.logger.error(`Error getting translation status: ${error.message}`);
      throw new BadRequestException(`Failed to get translation status: ${error.message}`);
    }
  }
  //#endregion

  //region Metodos privados
  /******************************************************/
  /* Metodos privados                                   */
  /******************************************************/
  private async getTranslation(entry: CatalogEntry, trx?: Knex.Transaction): Promise<Translation> {
    const db = trx || this.knex;

    const sysId = await getSystemId(db, entry.system);
    const envId = await getEnvironmentId(db, sysId, entry.environment);

    const langs = await getLanguages(db, envId);
    const lang = entry.language
      ? langs.filter((l) => l.code === entry.language)[0]
      : langs.filter((l) => l.isBase === 1)[0];

    if (!lang) {
      throw new BadRequestException(
        `Language "${entry.language}" not found for system "${entry.system}" and environment "${entry.environment}".`,
      );
    }

    const namespaceId = await getNamespaceId(db, lang.id, entry.namespace);
    const row = await db.select('*').from<Translation>('translations').where({ namespaceId }).first();

    if (!row) {
      const emptyTranslation: Translation = {
        id: 0,
        namespaceId,
        json: '{}',
      };
      return emptyTranslation;
    }

    return row;
  }
  //endregion
}
