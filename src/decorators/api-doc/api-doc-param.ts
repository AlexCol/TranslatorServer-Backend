import { applyDecorators, Type } from '@nestjs/common';
import { ApiParam, ApiParamOptions } from '@nestjs/swagger';

export function ApiDocParam<T>(entity: Type<T> | ApiParamOptions[]) {
  //! array base para os decorators
  const decorators: (MethodDecorator & ClassDecorator)[] = [];

  //? Se veio como ApiParamOptions[], são critérios customizados
  if (Array.isArray(entity)) {
    decorators.push(...entity.map((param) => ApiParam(param)));
  }

  //? se veio como Type<T> é 'function' construtora de entidade
  if (typeof entity === 'function') {
    // Pega as propriedades decoradas com @ApiProperty da entidade
    const entityProps = Object.getOwnPropertyNames(new (entity as Type<T>)());
    decorators.push(
      ...entityProps.map((prop) =>
        ApiParam({ name: prop, required: false, description: `Campo da entidade: ${prop}` }),
      ),
    );
  }
  return applyDecorators(...decorators);
}
