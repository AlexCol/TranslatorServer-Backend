export type TranslationStatus = {
  namespace: string;
  language: string;
  total: number;
  translated: number;
  missing: number;
  percentage: number;
};
