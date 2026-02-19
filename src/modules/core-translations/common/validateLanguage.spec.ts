import { BadRequestException } from '@nestjs/common';
import { validateLanguage } from './validateLanguage';

describe('validateLanguage', () => {
  it('returns canonical language for valid locale', () => {
    expect(validateLanguage('pt-BR')).toBe('pt-BR');
    expect(validateLanguage('en')).toBe('en');
  });

  it('throws for invalid format', () => {
    expect(() => validateLanguage('english')).toThrow(BadRequestException);
    expect(() => validateLanguage('en-us')).toThrow(BadRequestException);
  });

  it('throws when Intl does not support locale', () => {
    const intlSpy = jest.spyOn(Intl, 'getCanonicalLocales').mockImplementation(() => {
      throw new Error('unsupported locale');
    });

    try {
      expect(() => validateLanguage('en-US')).toThrow(BadRequestException);
    } finally {
      intlSpy.mockRestore();
    }
  });
});
