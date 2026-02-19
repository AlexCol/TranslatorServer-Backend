import { applyDecorators } from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';
import { ApiDocParam } from './api-doc-param';

jest.mock('@nestjs/common', () => ({
  applyDecorators: jest.fn((...decorators: unknown[]) => decorators),
}));

jest.mock('@nestjs/swagger', () => ({
  ApiParam: jest.fn((options: unknown) => options),
}));

class ParamDto {
  system = '';
  language = '';
}

describe('ApiDocParam', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('maps custom api param options', () => {
    const decorator = ApiDocParam([{ name: 'id', required: true }]);

    expect(ApiParam).toHaveBeenCalledWith({ name: 'id', required: true });
    expect(decorator).toEqual([{ name: 'id', required: true }]);
  });

  it('maps dto properties to api param options', () => {
    const decorator = ApiDocParam(ParamDto);

    expect(ApiParam).toHaveBeenNthCalledWith(1, {
      name: 'system',
      required: false,
      description: 'Campo da entidade: system',
    });
    expect(ApiParam).toHaveBeenNthCalledWith(2, {
      name: 'language',
      required: false,
      description: 'Campo da entidade: language',
    });
    expect(applyDecorators).toHaveBeenCalledTimes(1);
    expect(decorator).toHaveLength(2);
  });
});

