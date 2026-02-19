import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { ApiDocQuery } from './api-doc-query';

jest.mock('@nestjs/common', () => ({
  applyDecorators: jest.fn((...decorators: unknown[]) => decorators),
}));

jest.mock('@nestjs/swagger', () => ({
  ApiQuery: jest.fn((options: unknown) => options),
}));

class QueryDto {
  page = 1;
  limit = 10;
}

describe('ApiDocQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('maps custom api query options', () => {
    const decorator = ApiDocQuery([{ name: 'search', required: false }]);

    expect(ApiQuery).toHaveBeenCalledWith({ name: 'search', required: false });
    expect(decorator).toEqual([{ name: 'search', required: false }]);
  });

  it('maps dto properties to api query options', () => {
    const decorator = ApiDocQuery(QueryDto);

    expect(ApiQuery).toHaveBeenNthCalledWith(1, {
      name: 'page',
      required: false,
      description: 'Campo da entidade: page',
    });
    expect(ApiQuery).toHaveBeenNthCalledWith(2, {
      name: 'limit',
      required: false,
      description: 'Campo da entidade: limit',
    });
    expect(applyDecorators).toHaveBeenCalledTimes(1);
    expect(decorator).toHaveLength(2);
  });
});

