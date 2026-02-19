import { Logger } from '@nestjs/common';
import { GlobalErrorFilter } from './globalError.filter';

describe('GlobalErrorFilter', () => {
  it('sends normalized error response', () => {
    const loggerSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    const response = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    const host = {
      switchToHttp: () => ({
        getResponse: () => response,
      }),
    } as any;
    const error = {
      status: 400,
      message: 'Bad payload',
      name: 'BadRequestException',
      stack: 'stack',
      response: { message: 'Bad payload', error: 'Bad Request' },
    } as any;

    try {
      new GlobalErrorFilter().catch(error, host);

      expect(response.status).toHaveBeenCalledWith(400);
      expect(response.send).toHaveBeenCalledWith({
        statusCode: 400,
        message: 'Bad payload',
        error: 'Bad Request',
      });
    } finally {
      loggerSpy.mockRestore();
    }
  });
});
