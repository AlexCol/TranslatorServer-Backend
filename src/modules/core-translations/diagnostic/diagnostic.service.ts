import { Injectable } from '@nestjs/common';
import { EnvironmentService } from '../environment/environment.service';
import { LanguageService } from '../language/language.service';
import { NamespaceService } from '../namespace/namespace.service';
import { SystemService } from '../system/system.service';
import { TranslationsService } from '../translations/translations.service';
import { DiagnosticOverview } from './types/DiagnosticOverview';
import { EnvironmentDiagnostic } from './types/EnvironmentDiagnostic';
import { LanguageDiagnostic } from './types/LanguageDiagnostic';
import { NamespaceDiagnostic } from './types/NamespaceDiagnostic';
import { OverViewCounter } from './types/OverViewCounter';
import { SystemDiagnostic } from './types/SystemDiagnostic';

@Injectable()
export class DiagnosticService {
  constructor(
    private readonly systemsService: SystemService,
    private readonly environmentsService: EnvironmentService,
    private readonly languagesService: LanguageService,
    private readonly namespacesService: NamespaceService,
    private readonly translationsService: TranslationsService,
  ) {}

  async getOverview(): Promise<DiagnosticOverview> {
    const overview: OverViewCounter = { environments: 0, languages: 0, namespaces: 0 };
    const systems = await this.systemsService.listSystems();
    systems.sort((a, b) => a.localeCompare(b));

    const resultSystems: SystemDiagnostic[] = [];

    for (const system of systems) {
      await this.processaSystem(system, overview, resultSystems);
    }

    const totals = this.sumTotals(resultSystems, overview);
    return { totals, systems: resultSystems };
  }

  //#region Metodos privados processamento
  /******************************************************/
  /* Metodos privados processamento                     */
  /******************************************************/
  //! processa sistema
  private async processaSystem(system: string, overview: OverViewCounter, resultSystems: SystemDiagnostic[]) {
    const environments = await this.environmentsService.listEnvironments(system);
    environments.sort((a, b) => a.localeCompare(b));

    const environmentNodes: EnvironmentDiagnostic[] = [];

    for (const environment of environments) {
      await this.processaEnvironment(system, environment, overview, environmentNodes);
    }

    resultSystems.push(this.sumSystem(system, environmentNodes));
  }

  //! processa ambiente
  private async processaEnvironment(
    system: string,
    environment: string,
    overview: OverViewCounter,
    environmentNodes: EnvironmentDiagnostic[],
  ) {
    overview.environments += 1;

    const languages = await this.languagesService.listLanguages(system, environment);
    if (languages.length === 0) {
      environmentNodes.push({
        environment,
        baseLanguage: null,
        totalTerms: 0,
        translatedTerms: 0,
        missingTerms: 0,
        translatedPercentage: 0,
        languages: [],
      });
      return;
    }

    languages.sort((a, b) => a.localeCompare(b));
    const baseLanguageFromProvider = await this.languagesService.getBaseLanguage(system, environment);
    const baseLanguage = baseLanguageFromProvider ?? undefined;
    if (!baseLanguage) {
      environmentNodes.push({
        environment,
        baseLanguage: null,
        totalTerms: 0,
        translatedTerms: 0,
        missingTerms: 0,
        translatedPercentage: 0,
        languages: languages.map((language) => ({
          language,
          isBase: false,
          totalTerms: 0,
          translatedTerms: 0,
          missingTerms: 0,
          translatedPercentage: 0,
          namespaces: [],
        })),
      });
      return;
    }

    const languageNodes: LanguageDiagnostic[] = [];
    for (const language of languages) {
      await this.processaLanguage(system, environment, language, overview, languageNodes, baseLanguage);
    }

    environmentNodes.push(this.sumEnvironment(environment, baseLanguage, languageNodes));
  }

  //! processa linguagem
  private async processaLanguage(
    system: string,
    environment: string,
    language: string,
    overview: OverViewCounter,
    languageNodes: LanguageDiagnostic[],
    baseLanguage: string,
  ) {
    overview.languages += 1;
    const languageNamespaces = await this.namespacesService.listNamespaces(system, environment, language);
    languageNamespaces.sort((a, b) => a.localeCompare(b));

    const namespaceNodes: NamespaceDiagnostic[] = [];
    for (const namespace of languageNamespaces) {
      await this.processaNamespace(system, environment, language, namespace, overview, namespaceNodes);
    }

    languageNodes.push(this.sumLanguage(language, language === baseLanguage, namespaceNodes));
  }

