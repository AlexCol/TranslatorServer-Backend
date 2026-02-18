import { Controller, Get, Head } from '@nestjs/common';
import { StringResponseDto } from './common/dto/MessageResponseDto';
import { ApiDoc } from './decorators/api-doc/api-doc';
import { IsPublic } from './modules/auth/authentication/decorators/isPublic';

@Controller()
export class AppController {
  constructor() {}

  @ApiDoc({
    summary: 'Health Check',
    description: 'Returns a simple message to confirm that the server is running.',
    response: StringResponseDto,
  })
  @IsPublic()
  @Get()
  getHello(): StringResponseDto {
    return { data: 'Im alive!' };
  }

  @ApiDoc({
    summary: 'Stay Up Endpoint',
    description: 'An endpoint to keep the server awake. It does not perform any operations.',
  })
  @IsPublic()
  @Head('stay-up')
  stayUp() {}
}
