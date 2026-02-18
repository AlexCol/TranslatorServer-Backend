import { Injectable } from '@nestjs/common';
import { validateLanguage } from '../common/validateLanguage';
import { TranslationsCacheService } from '../translations-cache.service';
import { LanguageProvider } from '@/modules/core-translations/core/interfaces/LanguageProvider';

@Injectable()
export class LanguageService {
  constructor(
    private readonly cache: TranslationsCacheService,
    private readonly provider: LanguageProvider,
  ) {}

  async listLanguages(system: string, environment: string): Promise<string[]> {
    return this.provider.listLanguages(system, environment);
  }

  async createLanguage(system: string, language: string): Promise<void> {
    validateLanguage(language);
    await this.provider.createLanguage(system, language);
    await this.cache.deleteByPrefix(`${system}:dev:${language}:`);
  }

  async deleteLanguage(system: string, language: string): Promise<void> {
    validateLanguage(language);
    await this.provider.deleteLanguage(system, language);
    await this.cache.deleteByPrefix(`${system}:dev:${language}:`);
  }

  async getBaseLanguage(system: string, environment: string): Promise<string | null> {
    return this.provider.getBaseLanguage(system, environment);
  }

  async demoteBaseLanguage(system: string, language: string): Promise<void> {
    validateLanguage(language);
    return this.provider.demoteBaseLanguage(system, language);
  }

  async promoteToBaseLanguage(system: string, language: string): Promise<void> {
    validateLanguage(language);
    return this.provider.promoteToBaseLanguage(system, language);
  }
}
