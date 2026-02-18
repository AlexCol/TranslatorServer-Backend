import { ApiProperty } from '@nestjs/swagger';

export class SessionPayload {
  @ApiProperty()
  id: number;

  @ApiProperty()
  login: string;

  @ApiProperty()
  firstname: string;

  @ApiProperty()
  lastname: string;
}
