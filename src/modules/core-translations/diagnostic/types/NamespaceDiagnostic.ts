import { ApiProperty } from '@nestjs/swagger';

export class NamespaceDiagnostic {
  @ApiProperty()
  namespace: string;

  @ApiProperty()
  totalTerms: number;

  @ApiProperty()
  translatedTerms: number;

  @ApiProperty()
  missingTerms: number;

  @ApiProperty()
  translatedPercentage: number;
}
