import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class LoginDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(3, 64)
  @Matches(/^[^\s].*$/, { message: 'username must not start with whitespace' })
  username: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(6, 128)
  password: string;
}
