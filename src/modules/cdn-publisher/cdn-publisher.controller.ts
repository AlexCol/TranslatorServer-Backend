import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { CdnPublisherService } from './cdn-publisher.service';
import { CdnPublisherDto } from './dto/cdn-publisher.dto';
import { StringResponseDto } from '@/common/dto/MessageResponseDto';
import { ApiDoc } from '@/decorators/api-doc/api-doc';

@Controller('cdn-publisher')
export class CdnPublisherController {
  constructor(private readonly cdnPublisherService: CdnPublisherService) {}

  @ApiDoc({
    summary: 'Push files to CDN',
    description: 'Push files to CDN based on the specified system and environment.',
    body: CdnPublisherDto,
    response: StringResponseDto,
  })
  @HttpCode(200)
  @Post('push')
  async pushToCdn(@Body() body: CdnPublisherDto): Promise<StringResponseDto> {
    const data = await this.cdnPublisherService.pushToCdn(body.system, body.environment);
    return { data };
  }
}
