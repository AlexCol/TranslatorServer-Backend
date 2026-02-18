import { SessionPayload } from '@/modules/session/dto/SessionPayload';
import 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    user: {
      payload: SessionPayload;
    };
  }
}

// lembrar de adicionar
//   "include": [
//     "src/**/*",
//     "src/**/*.d.ts"
//   ]
// no tsconfig.json para que o TypeScript reconheça este arquivo de declaração.
//! pode não ser necessário
