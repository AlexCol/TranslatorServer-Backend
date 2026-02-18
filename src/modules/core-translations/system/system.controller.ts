import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import { SystemDto } from './dto/system.dto';
import { SystemService } from './system.service';
import { ArrayStringResponseDto } from '@/common/dto/ArrayStringResponse.dto';
import { ApiDoc } from '@/decorators/api-doc/api-doc';

@Controller('system')
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @ApiDoc({
    summary: 'Get System Information',
    description: 'Returns a list of all systems with their details.',
    response: ArrayStringResponseDto,
  })
  @Get()
  async getSystemInfo(): Promise<ArrayStringResponseDto> {
    const response = await this.systemService.listSystems();
    return { data: response };
  }

  @ApiDoc({
    summary: 'Create a New System',
    description: 'Creates a new system with the provided name.',
    body: SystemDto,
    response: { status: 201 },
  })
  @Post()
  async createSystem(@Body() systemDto: SystemDto) {
    return await this.systemService.createSystem(systemDto.system);
  }

  @ApiDoc({
    summary: 'Delete a System',
    description: 'Deletes a system with the provided name.',
    body: SystemDto,
  })
  @Delete()
  async deleteSystem(@Body() systemDto: SystemDto) {
    return await this.systemService.deleteSystem(systemDto.system);
  }
}
