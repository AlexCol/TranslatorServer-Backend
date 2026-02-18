import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { EnvironmentDto } from './dto/environment.dto';
import { EnvironmentService } from './environment.service';
import { ArrayStringResponseDto } from '@/common/dto/ArrayStringResponse.dto';
import { ApiDoc } from '@/decorators/api-doc/api-doc';

@Controller('environment')
export class EnvironmentController {
  constructor(private readonly environmentService: EnvironmentService) {}

  @ApiDoc({
    summary: 'Get environment list by system',
    description: 'Get environment list by system',
    params: [{ name: 'system', required: true, description: 'The system name' }],
    response: ArrayStringResponseDto,
  })
  @Get(':system')
  async getSystemInfo(@Param('system') system: string): Promise<ArrayStringResponseDto> {
    const response = await this.environmentService.listEnvironments(system);
    return { data: response };
  }

  @ApiDoc({
    summary: 'Create environment',
    description: 'Create environment',
    body: EnvironmentDto,
    response: { status: 201 },
  })
  @Post()
  async createEnvironment(@Body() dto: EnvironmentDto) {
    return await this.environmentService.createEnvironment(dto.system, dto.environment);
  }

  @ApiDoc({
    summary: 'Delete environment',
    description: 'Delete environment',
    body: EnvironmentDto,
    response: { status: 200 },
  })
  @Delete()
  async deleteEnvironment(@Body() dto: EnvironmentDto) {
    return await this.environmentService.deleteEnvironment(dto.system, dto.environment);
  }
}
