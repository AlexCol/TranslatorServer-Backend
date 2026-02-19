import { applyDecorators } from '@nestjs/common';
import { ApiHeader, ApiOperation } from '@nestjs/swagger';
import { ApiDocBody } from './api-doc-body';
import { ApiDocErrorResponse } from './api-doc-error-response';
import { ApiDocParam } from './api-doc-param';
import { ApiDocQuery } from './api-doc-query';
import { ApiDocResponse } from './api-doc-response';
import { ApiDoc } from './api-doc';

jest.mock('@nestjs/common', () => ({
  applyDecorators: jest.fn((...decorators: unknown[]) => decorators),
}));

jest.mock('@nestjs/swagger', () => ({
  ApiHeader: jest.fn((options: unknown) => ({ header: options })),
  ApiOperation: jest.fn((options: unknown) => ({ operation: options })),
}));

jest.mock('./api-doc-body', () => ({
  ApiDocBody: jest.fn(() => 'bodyDecorator'),
}));

jest.mock('./api-doc-error-response', () => ({
  ApiDocErrorResponse: jest.fn(() => 'errorDecorator'),
}));

jest.mock('./api-doc-param', () => ({
  ApiDocParam: jest.fn(() => 'paramDecorator'),
}));

jest.mock('./api-doc-query', () => ({
  ApiDocQuery: jest.fn(() => 'queryDecorator'),
}));

jest.mock('./api-doc-response', () => ({
  ApiDocResponse: jest.fn(() => 'responseDecorator'),
}));

class BodyDto {}

describe('ApiDoc', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('builds full decorator pipeline when options are provided', () => {
    const decorator = ApiDoc({
      summary: 'summary',
      description: 'description',
      headers: [{ name: 'x-test' }],
      params: [{ name: 'id' }],
      query: [{ name: 'page' }],
      body: BodyDto,
      response: BodyDto,
      isResponseArray: true,
      successStatus: 201,
      errStatus: [400, 404],
    });

    expect(ApiOperation).toHaveBeenCalledWith({ summary: 'summary', description: 'description' });
    expect(ApiHeader).toHaveBeenCalledWith({ name: 'x-test' });
    expect(ApiDocParam).toHaveBeenCalledWith([{ name: 'id' }]);
    expect(ApiDocQuery).toHaveBeenCalledWith([{ name: 'page' }]);
    expect(ApiDocBody).toHaveBeenCalledWith(BodyDto);
    expect(ApiDocResponse).toHaveBeenCalledWith(BodyDto, true, 201);
    expect(ApiDocErrorResponse).toHaveBeenCalledWith([400, 404]);
    expect(applyDecorators).toHaveBeenCalledTimes(1);
    expect(decorator).toContain('responseDecorator');
  });

  it('uses default response/error status when minimal options are provided', () => {
    ApiDoc({ summary: 'only-summary' });

    expect(ApiDocResponse).toHaveBeenCalledWith({ status: 200 });
    expect(ApiDocErrorResponse).toHaveBeenCalledWith([400]);
  });
});

