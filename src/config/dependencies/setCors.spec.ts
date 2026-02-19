import envConfig from 'src/env.config';
import setCors from './setCors';

describe('setCors', () => {
  const originalIsProd = envConfig.node.isProd;
  const originalOrigins = envConfig.cors.allowedOrigins;

  afterEach(() => {
    envConfig.node.isProd = originalIsProd;
    envConfig.cors.allowedOrigins = originalOrigins;
  });

  it('enables production cors with normalized allow list', () => {
    envConfig.node.isProd = true;
    envConfig.cors.allowedOrigins = 'https://a.com/, https://b.com';
    const app = { enableCors: jest.fn() } as any;

    setCors(app);
    const options = app.enableCors.mock.calls[0][0];

    const callback = jest.fn();
    options.origin('https://a.com', callback);
    expect(callback).toHaveBeenCalledWith(null, true);

    callback.mockClear();
    options.origin('https://x.com', callback);
    expect(callback).toHaveBeenCalledWith(null, false);
  });

  it('enables development cors for localhost and local networks', () => {
    envConfig.node.isProd = false;
    const app = { enableCors: jest.fn() } as any;

    setCors(app);
    const options = app.enableCors.mock.calls[0][0];
    const callback = jest.fn();

    options.origin('http://localhost:3000', callback);
    expect(callback).toHaveBeenCalledWith(null, true);

    callback.mockClear();
    options.origin('http://192.168.1.10:3001', callback);
    expect(callback).toHaveBeenCalledWith(null, true);

    callback.mockClear();
    options.origin('https://forbidden.com', callback);
    expect(callback).toHaveBeenCalledWith(null, false);
  });
});
