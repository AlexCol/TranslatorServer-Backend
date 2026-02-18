import { CatalogEntry, TranslationStatus } from '../types';
import { TranslationKey } from '../types/TranslationKey';

export abstract class TranslationProvider {
  //!carrega o json da tradução
  abstract loadWithFallBack(entry: CatalogEntry): Promise<Record<string, any>>;
  abstract loadWithoutFallBack(entry: CatalogEntry): Promise<Record<string, any>>;

  //!sobre chaves
  abstract createKey(entry: CatalogEntry, translationKeys: TranslationKey[]): Promise<void>;
  abstract createTranslation(entry: CatalogEntry, translationKeys: TranslationKey[]): Promise<void>;
  abstract updateKey(entry: CatalogEntry, translationKeys: TranslationKey[]): Promise<void>;
  abstract deleteKey(entry: CatalogEntry, translationKeys: string[]): Promise<void>;

  //!status e informações gerais
  abstract getTranslationStatus(entry: CatalogEntry): Promise<TranslationStatus>;
}
