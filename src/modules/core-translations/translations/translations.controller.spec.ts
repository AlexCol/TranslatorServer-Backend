import { TranslationsController } from './translations.controller';

describe('TranslationsController', () => {
  const serviceMock = {
    loadWithFallBack: jest.fn(),
    loadWithoutFallBack: jest.fn(),
    getTranslationStatus: jest.fn(),
    createKey: jest.fn(),
    createTranslation: jest.fn(),
    updateKey: jest.fn(),
    deleteKey: jest.fn(),
  };

  let controller: TranslationsController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new TranslationsController(serviceMock as any);
  });

  it('delegates load endpoints', async () => {
    serviceMock.loadWithFallBack.mockResolvedValue({ hello: 'ola' });
    serviceMock.loadWithoutFallBack.mockResolvedValue({ hello: null });

    await expect(controller.loadWithFallBack('app', 'dev', 'pt-BR', 'common')).resolves.toEqual({ hello: 'ola' });
    await expect(controller.loadWithoutFallBack('app', 'dev', 'pt-BR', 'common')).resolves.toEqual({ hello: null });

    expect(serviceMock.loadWithFallBack).toHaveBeenCalledWith({
      system: 'app',
      environment: 'dev',
      language: 'pt-BR',
      namespace: 'common',
    });
    expect(serviceMock.loadWithoutFallBack).toHaveBeenCalledWith({
      system: 'app',
      environment: 'dev',
      language: 'pt-BR',
      namespace: 'common',
    });
  });

  it('delegates status and key/translation mutations', async () => {
    const status = { namespace: 'common', language: 'pt-BR', total: 10, translated: 8, missing: 2, percentage: 80 };
    serviceMock.getTranslationStatus.mockResolvedValue(status);

    await expect(controller.getTranslationStatus('app', 'dev', 'pt-BR', 'common')).resolves.toEqual(status);

    await controller.createNewKey({ system: 'app', namespace: 'common', keys: ['hello'] } as any);
    await controller.createTranslation({
      system: 'app',
      language: 'pt-BR',
      namespace: 'common',
      keys: [{ key: 'hello', value: 'ola' }],
    } as any);
    await controller.updateTranslation({
      system: 'app',
      language: 'pt-BR',
      namespace: 'common',
      keys: [{ key: 'hello', value: 'ola!' }],
    } as any);
    await controller.deleteKey({ system: 'app', namespace: 'common', keys: ['hello'] } as any);

    expect(serviceMock.createKey).toHaveBeenCalledWith('app', 'common', [{ key: 'hello', value: 'hello' }]);
    expect(serviceMock.createTranslation).toHaveBeenCalled();
    expect(serviceMock.updateKey).toHaveBeenCalled();
    expect(serviceMock.deleteKey).toHaveBeenCalledWith('app', 'common', ['hello']);
  });
});
