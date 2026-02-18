export abstract class Cache {
  abstract get(key: string): Promise<string | undefined>;
  abstract set(key: string, value: string, ttl: number): Promise<void>;
  abstract delete(key: string): Promise<void>;
  abstract deleteByPrefix(prefix: string): Promise<void>;

  abstract clear(): Promise<void>;

  abstract getKeysByPrefix(prefix: string): Promise<string[]>;
  abstract delKey(key: string): Promise<void>;
}
