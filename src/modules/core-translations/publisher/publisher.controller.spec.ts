import { PublisherController } from './publisher.controller';

describe('PublisherController', () => {
  const serviceMock = {
    publishNamespace: jest.fn(),
    publishAll: jest.fn(),
  };

  let controller: PublisherController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new PublisherController(serviceMock as any);
  });

  it('publishes namespace and wraps response', async () => {
    serviceMock.publishNamespace.mockResolvedValue('ok');
    const dto = { system: 'app', language: 'pt-BR', namespace: 'common', from: 'dev', to: 'prod' } as any;

    const result = await controller.publishNamespace(dto);

    expect(serviceMock.publishNamespace).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ data: 'ok' });
  });

  it('publishes all and wraps response', async () => {
    serviceMock.publishAll.mockResolvedValue('ok-all');
    const dto = { system: 'app', from: 'dev', to: 'prod' } as any;

    const result = await controller.publishAll(dto);

    expect(serviceMock.publishAll).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ data: 'ok-all' });
  });
});
