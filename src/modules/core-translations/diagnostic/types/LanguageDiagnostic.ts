import { ApiProperty } from '@nestjs/swagger';
import { NamespaceDiagnostic } from './NamespaceDiagnostic';

export class LanguageDiagnostic {
  @ApiProperty()
  language: string;

  @ApiProperty()
  isBase: boolean;

  @ApiProperty()
  totalTerms: number;

  @ApiProperty()
  translatedTerms: number;

  @ApiProperty()
  missingTerms: number;

  @ApiProperty()
  translatedPercentage: number;

  @ApiProperty({ type: () => NamespaceDiagnostic, isArray: true })
  namespaces: NamespaceDiagnostic[];
}
