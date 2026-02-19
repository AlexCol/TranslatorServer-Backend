import { NamespaceController } from './namespace.controller';

describe('NamespaceController', () => {
  const serviceMock = {
    listNamespaces: jest.fn(),
    createNamespace: jest.fn(),
    deleteNamespace: jest.fn(),
  };

  let controller: NamespaceController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new NamespaceController(serviceMock as any);
  });

  it('delegates list namespaces', async () => {
    serviceMock.listNamespaces.mockResolvedValue(['common']);

    const result = await controller.listNamespaces('app', 'dev', 'en');

    expect(result).toEqual(['common']);
    expect(serviceMock.listNamespaces).toHaveBeenCalledWith('app', 'dev', 'en');
  });

  it('delegates create and delete namespace', async () => {
    await controller.createNamespace({ system: 'app', namespace: 'common' } as any);
    await controller.deleteNamespace({ system: 'app', namespace: 'common' } as any);

    expect(serviceMock.createNamespace).toHaveBeenCalledWith('app', 'common');
    expect(serviceMock.deleteNamespace).toHaveBeenCalledWith('app', 'common');
  });
});
