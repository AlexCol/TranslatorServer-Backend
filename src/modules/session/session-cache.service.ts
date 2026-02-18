import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Cache } from '../infra/cache/interface/Cache';
import { SessionPayload } from './dto/SessionPayload';
import { SessionData } from './types/SessionData';
import { generateToken } from '@/common/util/generateToken';
import envConfig from '@/env.config';

@Injectable()
export class SessionCacheService {
  private readonly SESSION_PREFIX = 'session:';
  private readonly SESSION_TTL = envConfig.session.ttl;

  constructor(private readonly cache: Cache) {}

  /*****************************************************************************/
  /* Metodos de Busca                                                          */
  /*****************************************************************************/
  async getSession(sessionId: string): Promise<SessionData | undefined> {
    const session = await this.cache.get(this.SESSION_PREFIX + sessionId);
    if (!session) {
      return undefined;
    }

    const data = JSON.parse(session) as SessionData;

    //!fallback para caso usar sessões sem expiração (como IMemoryCache)
    if (data.expiresAt < Date.now()) {
      await this.cache.delete(this.SESSION_PREFIX + sessionId);
      return undefined;
    }

    return data;
  }

  /*****************************************************************************/
  /* Metodos de Criação                                                        */
  /*****************************************************************************/
  async setSession(session: SessionPayload): Promise<string> {
    const sessionId = generateToken();
    const now = Date.now();

    const data: SessionData = {
      payload: session,
      createdAt: now,
      expiresAt: now + this.SESSION_TTL * 1000,
    };

    const sessionString = JSON.stringify(data);
    await this.cache.set(this.SESSION_PREFIX + sessionId, sessionString, this.SESSION_TTL);
    return sessionId;
  }

  /*****************************************************************************/
  /* Metodos de Atualização                                                    */
  /*****************************************************************************/
  async updateSessionsByUserId(login: string, newPayload: SessionPayload): Promise<number> {
    const keys = await this.cache.getKeysByPrefix(this.SESSION_PREFIX);
    let updatedCount = 0;

    for (const key of keys) {
      const data = await this.cache.get(key);
      if (data) {
        const sessionData: SessionData = JSON.parse(data);
        if (sessionData.payload.login === login) {
          sessionData.payload = newPayload;
          const ttl = Math.floor((sessionData.expiresAt - Date.now()) / 1000); // mantem o tempo restante
          if (ttl <= 0) {
            await this.cache.delete(key);
            continue;
          }

          await this.cache.set(key, JSON.stringify(sessionData), ttl);
          updatedCount++;
        }
      }
    }
    return updatedCount;
  }

  async refreshSession(sessionToken: string): Promise<boolean> {
    const sessionData = await this.getSession(sessionToken);

    if (!sessionData) throw new UnauthorizedException('Sessão inválida ou expirada');

    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    const timeToExpiry = sessionData.expiresAt - now;

    if (timeToExpiry > oneDayMs)
      //! regra explicada abaixo
      return false;

    const newExpire = now + oneDayMs;
    sessionData.expiresAt = newExpire;

    await this.cache.set(`${this.SESSION_PREFIX}${sessionToken}`, JSON.stringify(sessionData), oneDayMs / 1000);
    return true;
  }

  /*****************************************************************************/
  /* Metodos de Remoção                                                       */
  /*****************************************************************************/
  async deleteSession(sessionId: string): Promise<void> {
    await this.cache.delete(this.SESSION_PREFIX + sessionId);
  }

  async clearSessions(): Promise<void> {
    await this.cache.deleteByPrefix(this.SESSION_PREFIX);
  }

  async deleteAllUserSessions(login: string): Promise<number> {
    const keys = await this.cache.getKeysByPrefix(this.SESSION_PREFIX);
    let revokedSessions = 0;
    for (const key of keys) {
      const data = await this.cache.get(key);
      if (data) {
        const sessionData: SessionData = JSON.parse(data);
        if (sessionData.payload.login === login) {
          await this.cache.delete(key);
          revokedSessions++;
        }
      }
    }
    return revokedSessions;
  }
}

/*
regra:
Por padrão as sessões expiram em 7 dias (604800 segundos).
Ao acessar uma sessão, se ela tiver menos de 1 dia (86400 segundos) para expirar,
ela é renovada para expirar em mais 1 dia a partir do momento do acesso.
Isso garante que sessões ativas permaneçam válidas, enquanto sessões inativas
expiram naturalmente após 7 dias.
*/
