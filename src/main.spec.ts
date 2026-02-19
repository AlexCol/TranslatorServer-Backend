const createMock = jest.fn<any, any[]>();
const configureMock = jest.fn<any, any[]>();
const loggerLogMock = jest.fn<any, any[]>();
const fastifyAdapterCtorMock = jest.fn<any, any[]>();

jest.mock('@nestjs/common', () => {
  const actual = jest.requireActual('@nestjs/common');
  return {
    ...actual,
    Logger: jest.fn().mockImplementation(() => ({
      log: (...args: any[]) => loggerLogMock(...args),
    })),
  };
});

jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: (...args: any[]) => createMock(...args),
  },
}));

jest.mock('@nestjs/platform-fastify', () => ({
  FastifyAdapter: function () {
    fastifyAdapterCtorMock();
  },
}));

jest.mock('./config/appConfig', () => ({
  AppConfig: {
    configure: (...args: any[]) => configureMock(...args),
  },
}));

describe('main bootstrap', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('bootstraps app and starts listening', async () => {
    const listenMock = jest.fn().mockImplementation(async (_port: any, _host: string, cb: any) => {
      cb(null, 'http://localhost:3000');
    });
    createMock.mockResolvedValue({ listen: listenMock });

    await jest.isolateModulesAsync(async () => {
      await import('./main');
    });

    expect(fastifyAdapterCtorMock).toHaveBeenCalled();
    expect(createMock).toHaveBeenCalled();
    expect(configureMock).toHaveBeenCalled();
    expect(listenMock).toHaveBeenCalled();
    expect(loggerLogMock).toHaveBeenCalled();
  });
});
