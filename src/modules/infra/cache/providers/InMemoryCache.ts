import { Cache } from '../interface/Cache';

export class InMemoryCache implements Cache {
  private cache = new Map<string, { value: string; expiresAt: number | null }>();

  private isExpired(expiresAt: number | null): boolean {
    return expiresAt !== null && Date.now() >= expiresAt;
  }

  async get(key: string): Promise<string | undefined> {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (this.isExpired(entry.expiresAt)) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value;
  }

  async set(key: string, value: string, ttl: number): Promise<void> {
    const expiresAt = ttl > 0 ? Date.now() + ttl * 1000 : null;
    this.cache.set(key, { value, expiresAt });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async deleteByPrefix(prefix: string): Promise<void> {
    for (const key of [...this.cache.keys()]) {
      await this.get(key);
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  async getKeysByPrefix(prefix: string): Promise<string[]> {
    const keys: string[] = [];
    for (const key of [...this.cache.keys()]) {
      const value = await this.get(key);
      if (!value) continue;
      if (key.startsWith(prefix)) {
        keys.push(key);
      }
    }
    return keys;
  }

  async delKey(key: string): Promise<void> {
    this.cache.delete(key);
  }
}
