import { TranslationKeyDto } from './translation-keys.dto';

describe('TranslationKeyDto', () => {
  it('assigns key and value fields', () => {
    const dto = new TranslationKeyDto();
    dto.key = 'hello';
    dto.value = 'ola';

    expect(dto).toEqual({ key: 'hello', value: 'ola' });
  });
});
