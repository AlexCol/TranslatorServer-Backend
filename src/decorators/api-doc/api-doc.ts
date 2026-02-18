import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiHeader,
  ApiHeaderOptions,
  ApiOperation,
  ApiParamOptions,
  ApiQueryOptions,
  ApiResponseOptions,
} from '@nestjs/swagger';
import { ApiDocBody } from './api-doc-body';
import { ApiDocErrorResponse } from './api-doc-error-response';
import { ApiDocParam } from './api-doc-param';
import { ApiDocQuery } from './api-doc-query';
import { ApiDocResponse } from './api-doc-response';

interface ApiDocOptions {
  summary: string;
  description?: string;
  headers?: ApiHeaderOptions[];
  params?: Type<unknown> | ApiParamOptions[];
  query?: Type<unknown> | ApiQueryOptions[];
  body?: Type<unknown>;
  response?: Type<unknown> | ApiResponseOptions;
  isResponseArray?: boolean;
  successStatus?: number;
  errStatus?: number[];
}

export function ApiDoc(options: ApiDocOptions) {
  const decorators: MethodDecorator[] = [];

  // Adiciona a operação com sumário e descrição
  decorators.push(
    ApiOperation({
      summary: options.summary,
      description: options.description,
    }),
  );

  // Adiciona headers
  if (options.headers) {
    for (const header of options.headers) {
      decorators.push(ApiHeader(header));
    }
  }

  //Adiciona path parameters
  if (options.params) {
    decorators.push(ApiDocParam(options.params));
  }

  // Adiciona query parameters
  if (options.query) {
    decorators.push(ApiDocQuery(options.query));
  }

  // Adiciona o corpo da requisição
  if (options.body) {
    decorators.push(ApiDocBody(options.body));
  }

  if (options.response) {
    decorators.push(ApiDocResponse(options.response, options.isResponseArray ?? false, options.successStatus));
  } else {
    decorators.push(ApiDocResponse({ status: options.successStatus || 200 }));
  }

  // Adiciona respostas de erro
  decorators.push(ApiDocErrorResponse(options.errStatus || [400]));

  return applyDecorators(...decorators);
}
