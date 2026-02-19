import { SystemController } from './system.controller';

describe('SystemController', () => {
  const serviceMock = {
    listSystems: jest.fn(),
    createSystem: jest.fn(),
    deleteSystem: jest.fn(),
  };

  let controller: SystemController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new SystemController(serviceMock as any);
  });

  it('returns systems in data envelope', async () => {
    serviceMock.listSystems.mockResolvedValue(['app']);
    await expect(controller.getSystemInfo()).resolves.toEqual({ data: ['app'] });
  });

  it('delegates create and delete', async () => {
    await controller.createSystem({ system: 'app' } as any);
    await controller.deleteSystem({ system: 'app' } as any);

    expect(serviceMock.createSystem).toHaveBeenCalledWith('app');
    expect(serviceMock.deleteSystem).toHaveBeenCalledWith('app');
  });
});
