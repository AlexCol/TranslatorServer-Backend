import { BadRequestException, Inject, Logger } from '@nestjs/common';
import { Knex } from 'knex';
import { PublishAllProps } from '../../types/PublishAllProps';
import { Environment } from './entities/environment.entity';
import { Language } from './entities/language.entity';
import { Namespace } from './entities/namespace.entity';
import { Translation } from './entities/translation.entity';
import { getEnvironmentId, getLanguage, getLanguages, getNamespaceId, getSystemId, getTranslation } from './utils';
import { PublisherProvider } from '@/modules/core-translations/core/interfaces/PublisherProvider';
import { PublishNamespaceProps } from '@/modules/core-translations/core/types/PublishNamespaceProps';
import { KNEX_CONNECTION } from '@/modules/infra/database/knex/constants';

export class DatabasePublisherProvider implements PublisherProvider {
  private readonly logger = new Logger(DatabasePublisherProvider.name);

  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  //#region Metodos da interface
  /******************************************************/
  /* Metodos da interface                               */
  /******************************************************/
  async publishNamespace(props: PublishNamespaceProps): Promise<string> {
    const { system, language, namespace, from, to } = props;

    await this.knex.transaction(async (trx) => {
      const sysId = await getSystemId(trx, system);
      //?dados 'from'
      const fromEnvId = await getEnvironmentId(trx, sysId, from);
      const fromLangId = (await getLanguage(trx, fromEnvId, language)).id;
      const fromNamespaceId = await getNamespaceId(trx, fromLangId, namespace);
      const fromTranslation = await getTranslation(trx, fromNamespaceId, namespace);

      //? dados 'to'
      const toEnvId = await getEnvironmentId(trx, sysId, to);
      const toLangId = await this.getToLanguageIdOrCreate(trx, toEnvId, language);
      const toNamespaceId = await this.getToNamespaceIdOrCreate(trx, toLangId, namespace);
      const toTranslation = await this.getToTranslationOrCreate(trx, toNamespaceId);

      //?update translatons
      await this.updateTranslation(trx, toTranslation.id, fromTranslation.json);

      //? update if is base language
      await this.updateBaseLanguage(trx, fromLangId, toEnvId, toLangId);
    });

    return 'Namespace published successfully!';
  }

  async publishAll(props: PublishAllProps): Promise<string> {
    const { system, from, to } = props;
    await this.knex.transaction(async (trx) => {
      const sysId = await getSystemId(trx, system);

      await this.removeAllToEnvironmentData(trx, sysId, to);

      //? from data
      const fromEnvId = await getEnvironmentId(trx, sysId, from);
      const fromLanguages = await getLanguages(trx, fromEnvId);

      //? creating data
      const toEnv = await this.createToEnvironment(trx, sysId, from, to);
      for (const fromLang of fromLanguages) {
        await this.createToLanguage(trx, toEnv.id, fromLang);
      }

      //const fromLangs = await getLanguages(trx, fromEnvId);
    });
    return 'All environments published successfully!';
  }
  //#endregion

  //#region Metodos privados
  /******************************************************/
  /* Metodos privados                                   */
  /******************************************************/
  /******************************************************/
  /* Metodos privados - auxiliares do publish namespace */
  /******************************************************/
  private async getToLanguageIdOrCreate(trx: Knex, toEnvId: number, language: string): Promise<number> {
    try {
      const lang = await trx
        .select('*')
        .from<Language>('languages')
        .where({ environmentId: toEnvId, code: language })
        .first();
      if (lang) {
        return lang.id;
      }

      const newLang = await trx<Language>('languages')
        .insert({ environmentId: toEnvId, code: language })
        .returning('*');
      return newLang[0].id;
    } catch (error) {
      throw new Error(
        `Failed to get or create language '${language}' in environment ID '${toEnvId}': ${error.message}`,
      );
    }
  }

  private async getToNamespaceIdOrCreate(trx: Knex, toLangId: number, namespace: string): Promise<number> {
    try {
      const ns = await trx.select('*').from('namespaces').where({ languageId: toLangId, name: namespace }).first();
      if (ns) {
        return ns.id;
      }
      const newNs = await trx('namespaces').insert({ languageId: toLangId, name: namespace }).returning('*');
      return newNs[0].id;
    } catch (error) {
      throw new Error(
        `Failed to get or create namespace '${namespace}' in language ID '${toLangId}': ${error.message}`,
      );
    }
  }

