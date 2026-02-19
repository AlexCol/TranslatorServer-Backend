import envConfig from '@/env.config';
import { buildCdnPublisher } from './index';

const bunnyCtorMock = jest.fn().mockImplementation(() => ({ type: 'bunny' }));
const fileSystemCtorMock = jest.fn().mockImplementation(() => ({ type: 'filesystem' }));
const r2CtorMock = jest.fn().mockImplementation(() => ({ type: 'r2' }));

jest.mock('./bunny/bunny-storage', () => ({
  BunnyStorage: function (...args: any[]) {
    return bunnyCtorMock(...args);
  },
}));
jest.mock('./file-system/file-system-storage', () => ({
  FileSystemStorage: function (...args: any[]) {
    return fileSystemCtorMock(...args);
  },
}));
jest.mock('./cloudflare-r2/r2-storage', () => ({
  R2Storage: function (...args: any[]) {
    return r2CtorMock(...args);
  },
}));

describe('buildCdnPublisher', () => {
  const originalProvider = envConfig.cdn.provider;

  afterEach(() => {
    envConfig.cdn.provider = originalProvider;
    jest.clearAllMocks();
  });

  it('builds bunny provider', () => {
    envConfig.cdn.provider = 'bunny';
    const provider = buildCdnPublisher();
    expect(provider).toEqual({ type: 'bunny' });
    expect(bunnyCtorMock).toHaveBeenCalled();
  });

  it('builds filesystem provider', () => {
    envConfig.cdn.provider = 'filesystem';
    const provider = buildCdnPublisher();
    expect(provider).toEqual({ type: 'filesystem' });
    expect(fileSystemCtorMock).toHaveBeenCalledWith(envConfig.cdn.filesystem.basePath);
  });

  it('builds r2 provider for r2 and cloudflare-r2 names', () => {
    envConfig.cdn.provider = 'r2';
    expect(buildCdnPublisher()).toEqual({ type: 'r2' });

    envConfig.cdn.provider = 'cloudflare-r2';
    expect(buildCdnPublisher()).toEqual({ type: 'r2' });

    expect(r2CtorMock).toHaveBeenCalled();
  });

  it('throws for unsupported provider', () => {
    envConfig.cdn.provider = 'unknown';
    expect(() => buildCdnPublisher()).toThrow('Unsupported CDN provider: unknown');
  });
});
