import { ApiProperty } from '@nestjs/swagger';

export class ArrayStringResponseDto {
  @ApiProperty()
  data: string[];
}
