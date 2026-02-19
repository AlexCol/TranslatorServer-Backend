import { CdnPublisherController } from './cdn-publisher.controller';

describe('CdnPublisherController', () => {
  const serviceMock = {
    pushToCdn: jest.fn(),
  };

  let controller: CdnPublisherController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new CdnPublisherController(serviceMock as any);
  });

  it('delegates push and wraps response payload', async () => {
    serviceMock.pushToCdn.mockResolvedValue('ok');

    const result = await controller.pushToCdn({ system: 'app', environment: 'dev' });

    expect(serviceMock.pushToCdn).toHaveBeenCalledWith('app', 'dev');
    expect(result).toEqual({ data: 'ok' });
  });
});
