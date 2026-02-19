import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { ApiDocErrorResponse } from './api-doc-error-response';

jest.mock('@nestjs/common', () => ({
  applyDecorators: jest.fn((...decorators: unknown[]) => decorators),
}));

jest.mock('@nestjs/swagger', () => ({
  ApiResponse: jest.fn((options: unknown) => options),
  ApiProperty: jest.fn(() => () => undefined),
}));

describe('ApiDocErrorResponse', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates one response decorator for each provided status code', () => {
    const decorator = ApiDocErrorResponse([400, 404]);

    expect(ApiResponse).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ status: 400, type: expect.any(Function) }),
    );
    expect(ApiResponse).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ status: 404, type: expect.any(Function) }),
    );
    expect(applyDecorators).toHaveBeenCalledTimes(1);
    expect(decorator).toEqual([
      expect.objectContaining({ status: 400, type: expect.any(Function) }),
      expect.objectContaining({ status: 404, type: expect.any(Function) }),
    ]);
  });

  it('falls back to status 400 when no codes are provided', () => {
    const decorator = ApiDocErrorResponse(undefined as unknown as number[]);

    expect(ApiResponse).toHaveBeenCalledWith(expect.objectContaining({ status: 400, type: expect.any(Function) }));
    expect(decorator).toEqual([expect.objectContaining({ status: 400, type: expect.any(Function) })]);
  });
});
