import fastifyCookie from '@fastify/cookie';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import envConfig from '@/env.config';

export default async function setCookies(app: NestFastifyApplication) {
  if (envConfig.node.isProd && !envConfig.session.cookieSecret) {
    throw new Error('COOKIE_SECRET deve ser configurada em produção');
  }

  await app.register(fastifyCookie, { secret: envConfig.session.cookieSecret || undefined });
}
