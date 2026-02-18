import { Body, Controller, Delete, Get, HttpCode, Param, Post } from '@nestjs/common';
import { LanguageDto } from './dto/language.dto';
import { LanguageService } from './language.service';
import { ArrayStringResponseDto } from '@/common/dto/ArrayStringResponse.dto';
import { StringResponseDto } from '@/common/dto/MessageResponseDto';
import { ApiDoc } from '@/decorators/api-doc/api-doc';

const paramsDescription = {
  system: 'The name of the system to retrieve languages for',
  environment: 'The environment to retrieve languages for',
};

@Controller('languages')
export class LanguageController {
  constructor(private readonly languageService: LanguageService) {}

  @ApiDoc({
    summary: 'Get all languages for a system and environment',
    description: 'Returns a list of languages available for the specified system and environment.',
    params: [
      { name: 'system', description: paramsDescription.system, required: true, type: 'string' },
      { name: 'environment', description: paramsDescription.environment, required: true, type: 'string' },
    ],
    response: ArrayStringResponseDto,
  })
  @Get(':system/:environment')
  async getSystemInfo(
    @Param('system') system: string,
    @Param('environment') environment: string,
  ): Promise<ArrayStringResponseDto> {
    const data = await this.languageService.listLanguages(system, environment);
    return { data };
  }

  @ApiDoc({
    summary: 'Get the base language for a system and environment',
    description: 'Returns the base language for the specified system and environment.',
    params: [
      { name: 'system', description: paramsDescription.system, required: true, type: 'string' },
      { name: 'environment', description: paramsDescription.environment, required: true, type: 'string' },
    ],
    response: StringResponseDto,
  })
  @Get(':system/:environment/base')
  async getBaseLanguage(
    @Param('system') system: string,
    @Param('environment') environment: string,
  ): Promise<StringResponseDto> {
    const data = await this.languageService.getBaseLanguage(system, environment);
    return data ? { data } : { data: '' };
  }

  @ApiDoc({
    summary: 'Create a new language',
    description: 'Creates a new language for the specified system and environment.',
    body: LanguageDto,
    response: { status: 201 },
  })
  @Post()
  async createLanguage(@Body() body: LanguageDto) {
    const { system, code } = body;
    return await this.languageService.createLanguage(system, code);
  }

  @ApiDoc({
    summary: 'Promote a language to base',
    description: 'Promotes a language to be the new base language for the specified system and environment.',
    body: LanguageDto,
    response: { status: 200 },
  })
  @HttpCode(200)
  @Post('promote')
  async promoteToBaseLanguage(@Body() body: LanguageDto) {
    const { system, code } = body;
    return await this.languageService.promoteToBaseLanguage(system, code);
  }

  @ApiDoc({
    summary: 'Demote the current base language',
    description: 'Demotes the current base language, allowing another language to be promoted as the new base.',
    body: LanguageDto,
    response: { status: 200 },
  })
  @HttpCode(200)
  @Post('demote')
  async demoteBaseLanguage(@Body() body: LanguageDto) {
    const { system, code } = body;
    return await this.languageService.demoteBaseLanguage(system, code);
  }

  @ApiDoc({
    summary: 'Delete a language',
    description: 'Deletes the specified language from the system.',
    body: LanguageDto,
    response: { status: 200 },
  })
  @HttpCode(200)
  @Delete()
  async deleteLanguage(@Body() body: LanguageDto) {
    const { system, code } = body;
    return await this.languageService.deleteLanguage(system, code);
  }
}
