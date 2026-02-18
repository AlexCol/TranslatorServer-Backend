import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

export default function setSwagger(app: NestFastifyApplication): void {
  //se usar fastify, precisa de npm install @fastify/static
  const config = new DocumentBuilder()
    .setTitle('Servidor de Tradução')
    .setDescription('API para gerenciamento de traduções.')
    .setVersion('1.0')
    //.addBearerAuth() //pra adicinar uso de jwt (cada rota precisa ter o decorator @ApiBearerAuth())
    .build();

  const document = SwaggerModule.createDocument(app, config);

  app.use(
    '/api/docs',
    apiReference({
      content: document,
      showDeveloperTools: 'never',
      theme: 'bluePlanet',
      darkMode: true,
      withFastify: true,
      layout: 'modern',
      pageTitle: 'API Documentation',
    }),
  );

  // Swagger endpoints para JSON e YAML
  SwaggerModule.setup('swagger', app, document, {
    jsonDocumentUrl: '/swagger/json',
    yamlDocumentUrl: '/swagger/yaml',
    swaggerUiEnabled: false,
  });
}
