import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { LanguageService } from '../core-translations/language/language.service';
import { NamespaceService } from '../core-translations/namespace/namespace.service';
import { TranslationsService } from '../core-translations/translations/translations.service';
import { TranslationsCacheService } from '../core-translations/translations-cache.service';
import { CdnPublisher } from './interfaces/CdnPublisher';

@Injectable()
export class CdnPublisherService {
  constructor(
    private readonly cache: TranslationsCacheService,
    private readonly cdnPublisher: CdnPublisher,
    private readonly modRef: ModuleRef,
  ) {}

  //#region Metodos da interface
  /******************************************************/
  /* Metodos publicos                                   */
  /******************************************************/
  async pushToCdn(system: string, environment: string): Promise<string> {
    await this.cdnPublisher.clearFiles(system, environment);
    await this.cache.deleteByPrefix(`${system}:${environment}:`);
    const langs = await this.getLanguages(system, environment);

    await Promise.all(
      langs.map((lang) => {
        return this.processLanguage(system, environment, lang);
      }),
    );
    return 'Publicação para CDN concluída com sucesso!';
  }
  //#endregion

  //#region Metodos privados
  /******************************************************/
  /* Metodos privados                                   */
  /******************************************************/
  //! Processa um idioma (chamado em paralelo em pushToCdn)
  private async processLanguage(system: string, environment: string, language: string): Promise<void> {
    const namespaces = await this.getNamespaces(system, environment, language);

    await Promise.all(
      namespaces.map((ns) => {
        return this.processNamespace(system, environment, language, ns);
      }),
    );
  }

  //! Processa um namespace (chamado em paralelo em processLanguage)
  private async processNamespace(system: string, environment: string, language: string, namespace: string) {
    const translations = await this.getTranslations(system, environment, language, namespace);

    if (translations) {
      await this.cdnPublisher.uploadToCdn(system, environment, language, namespace, translations);
    }
  }

  private async getLanguages(system: string, environment: string): Promise<string[]> {
    const langService = this.modRef.get(LanguageService, { strict: false });
    return langService.listLanguages(system, environment);
  }

  private async getNamespaces(system: string, environment: string, language: string): Promise<string[]> {
    const namespaceService = this.modRef.get(NamespaceService, { strict: false });
    return namespaceService.listNamespaces(system, environment, language);
  }

  private async getTranslations(system: string, environment: string, language: string, namespace: string) {
    const translationsService = this.modRef.get(TranslationsService, { strict: false });
    return translationsService.loadWithFallBack({ system, environment, language, namespace });
  }
  //#endregion
}
