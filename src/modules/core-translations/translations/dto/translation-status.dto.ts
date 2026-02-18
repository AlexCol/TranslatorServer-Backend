import { ApiProperty } from '@nestjs/swagger';

export class TranslationStatusDto {
  @ApiProperty()
  namespace: string;

  @ApiProperty()
  language: string;

  @ApiProperty()
  total: number;

  @ApiProperty()
  translated: number;

  @ApiProperty()
  missing: number;

  @ApiProperty()
  percentage: number;
}
