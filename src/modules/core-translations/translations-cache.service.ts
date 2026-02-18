import { Injectable } from '@nestjs/common';
import { Cache } from '../infra/cache/interface/Cache';
import envConfig from '@/env.config';

@Injectable()
export class TranslationsCacheService {
  private readonly cacheKeyPrefix = 'translations:';
  private readonly ttl = envConfig.translations.ttl;

  constructor(private readonly cache: Cache) {}

  async get(key: string): Promise<Record<string, any> | undefined> {
    const data = await this.cache.get(this.cacheKeyPrefix + key);
    if (!data) {
      return undefined;
    }

    return JSON.parse(data);
  }

  async set(key: string, value: Record<string, any>): Promise<void> {
    const valueString = JSON.stringify(value);
    await this.cache.set(this.cacheKeyPrefix + key, valueString, this.ttl);
  }

  async delete(key: string): Promise<void> {
    await this.cache.delete(this.cacheKeyPrefix + key);
  }

  async deleteByPrefix(prefix: string): Promise<void> {
    await this.cache.deleteByPrefix(this.cacheKeyPrefix + prefix);
  }

  async clear(): Promise<void> {
    await this.cache.deleteByPrefix(this.cacheKeyPrefix);
  }
}
