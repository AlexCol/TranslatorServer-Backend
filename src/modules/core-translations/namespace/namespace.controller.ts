import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { NamespaceDto } from './dto/namespace.dto';
import { NamespaceService } from './namespace.service';
import { ArrayStringResponseDto } from '@/common/dto/ArrayStringResponse.dto';
import { ApiDoc } from '@/decorators/api-doc/api-doc';

@Controller('namespaces')
export class NamespaceController {
  constructor(private readonly namespaceService: NamespaceService) {}

  @ApiDoc({
    summary: 'List namespaces',
    description: 'Returns a list of namespaces available for the specified system, environment, and language.',
    params: [
      { name: 'system', type: 'string', description: 'The system for which to list namespaces' },
      { name: 'environment', type: 'string', description: 'The environment for which to list namespaces' },
      { name: 'language', type: 'string', description: 'The language for which to list namespaces' },
    ],
    response: ArrayStringResponseDto,
  })
  @Get(':system/:environment/:language')
  async listNamespaces(
    @Param('system') system: string,
    @Param('environment') environment: string,
    @Param('language') language: string,
  ) {
    return this.namespaceService.listNamespaces(system, environment, language);
  }

  @ApiDoc({
    summary: 'Create namespace',
    description: 'Creates a new namespace for the specified system.',
    body: NamespaceDto,
    response: { status: 201 },
  })
  @Post()
  async createNamespace(@Body() body: NamespaceDto) {
    const { system, namespace } = body;
    await this.namespaceService.createNamespace(system, namespace);
  }

  @ApiDoc({
    summary: 'Delete namespace',
    description: 'Deletes a namespace for the specified system.',
    body: NamespaceDto,
    response: { status: 200 },
  })
  @Delete()
  async deleteNamespace(@Body() body: NamespaceDto) {
    const { system, namespace } = body;
    await this.namespaceService.deleteNamespace(system, namespace);
  }
}
