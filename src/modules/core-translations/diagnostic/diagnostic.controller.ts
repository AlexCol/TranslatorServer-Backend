import { Controller, Get } from '@nestjs/common';
import { DiagnosticService } from './diagnostic.service';
import { DiagnosticOverview } from './types/DiagnosticOverview';
import { ApiDoc } from '@/decorators/api-doc/api-doc';

@Controller('diagnostic')
export class DiagnosticController {
  constructor(private readonly diagnosticService: DiagnosticService) {}

  @ApiDoc({
    summary: 'Get translation diagnostic overview',
    description:
      'Returns a hierarchical overview of translation status by system, environment, language, and namespace with total terms and translated percentage at each level.',
    response: DiagnosticOverview,
  })
  @Get('overview')
  async getOverview(): Promise<DiagnosticOverview> {
    return await this.diagnosticService.getOverview();
  }
}
