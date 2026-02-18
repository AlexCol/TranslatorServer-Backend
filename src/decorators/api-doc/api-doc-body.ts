import { applyDecorators, Type } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';

export function ApiDocBody<T>(entity: Type<T>) {
  const decorators: MethodDecorator[] = [];

  decorators.push(ApiBody({ type: entity }));

  return applyDecorators(...decorators);
}
