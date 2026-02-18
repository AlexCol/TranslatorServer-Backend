import { CookieSerializeOptions } from '@fastify/cookie';
import { FastifyReply } from 'fastify';
import envConfig from 'src/env.config';

export default function addSessionCookie(res: FastifyReply, sessionToken: string, rememberMe?: boolean) {
  res.cookie('sessionToken', sessionToken, getSessionCookieOptions(rememberMe));
}

export function getSessionCookieOptions(rememberMe?: boolean) {
  const isProd = envConfig.node.isProd;

  return {
    httpOnly: true,
    secure: isProd,
    // Frontend em dominio diferente (Vercel -> Render) exige SameSite=None em producao.
    sameSite: (isProd ? 'none' : 'lax') as 'none' | 'lax',
    path: '/',
    maxAge: rememberMe ? 604800 : undefined,
  } satisfies CookieSerializeOptions;
}
