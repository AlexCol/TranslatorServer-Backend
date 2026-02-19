const createDocumentMock = jest.fn<any, any[]>().mockReturnValue({ openapi: '3.0.0' });
const setupMock = jest.fn<any, any[]>();
const apiReferenceMock = jest.fn<any, any[]>().mockReturnValue('scalar-handler');

jest.mock('@nestjs/swagger', () => ({
  DocumentBuilder: jest.fn().mockImplementation(() => ({
    setTitle: jest.fn().mockReturnThis(),
    setDescription: jest.fn().mockReturnThis(),
    setVersion: jest.fn().mockReturnThis(),
    build: jest.fn().mockReturnValue({}),
  })),
  SwaggerModule: {
    createDocument: (app: any, config: any) => createDocumentMock(app, config),
    setup: (path: string, app: any, document: any, options: any) => setupMock(path, app, document, options),
  },
}));

jest.mock('@scalar/nestjs-api-reference', () => ({
  apiReference: (options: any) => apiReferenceMock(options),
}));

import setSwagger from './setSwagger';

describe('setSwagger', () => {
  it('creates swagger document and configures scalar + swagger routes', () => {
    const app = { use: jest.fn() } as any;

    setSwagger(app);

    expect(createDocumentMock).toHaveBeenCalledWith(app, expect.any(Object));
    expect(apiReferenceMock).toHaveBeenCalledWith(expect.objectContaining({ withFastify: true }));
    expect(app.use).toHaveBeenCalledWith('/api/docs', 'scalar-handler');
    expect(setupMock).toHaveBeenCalledWith(
      'swagger',
      app,
      { openapi: '3.0.0' },
      expect.objectContaining({
        jsonDocumentUrl: '/swagger/json',
        yamlDocumentUrl: '/swagger/yaml',
        swaggerUiEnabled: false,
      }),
    );
  });
});
