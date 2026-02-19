import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { ApiDocResponse } from './api-doc-response';

jest.mock('@nestjs/common', () => ({
  applyDecorators: jest.fn((...decorators: unknown[]) => decorators),
}));

jest.mock('@nestjs/swagger', () => ({
  ApiExtraModels: jest.fn((...models: unknown[]) => ({ models })),
  ApiResponse: jest.fn((options: unknown) => options),
  getSchemaPath: jest.fn(() => '#/components/schemas/ResponseDto'),
}));

class ResponseDto {}

describe('ApiDocResponse', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses ApiResponse options object as response config', () => {
    const decorator = ApiDocResponse({ description: 'ok' }, false, 201);

    expect(ApiResponse).toHaveBeenCalledWith({ status: 201, description: 'ok' });
    expect(decorator).toEqual([{ status: 201, description: 'ok' }]);
  });

  it('maps dto response as schema array when requested', () => {
    const decorator = ApiDocResponse(ResponseDto, true, 200);

    expect(ApiExtraModels).toHaveBeenCalledWith(ResponseDto);
    expect(getSchemaPath).toHaveBeenCalledWith(ResponseDto);
    expect(ApiResponse).toHaveBeenCalledWith({
      status: 200,
      schema: { type: 'array', items: { $ref: '#/components/schemas/ResponseDto' } },
    });
    expect(applyDecorators).toHaveBeenCalledTimes(1);
    expect(decorator).toHaveLength(2);
  });
});

