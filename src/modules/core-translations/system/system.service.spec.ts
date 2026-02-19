import { TranslationsCacheService } from '../translations-cache.service';
import { SystemService } from './system.service';

describe('SystemService', () => {
  const cacheMock = {
    clear: jest.fn(),
  } as unknown as jest.Mocked<TranslationsCacheService>;

  const providerMock = {
    listSystems: jest.fn(),
    createSystem: jest.fn(),
    deleteSystem: jest.fn(),
  };

  let service: SystemService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SystemService(cacheMock, providerMock as any);
  });

  it('lists systems from provider', async () => {
    providerMock.listSystems.mockResolvedValue(['app', 'backoffice']);

    const result = await service.listSystems();

    expect(result).toEqual(['app', 'backoffice']);
    expect(providerMock.listSystems).toHaveBeenCalledTimes(1);
  });

  it('clears cache after create and delete', async () => {
    await service.createSystem('app');
    await service.deleteSystem('app');

    expect(providerMock.createSystem).toHaveBeenCalledWith('app');
    expect(providerMock.deleteSystem).toHaveBeenCalledWith('app');
    expect(cacheMock.clear).toHaveBeenCalledTimes(2);
  });
});
