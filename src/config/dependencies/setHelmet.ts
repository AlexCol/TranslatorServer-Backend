import fastifyHelmet from '@fastify/helmet';
import { NestFastifyApplication } from '@nestjs/platform-fastify';

export default async function setHelmet(app: NestFastifyApplication): Promise<void> {
  await app.register(fastifyHelmet);
}
