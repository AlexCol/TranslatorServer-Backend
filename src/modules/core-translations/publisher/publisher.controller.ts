import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { PublishAllDto } from './dto/publish-all.dto';
import { PublishNamespaceDto } from './dto/publish-namespace.dto';
import { PublisherService } from './publisher.service';
import { StringResponseDto } from '@/common/dto/MessageResponseDto';
import { ApiDoc } from '@/decorators/api-doc/api-doc';

@Controller('publisher')
export class PublisherController {
  constructor(private readonly publisherService: PublisherService) {}

  @ApiDoc({
    summary: 'Publish a namespace',
    description: 'Publishes a namespace to the translation service.',
    body: PublishNamespaceDto,
    response: StringResponseDto,
  })
  @HttpCode(200)
  @Post('publish-namespace')
  async publishNamespace(@Body() body: PublishNamespaceDto): Promise<StringResponseDto> {
    const data = await this.publisherService.publishNamespace(body);
    return { data };
  }

  @ApiDoc({
    summary: 'Publish all namespaces',
    description: 'Publishes all namespaces to the translation service.',
    body: PublishAllDto,
    response: StringResponseDto,
  })
  @HttpCode(200)
  @Post('publish-all')
  async publishAll(@Body() body: PublishAllDto): Promise<StringResponseDto> {
    const data = await this.publisherService.publishAll(body);
    return { data };
  }
}
