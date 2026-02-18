import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { TranslationKeyDto } from './translation-keys.dto';
export class CreateTranslationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9-_]+$/, {
    message: 'system must contain only alphanumeric characters, hyphens, and underscores',
  })
  system: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9-_]+$/, {
    message: 'namespace must contain only alphanumeric characters, hyphens, and underscores',
  })
  namespace: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9-_]+$/, {
    message: 'language must contain only alphanumeric characters, hyphens, and underscores',
  })
  language: string;

  @ApiProperty()
  @IsNotEmpty()
  keys: TranslationKeyDto[];
}
