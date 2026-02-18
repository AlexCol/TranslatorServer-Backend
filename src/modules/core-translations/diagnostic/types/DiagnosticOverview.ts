import { ApiProperty } from '@nestjs/swagger';
import { SystemDiagnostic } from './SystemDiagnostic';

export class DiagnosticOverviewTotals {
  @ApiProperty()
  systems: number;

  @ApiProperty()
  environments: number;

  @ApiProperty()
  languages: number;

  @ApiProperty()
  namespaces: number;

  @ApiProperty()
  totalTerms: number;

  @ApiProperty()
  translatedTerms: number;

  @ApiProperty()
  missingTerms: number;

  @ApiProperty()
  translatedPercentage: number;
}

export class DiagnosticOverview {
  @ApiProperty({ type: () => DiagnosticOverviewTotals })
  totals: DiagnosticOverviewTotals;

  @ApiProperty({ type: () => SystemDiagnostic, isArray: true })
  systems: SystemDiagnostic[];
}
