import { ApiProperty } from '@nestjs/swagger';
import { EnvironmentDiagnostic } from './EnvironmentDiagnostic';

export class SystemDiagnostic {
  @ApiProperty()
  system: string;

  @ApiProperty()
  totalTerms: number;

  @ApiProperty()
  translatedTerms: number;

  @ApiProperty()
  missingTerms: number;

  @ApiProperty()
  translatedPercentage: number;

  @ApiProperty({ type: () => EnvironmentDiagnostic, isArray: true })
  environments: EnvironmentDiagnostic[];
}
