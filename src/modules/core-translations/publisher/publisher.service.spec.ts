import { PublisherService } from './publisher.service';

describe('PublisherService', () => {
  const providerMock = {
    publishNamespace: jest.fn(),
    publishAll: jest.fn(),
  };

  let service: PublisherService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PublisherService(providerMock as any);
  });

  it('publishes namespace mapping dto to provider props', async () => {
    providerMock.publishNamespace.mockResolvedValue('ok');

    const result = await service.publishNamespace({
      system: 'app',
      language: 'pt-BR',
      namespace: 'common',
      from: 'dev',
      to: 'prod',
    });

    expect(result).toBe('ok');
    expect(providerMock.publishNamespace).toHaveBeenCalledWith({
      system: 'app',
      language: 'pt-BR',
      namespace: 'common',
      from: 'dev',
      to: 'prod',
    });
  });

  it('publishes all mapping dto to provider props', async () => {
    providerMock.publishAll.mockResolvedValue('ok-all');

    const result = await service.publishAll({
      system: 'app',
      from: 'dev',
      to: 'prod',
    });

    expect(result).toBe('ok-all');
    expect(providerMock.publishAll).toHaveBeenCalledWith({
      system: 'app',
      from: 'dev',
      to: 'prod',
    });
  });
});
