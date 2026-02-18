import { ArgumentsHost, ExceptionFilter, Injectable, Logger } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { ErrorResponseDto } from '../common/dto/ErrorResponse.dto';

@Injectable()
export class GlobalErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalErrorFilter.name);
  constructor() {
    // Consigo usar o logger diretamente aqui pois ele é declarado como
    // módulo global e foi importado no AppModule
  }
  catch(exception: Error, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<FastifyReply>();
    const status = exception['status'] || 500;

    const exceptionResponse = exception['response'] || {};
    const message = exceptionResponse.message || exception.message || 'Internal server error';

    this.logger.error(`❌ GlobalErrorFilter disparado: message: ${message}, status: ${status}`, exception.stack);

    const errorResponse: ErrorResponseDto = {
      statusCode: status,
      message,
      error: exceptionResponse.error || exception.name || 'Error',
    };
    response.status(status).send(errorResponse);
  }
}
