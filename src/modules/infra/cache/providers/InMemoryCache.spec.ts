import { InMemoryCache } from './InMemoryCache';

it('stores and retrieves value when not expired', async () => {
  const cache = new InMemoryCache();

  await cache.set('user:1', 'Alexandre', 60);

  const value = await cache.get('user:1');
  expect(value).toBe('Alexandre');
});

it('returns undefined and removes key after expiration', async () => {
  const cache = new InMemoryCache();
  let now = 1_000;
  const dateNowSpy = jest.spyOn(Date, 'now').mockImplementation(() => now);

  try {
    await cache.set('session:1', 'token', 2);

    now = 4_000;
    const value = await cache.get('session:1');
    expect(value).toBeUndefined();

    const keys = await cache.getKeysByPrefix('session:');
    expect(keys).toEqual([]);
  } finally {
    dateNowSpy.mockRestore();
  }
});

it('keeps values with ttl <= 0 without expiration', async () => {
  const cache = new InMemoryCache();
  let now = 10_000;
  const dateNowSpy = jest.spyOn(Date, 'now').mockImplementation(() => now);

  try {
    await cache.set('config:locale', 'pt-BR', 0);

    now = 10_000_000;
    const value = await cache.get('config:locale');
    expect(value).toBe('pt-BR');
  } finally {
    dateNowSpy.mockRestore();
  }
});

it('deletes keys by prefix and ignores others', async () => {
  const cache = new InMemoryCache();

  await cache.set('translation:pt:hello', 'ola', 100);
  await cache.set('translation:pt:bye', 'tchau', 100);
  await cache.set('translation:en:hello', 'hello', 100);
  await cache.set('other:keep', 'value', 100);

  await cache.deleteByPrefix('translation:pt:');

  expect(await cache.get('translation:pt:hello')).toBeUndefined();
  expect(await cache.get('translation:pt:bye')).toBeUndefined();
  expect(await cache.get('translation:en:hello')).toBe('hello');
  expect(await cache.get('other:keep')).toBe('value');
});

it('returns keys by prefix only for non-expired entries', async () => {
  const cache = new InMemoryCache();
  let now = 100;
  const dateNowSpy = jest.spyOn(Date, 'now').mockImplementation(() => now);

  try {
    await cache.set('namespace:one', '1', 1);
    await cache.set('namespace:two', '2', 10);
    await cache.set('other:one', '3', 10);

    now = 1_500;
    const keys = await cache.getKeysByPrefix('namespace:');
    expect(keys).toEqual(['namespace:two']);
  } finally {
    dateNowSpy.mockRestore();
  }
});

it('supports delete, delKey and clear', async () => {
  const cache = new InMemoryCache();

  await cache.set('k1', 'v1', 50);
  await cache.set('k2', 'v2', 50);
  await cache.set('k3', 'v3', 50);

  await cache.delete('k1');
  await cache.delKey('k2');
  expect(await cache.get('k1')).toBeUndefined();
  expect(await cache.get('k2')).toBeUndefined();
  expect(await cache.get('k3')).toBe('v3');

  await cache.clear();
  expect(await cache.get('k3')).toBeUndefined();
});
