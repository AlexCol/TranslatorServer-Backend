import 'reflect-metadata';

import { DECORATORS } from '@nestjs/swagger/dist/constants';
import { DiagnosticOverview, DiagnosticOverviewTotals } from './DiagnosticOverview';
import { SystemDiagnostic } from './SystemDiagnostic';

describe('DiagnosticOverview swagger metadata', () => {
  it('maps totals as DiagnosticOverviewTotals type', () => {
    const metadata = Reflect.getMetadata(
      DECORATORS.API_MODEL_PROPERTIES,
      DiagnosticOverview.prototype,
      'totals',
    );

    expect(metadata).toBeDefined();
    expect(metadata.type()).toBe(DiagnosticOverviewTotals);
    expect(metadata.isArray).toBe(false);
  });

  it('maps systems as array of SystemDiagnostic', () => {
    const metadata = Reflect.getMetadata(
      DECORATORS.API_MODEL_PROPERTIES,
      DiagnosticOverview.prototype,
      'systems',
    );

    expect(metadata).toBeDefined();
    expect(metadata.type()).toBe(SystemDiagnostic);
    expect(metadata.isArray).toBe(true);
  });
});