  private async getToTranslationOrCreate(trx: Knex, toNamespaceId: number): Promise<Translation> {
    try {
      const tr = await trx.select('*').from<Translation>('translations').where({ namespaceId: toNamespaceId }).first();
      if (tr) {
        return tr;
      }
      const newTr = await trx<Translation>('translations')
        .insert({ namespaceId: toNamespaceId, json: '{}' })
        .returning('*');
      return newTr[0];
    } catch (error) {
      throw new Error(`Failed to get or create translation for namespace ID '${toNamespaceId}': ${error.message}`);
    }
  }

  private async updateTranslation(trx: Knex, translationId: number, newJson: string): Promise<void> {
    return trx('translations').where({ id: translationId }).update({ json: newJson, updatedAt: trx.fn.now() });
  }

  private async updateBaseLanguage(trx: Knex, fromLangId: number, toEnvId: number, toLangId: number) {
    const fromLang = await trx.select('*').from<Language>('languages').where({ id: fromLangId }).first();
    const toLang = await trx.select('*').from<Language>('languages').where({ id: toLangId }).first();

    if (!fromLang || !toLang) {
      const msg = `Failed to find languages for base language update: fromLangId=${fromLangId}, toLangId=${toLangId}`;
      throw new BadRequestException(msg);
    }

    //! varrer as linguagens, para atualizar isBase corretamente, para mudar a toLang para ficar igual fromLang e mudar para 0 caso tenha
    //! outra linguagem com isBase = 1, para evitar ter mais de uma linguagem base
    if (fromLang.isBase !== toLang.isBase) {
      const toLangsList = await getLanguages(trx, toEnvId);
      for (const toLangsItem of toLangsList) {
        const ehToLang = toLangsItem.id === toLangId;
        if (ehToLang) {
          await trx('languages')
            .where({ id: toLangsItem.id })
            .update({ isBase: fromLang.isBase, updatedAt: trx.fn.now() });
          continue;
        }

        const fromLangIsBase = fromLang.isBase === 1;
        const isOtherLang = toLangsItem.id !== toLangId;
        const wasBaseBefore = toLangsItem.isBase === 1;
        if (fromLangIsBase && wasBaseBefore && isOtherLang) {
          await trx('languages').where({ id: toLangsItem.id }).update({ isBase: 0, updatedAt: trx.fn.now() });
        }
      }
    }
  }

  /******************************************************/
  /* Metodos privados - auxiliares do publish all       */
  /******************************************************/
  private async removeAllToEnvironmentData(trx: Knex.Transaction<any, any[]>, sysId: number, to: string) {
    await trx('environments').where({ systemId: sysId, name: to }).del();
  }

  private async createToEnvironment(trx: Knex, systemId: number, from: string, to: string): Promise<Environment> {
    const env = await trx.select('*').from<Environment>('environments').where({ systemId, name: from }).first();
    if (!env) {
      throw new Error(`Environment '${from}' does not exist for system ID '${systemId}'`);
    }

    const newEnv = await trx<Environment>('environments').insert({ systemId, name: to }).returning('*');
    return newEnv[0];
  }

  private async createToLanguage(trx: Knex, environmentId: number, fromLang: Language) {
    const newLanguage = await trx<Language>('languages')
      .insert({ environmentId, code: fromLang.code, isBase: fromLang.isBase })
      .returning('*');
    const newLang = newLanguage[0];

    const fromNamespaces = await trx.select('*').from<Namespace>('namespaces').where({ languageId: fromLang.id });
    for (const fromNs of fromNamespaces) {
      await this.createToNamespace(trx, newLang.id, fromNs);
    }
  }

  private async createToNamespace(trx: Knex, languageId: number, fromNs: Namespace) {
    const newNs = await trx('namespaces').insert({ languageId: languageId, name: fromNs.name }).returning('*');
    const newNamespace = newNs[0];
    const fromTranslation = await trx
      .select('*')
      .from<Translation>('translations')
      .where({ namespaceId: fromNs.id })
      .first();
    if (fromTranslation) {
      await trx('translations').insert({ namespaceId: newNamespace.id, json: fromTranslation.json }).returning('*');
    }
  }

  //#endregion
}
