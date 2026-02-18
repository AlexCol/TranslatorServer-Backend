import { BadRequestException } from '@nestjs/common';

export function validateLanguage(language: string) {
  if (!/^[a-z]{2}(-[A-Z]{2})?$/.test(language)) {
    throw new BadRequestException('Invalid language format');
  }

  try {
    return Intl.getCanonicalLocales(language)[0];
  } catch {
    throw new BadRequestException('Language not supported by Intl');
  }
}
