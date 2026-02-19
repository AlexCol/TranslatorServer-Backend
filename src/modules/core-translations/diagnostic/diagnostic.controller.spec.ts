import { DiagnosticController } from './diagnostic.controller';

describe('DiagnosticController', () => {
  const serviceMock = {
    getOverview: jest.fn(),
  };

  let controller: DiagnosticController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new DiagnosticController(serviceMock as any);
  });

  it('returns overview from service', async () => {
    const overview = { totals: { systems: 1 }, systems: [] };
    serviceMock.getOverview.mockResolvedValue(overview);

    await expect(controller.getOverview()).resolves.toEqual(overview);
  });
});
