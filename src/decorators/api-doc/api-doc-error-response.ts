import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { ErrorResponseDto } from '@/common/dto/ErrorResponse.dto';

export function ApiDocErrorResponse(errCodes: number[]) {
  //! array base para os decorators
  const decorators: (MethodDecorator & ClassDecorator)[] = [];

  // Adiciona respostas de erro
  if (errCodes) {
    errCodes.forEach((status) => {
      decorators.push(ApiResponse({ status, type: ErrorResponseDto }));
    });
  } else {
    decorators.push(ApiResponse({ status: 400, type: ErrorResponseDto }));
  }

  return applyDecorators(...decorators);
}
