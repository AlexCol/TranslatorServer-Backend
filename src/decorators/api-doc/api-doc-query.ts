import { applyDecorators, Type } from '@nestjs/common';
import { ApiQuery, ApiQueryOptions } from '@nestjs/swagger';

export function ApiDocQuery<T>(entity: Type<T> | ApiQueryOptions[]) {
  //! array base para os decorators
  const decorators: (MethodDecorator & ClassDecorator)[] = [];

  //? Se veio como ApiQueryOptions[], são critérios customizados
  if (Array.isArray(entity)) {
    decorators.push(...entity.map((query) => ApiQuery(query)));
  }

  //? se veio como Type<T> é 'function' construtora de entidade
  if (typeof entity === 'function') {
    // Pega as propriedades decoradas com @ApiProperty da entidade
    const entityProps = Object.getOwnPropertyNames(new (entity as Type<T>)());
    decorators.push(
      ...entityProps.map((prop) =>
        ApiQuery({ name: prop, required: false, description: `Campo da entidade: ${prop}` }),
      ),
    );
  }

  return applyDecorators(...decorators);
}
