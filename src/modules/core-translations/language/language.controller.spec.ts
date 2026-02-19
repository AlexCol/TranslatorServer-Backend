import { LanguageController } from './language.controller';

describe('LanguageController', () => {
  const serviceMock = {
    listLanguages: jest.fn(),
    getBaseLanguage: jest.fn(),
    createLanguage: jest.fn(),
    promoteToBaseLanguage: jest.fn(),
    demoteBaseLanguage: jest.fn(),
    deleteLanguage: jest.fn(),
  };

  let controller: LanguageController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new LanguageController(serviceMock as any);
  });

  it('returns language list and base language', async () => {
    serviceMock.listLanguages.mockResolvedValue(['en', 'pt-BR']);
    serviceMock.getBaseLanguage.mockResolvedValue('en');

    await expect(controller.getSystemInfo('app', 'dev')).resolves.toEqual({ data: ['en', 'pt-BR'] });
    await expect(controller.getBaseLanguage('app', 'dev')).resolves.toEqual({ data: 'en' });
  });

  it('returns empty string when base language is null', async () => {
    serviceMock.getBaseLanguage.mockResolvedValue(null);

    await expect(controller.getBaseLanguage('app', 'dev')).resolves.toEqual({ data: '' });
  });

  it('delegates create/promote/demote/delete', async () => {
    const body = { system: 'app', code: 'pt-BR' } as any;

    await controller.createLanguage(body);
    await controller.promoteToBaseLanguage(body);
    await controller.demoteBaseLanguage(body);
    await controller.deleteLanguage(body);

    expect(serviceMock.createLanguage).toHaveBeenCalledWith('app', 'pt-BR');
    expect(serviceMock.promoteToBaseLanguage).toHaveBeenCalledWith('app', 'pt-BR');
    expect(serviceMock.demoteBaseLanguage).toHaveBeenCalledWith('app', 'pt-BR');
    expect(serviceMock.deleteLanguage).toHaveBeenCalledWith('app', 'pt-BR');
  });
});