  //! processa namespace
  async processaNamespace(
    system: string,
    environment: string,
    language: string,
    namespace: string,
    overview: OverViewCounter,
    namespaceNodes: NamespaceDiagnostic[],
  ) {
    overview.namespaces += 1;

    const status = await this.translationsService.getTranslationStatus({ system, environment, language, namespace });

    namespaceNodes.push({
      namespace: status.namespace,
      totalTerms: status.total,
      translatedTerms: status.translated,
      missingTerms: status.missing,
      translatedPercentage: status.percentage,
    });
  }
  //#endregion

  //#region Metodos privados
  /******************************************************/
  /* Metodos privados                                   */
  /******************************************************/
  private sumLanguage(language: string, isBase: boolean, namespaces: NamespaceDiagnostic[]): LanguageDiagnostic {
    const totalTerms = namespaces.reduce((sum, item) => sum + item.totalTerms, 0);
    const translatedTerms = namespaces.reduce((sum, item) => sum + item.translatedTerms, 0);
    const missingTerms = namespaces.reduce((sum, item) => sum + item.missingTerms, 0);
    const translatedPercentage = isBase || totalTerms === 0 ? 0 : Math.round((translatedTerms / totalTerms) * 100);

    return {
      language,
      isBase,
      totalTerms,
      translatedTerms,
      missingTerms,
      translatedPercentage,
      namespaces,
    };
  }

  private sumEnvironment(
    environment: string,
    baseLanguage: string | null,
    languages: LanguageDiagnostic[],
  ): EnvironmentDiagnostic {
    const totalTerms = languages.reduce((sum, item) => sum + item.totalTerms, 0);
    const translatedTerms = languages.reduce((sum, item) => sum + item.translatedTerms, 0);
    const missingTerms = languages.reduce((sum, item) => sum + item.missingTerms, 0);
    const nonBaseStats = this.getNonBaseLanguageStats(languages);
    const translatedPercentage =
      nonBaseStats.totalTerms > 0 ? Math.round((nonBaseStats.translatedTerms / nonBaseStats.totalTerms) * 100) : 0;

    return {
      environment,
      baseLanguage,
      totalTerms,
      translatedTerms,
      missingTerms,
      translatedPercentage,
      languages,
    };
  }

  private sumSystem(system: string, environments: EnvironmentDiagnostic[]): SystemDiagnostic {
    const totalTerms = environments.reduce((sum, item) => sum + item.totalTerms, 0);
    const translatedTerms = environments.reduce((sum, item) => sum + item.translatedTerms, 0);
    const missingTerms = environments.reduce((sum, item) => sum + item.missingTerms, 0);
    const nonBaseStats = environments.reduce(
      (acc, environment) => {
        const envStats = this.getNonBaseLanguageStats(environment.languages);
        acc.totalTerms += envStats.totalTerms;
        acc.translatedTerms += envStats.translatedTerms;
        return acc;
      },
      { totalTerms: 0, translatedTerms: 0 },
    );
    const translatedPercentage =
      nonBaseStats.totalTerms > 0 ? Math.round((nonBaseStats.translatedTerms / nonBaseStats.totalTerms) * 100) : 0;

    return {
      system,
      totalTerms,
      translatedTerms,
      missingTerms,
      translatedPercentage,
      environments,
    };
  }

  private sumTotals(systems: SystemDiagnostic[], overview: OverViewCounter) {
    const { environments, languages, namespaces } = overview;
    const totalTerms = systems.reduce((sum, item) => sum + item.totalTerms, 0);
    const translatedTerms = systems.reduce((sum, item) => sum + item.translatedTerms, 0);
    const missingTerms = systems.reduce((sum, item) => sum + item.missingTerms, 0);
    const nonBaseStats = systems.reduce(
      (acc, system) => {
        for (const environment of system.environments) {
          const envStats = this.getNonBaseLanguageStats(environment.languages);
          acc.totalTerms += envStats.totalTerms;
          acc.translatedTerms += envStats.translatedTerms;
        }
        return acc;
      },
      { totalTerms: 0, translatedTerms: 0 },
    );
    const translatedPercentage =
      nonBaseStats.totalTerms > 0 ? Math.round((nonBaseStats.translatedTerms / nonBaseStats.totalTerms) * 100) : 0;

    return {
      systems: systems.length,
      environments,
      languages,
      namespaces,
      totalTerms,
      translatedTerms,
      missingTerms,
      translatedPercentage,
    };
  }

  private getNonBaseLanguageStats(languages: LanguageDiagnostic[]) {
    const nonBaseLanguages = languages.filter((language) => !language.isBase);
    const totalTerms = nonBaseLanguages.reduce((sum, item) => sum + item.totalTerms, 0);
    const translatedTerms = nonBaseLanguages.reduce((sum, item) => sum + item.translatedTerms, 0);
    return { totalTerms, translatedTerms };
  }
  // #endregion
}
