import { NestFastifyApplication } from '@nestjs/platform-fastify';
import envConfig from 'src/env.config';

export default function setCors(app: NestFastifyApplication): void {
  const isProduction = envConfig.node.isProd;
  const normalizeOrigin = (origin: string) => origin.replace(/\/+$/, '');
  const productionOrigins = envConfig.cors.allowedOrigins
    .split(',')
    .map((origin) => normalizeOrigin(origin.trim()))
    .filter(Boolean);

  app.enableCors({
    origin: isProduction
      ? (origin, callback) => {
          if (!origin) {
            callback(null, true);
            return;
          }

          callback(null, productionOrigins.includes(normalizeOrigin(origin)));
        }
      : (origin, callback) => {
          // Permite localhost e IPs da rede local
          const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:3001',
            /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/, // 192.168.x.x
            /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/, // 10.x.x.x
            /^http:\/\/172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}(:\d+)?$/, // 172.16-31.x.x
          ];

          if (
            !origin ||
            allowedOrigins.some((allowed) => (typeof allowed === 'string' ? allowed === origin : allowed.test(origin)))
          ) {
            callback(null, true); // ✅ Primeiro arg: erro (null = sem erro), segundo: permitido (true)
          } else {
            callback(null, false); // ✅ Não permite, mas sem erro
            // OU se quiser retornar erro:
            // callback(new Error('Not allowed by CORS'), false);
          }
        },

    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],

    allowedHeaders: [
      'Content-Type',
      'Accept',
      'Authorization',
      'X-Requested-With',
      'Accept-Language',
      'Accept-Encoding',
      'remember-me',
      'Cache-Control',
    ],

    credentials: true,
    optionsSuccessStatus: 200,
    maxAge: 86400,
  });
}
