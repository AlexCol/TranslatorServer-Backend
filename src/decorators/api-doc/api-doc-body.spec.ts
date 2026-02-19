import { applyDecorators } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { ApiDocBody } from './api-doc-body';

jest.mock('@nestjs/common', () => ({
  applyDecorators: jest.fn((...decorators: unknown[]) => decorators),
}));

jest.mock('@nestjs/swagger', () => ({
  ApiBody: jest.fn((options: unknown) => options),
}));

class BodyDto {}

describe('ApiDocBody', () => {
  it('builds a body decorator with the provided dto type', () => {
    const decorator = ApiDocBody(BodyDto);

    expect(ApiBody).toHaveBeenCalledWith({ type: BodyDto });
    expect(applyDecorators).toHaveBeenCalledTimes(1);
    expect(decorator).toEqual([{ type: BodyDto }]);
  });
});

