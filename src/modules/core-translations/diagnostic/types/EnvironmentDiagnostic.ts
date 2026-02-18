import { ApiProperty } from '@nestjs/swagger';
import { LanguageDiagnostic } from './LanguageDiagnostic';

export class EnvironmentDiagnostic {
  @ApiProperty()
  environment: string;

  @ApiProperty({ type: String, nullable: true })
  baseLanguage: string | null;

  @ApiProperty()
  totalTerms: number;

  @ApiProperty()
  translatedTerms: number;

  @ApiProperty()
  missingTerms: number;

  @ApiProperty()
  translatedPercentage: number;

  @ApiProperty({ type: () => LanguageDiagnostic, isArray: true })
  languages: LanguageDiagnostic[];
}
