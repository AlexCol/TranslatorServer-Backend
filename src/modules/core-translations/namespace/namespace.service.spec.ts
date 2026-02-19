import { validateLanguage } from '../common/validateLanguage';
import { NamespaceService } from './namespace.service';

jest.mock('../common/validateLanguage', () => ({
  validateLanguage: jest.fn(),
}));

describe('NamespaceService', () => {
  const providerMock = {
    listNamespaces: jest.fn(),
    createNamespace: jest.fn(),
    deleteNamespace: jest.fn(),
  };

  let service: NamespaceService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new NamespaceService(providerMock as any);
  });

  it('validates language before listing namespaces', async () => {
    providerMock.listNamespaces.mockResolvedValue(['common', 'errors']);

    const result = await service.listNamespaces('app', 'dev', 'pt-BR');

    expect(validateLanguage).toHaveBeenCalledWith('pt-BR');
    expect(providerMock.listNamespaces).toHaveBeenCalledWith('app', 'dev', 'pt-BR');
    expect(result).toEqual(['common', 'errors']);
  });

  it('delegates namespace create/delete', async () => {
    await service.createNamespace('app', 'common');
    await service.deleteNamespace('app', 'common');

    expect(providerMock.createNamespace).toHaveBeenCalledWith('app', 'common');
    expect(providerMock.deleteNamespace).toHaveBeenCalledWith('app', 'common');
  });
});
