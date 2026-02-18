import { Injectable, Logger } from '@nestjs/common';
import { TranslationKey } from '../core/types/TranslationKey';
import { TranslationsCacheService } from '../translations-cache.service';
import { TranslationProvider } from '@/modules/core-translations/core/interfaces/TranslationProvider';
import { CatalogEntry, TranslationStatus } from '@/modules/core-translations/core/types';

@Injectable()
export class TranslationsService {
  private readonly logger = new Logger(TranslationsService.name);

  constructor(
    private readonly cache: TranslationsCacheService,
    private readonly provider: TranslationProvider,
  ) {}

  async loadWithFallBack(entry: CatalogEntry): Promise<Record<string, any>> {
    const cacheKey = `${entry.system}:${entry.environment}:${entry.language}:${entry.namespace}`;

    let json = await this.cache.get(cacheKey);
    if (json) {
      this.logger.debug(`Cache hit for ${cacheKey}`);
      return json;
    }

    json = await this.provider.loadWithFallBack(entry);
    this.logger.debug(`Cache miss for ${cacheKey}`);
    await this.cache.set(cacheKey, json);

    return json;
  }

  async loadWithoutFallBack(entry: CatalogEntry): Promise<Record<string, any>> {
    const cacheKey = `${entry.system}:${entry.environment}:${entry.language}:${entry.namespace}:clean`;

    let json = await this.cache.get(cacheKey);
    if (json) {
      this.logger.debug(`Cache hit for ${cacheKey}`);
      return json;
    }

    json = await this.provider.loadWithoutFallBack(entry);
    this.logger.debug(`Cache miss for ${cacheKey}`);
    await this.cache.set(cacheKey, json);

    return json;
  }

  async createKey(system: string, namespace: string, translationKeys: TranslationKey[]): Promise<void> {
    const newKeyCatalog = {
      system: system,
      environment: 'dev',
      language: '',
      namespace: namespace,
    } satisfies CatalogEntry;
    const result = await this.provider.createKey(newKeyCatalog, translationKeys);
    await this.cache.deleteByPrefix(`${system}:dev`); //limpa cache para forçar recarregamento das traduções
    return result;
  }

  async createTranslation(system: string, language: string, namespace: string, translationKeys: TranslationKey[]) {
    const entry = {
      system: system,
      environment: 'dev',
      language: language,
      namespace: namespace,
    } satisfies CatalogEntry;
    const result = await this.provider.createTranslation(entry, translationKeys);
    await this.cache.deleteByPrefix(`${system}:dev`); //limpa cache para forçar recarregamento das traduções
    return result;
  }

  async updateKey(
    system: string,
    language: string,
    namespace: string,
    translationKeys: TranslationKey[],
  ): Promise<void> {
    const entry = {
      system: system,
      environment: 'dev',
      language: language,
      namespace: namespace,
    } satisfies CatalogEntry;
    const result = await this.provider.updateKey(entry, translationKeys);
    await this.cache.deleteByPrefix(`${system}:dev`); //limpa cache para forçar recarregamento das traduções
    return result;
  }

  async deleteKey(system: string, namespace: string, keys: string[]): Promise<void> {
    const entry = {
      system: system,
      environment: 'dev',
      language: '',
      namespace: namespace,
    } satisfies CatalogEntry;
    const result = await this.provider.deleteKey(entry, keys);
    await this.cache.deleteByPrefix(`${system}:dev`); //limpa cache para forçar recarregamento das traduções
    return result;
  }

  async getTranslationStatus(entry: CatalogEntry): Promise<TranslationStatus> {
    return await this.provider.getTranslationStatus(entry);
  }
}
