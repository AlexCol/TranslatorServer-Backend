import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, ApiResponseOptions, getSchemaPath } from '@nestjs/swagger';

export function ApiDocResponse<T>(response?: Type<T> | ApiResponseOptions, isArray?: boolean, status: number = 200) {
  const decorators: (MethodDecorator & ClassDecorator)[] = [];

  //? Se veio como ApiResponseOptions, são critérios customizados
  if (typeof response === 'object') {
    decorators.push(ApiResponse({ status, ...response }));
  }

  //? se veio como Type<T> é 'function' construtora de entidade
  if (typeof response === 'function') {
    //! registra modelos necessários (SearchCriteriaReturnType só se paginado)
    const extraModels = [response];
    decorators.push(ApiExtraModels(...extraModels));

    //! schema da propriedade `data`
    const dataSchema = isArray
      ? { type: 'array', items: { $ref: getSchemaPath(response) } }
      : { $ref: getSchemaPath(response) };

    //! monta schema final
    const schema = dataSchema;

    decorators.push(ApiResponse({ status, schema }));
  }

  return applyDecorators(...decorators);
}
