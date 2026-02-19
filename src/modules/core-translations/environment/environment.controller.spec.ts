import { EnvironmentController } from './environment.controller';

describe('EnvironmentController', () => {
  const serviceMock = {
    listEnvironments: jest.fn(),
    createEnvironment: jest.fn(),
    deleteEnvironment: jest.fn(),
  };

  let controller: EnvironmentController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new EnvironmentController(serviceMock as any);
  });

  it('returns environments in data envelope', async () => {
    serviceMock.listEnvironments.mockResolvedValue(['dev', 'prod']);

    const result = await controller.getSystemInfo('app');

    expect(result).toEqual({ data: ['dev', 'prod'] });
  });

  it('delegates create and delete', async () => {
    await controller.createEnvironment({ system: 'app', environment: 'dev' } as any);
    await controller.deleteEnvironment({ system: 'app', environment: 'dev' } as any);

    expect(serviceMock.createEnvironment).toHaveBeenCalledWith('app', 'dev');
    expect(serviceMock.deleteEnvironment).toHaveBeenCalledWith('app', 'dev');
  });
});
