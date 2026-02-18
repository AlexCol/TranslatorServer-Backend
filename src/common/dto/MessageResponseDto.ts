import { ApiProperty } from '@nestjs/swagger';

export class StringResponseDto {
  @ApiProperty()
  data: string;
}
