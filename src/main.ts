import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { AppConfig } from './config/appConfig';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

  await AppConfig.configure(app);

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0', (_err, address) => {
    const logger = new Logger('Bootstrap');
    logger.log(`📚 Swagger disponível em ${address}/api/docs`);
    logger.log(`🚀 Servidor rodando em ${address}`);
  });
}
void bootstrap();
