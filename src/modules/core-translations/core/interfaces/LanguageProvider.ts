export abstract class LanguageProvider {
  //!sobre idiomas
  abstract listLanguages(system: string, env: string): Promise<string[]>;
  abstract createLanguage(system: string, language: string): Promise<void>; //sempre criar no ambiente de 'dev'
  abstract deleteLanguage(system: string, language: string): Promise<void>; //sempre remover no ambiente de 'dev'

  abstract getBaseLanguage(system: string, env: string): Promise<string | null>;
  abstract demoteBaseLanguage(system: string, language: string): Promise<void>;
  abstract promoteToBaseLanguage(system: string, language: string): Promise<void>;
}
