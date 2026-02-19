import { TranslationsCacheService } from '../translations-cache.service';
import { EnvironmentService } from './environment.service';

describe('EnvironmentService', () => {
  const cacheMock = {
    deleteByPrefix: jest.fn(),
  } as unknown as jest.Mocked<TranslationsCacheService>;

  const providerMock = {
    listEnvironments: jest.fn(),
    createEnvironment: jest.fn(),
    deleteEnvironment: jest.fn(),
  };

  let service: EnvironmentService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new EnvironmentService(cacheMock, providerMock as any);
  });

  it('lists environments from provider', async () => {
    providerMock.listEnvironments.mockResolvedValue(['dev', 'prod']);

    const result = await service.listEnvironments('app');

    expect(result).toEqual(['dev', 'prod']);
    expect(providerMock.listEnvironments).toHaveBeenCalledWith('app');
  });

  it('invalidates cache when creating and deleting environment', async () => {
    await service.createEnvironment('app', 'dev');
    await service.deleteEnvironment('app', 'dev');

    expect(providerMock.createEnvironment).toHaveBeenCalledWith('app', 'dev');
    expect(providerMock.deleteEnvironment).toHaveBeenCalledWith('app', 'dev');
    expect(cacheMock.deleteByPrefix).toHaveBeenNthCalledWith(1, 'app:dev:');
    expect(cacheMock.deleteByPrefix).toHaveBeenNthCalledWith(2, 'app:dev:');
  });
});
