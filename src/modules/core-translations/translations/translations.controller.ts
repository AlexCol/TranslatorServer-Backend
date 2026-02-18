import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { CreateKeyDto } from './dto/create-key.dto';
import { CreateTranslationDto } from './dto/create-tranlantion-key.dto';
import { TranslationStatusDto } from './dto/translation-status.dto';
import { TranslationsService } from './translations.service';
import { ApiDoc } from '@/decorators/api-doc/api-doc';

const paramsDescription = {
  system: 'The name of the system to retrieve languages for',
  environment: 'The environment to retrieve languages for',
  language: 'The language to retrieve translations for',
  namespace: 'The namespace to retrieve translations for',
};

@Controller('translations')
export class TranslationsController {
  constructor(private readonly systemService: TranslationsService) {}

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  @ApiDoc({
    summary: 'Get translations with fallback',
    description:
      'Returns translations for the specified system, environment, language, and namespace, with fallback to base language if translation is missing.',
    params: [
      { name: 'system', description: paramsDescription.system, required: true, type: 'string' },
      { name: 'environment', description: paramsDescription.environment, required: true, type: 'string' },
      { name: 'language', description: paramsDescription.language, required: true, type: 'string' },
      { name: 'namespace', description: paramsDescription.namespace, required: true, type: 'string' },
    ],
    response: {
      schema: {
        type: 'object',
        additionalProperties: { type: 'string' },
        example: { key1: 'Translation for key1', key2: 'Translation for key2' },
      },
    },
  })
  @Get(':system/:environment/:language/:namespace')
  async loadWithFallBack(
    @Param('system') system: string,
    @Param('environment') environment: string,
    @Param('language') language: string,
    @Param('namespace') namespace: string,
  ) {
    return await this.systemService.loadWithFallBack({ system: system, environment, language, namespace });
  }

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  @ApiDoc({
    summary: 'Get translations without fallback',
    description:
      'Returns translations for the specified system, environment, language, and namespace without fallback. Only returns translations that exist for the specified language.',
    params: [
      { name: 'system', description: paramsDescription.system, required: true, type: 'string' },
      { name: 'environment', description: paramsDescription.environment, required: true, type: 'string' },
      { name: 'language', description: paramsDescription.language, required: true, type: 'string' },
      { name: 'namespace', description: paramsDescription.namespace, required: true, type: 'string' },
    ],
    response: {
      schema: {
        type: 'object',
        additionalProperties: { type: 'string', nullable: true },
        example: { key1: 'Translation for key1', key2: null },
      },
    },
  })
  @Get(':system/:environment/:language/:namespace/clean')
  async loadWithoutFallBack(
    @Param('system') system: string,
    @Param('environment') environment: string,
    @Param('language') language: string,
    @Param('namespace') namespace: string,
  ) {
    return await this.systemService.loadWithoutFallBack({ system: system, environment, language, namespace });
  }

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  @ApiDoc({
    summary: 'Get translation status',
    description:
      'Returns the translation status for the specified system, environment, language, and namespace, including missing keys and untranslated keys.',
    params: [
      { name: 'system', description: paramsDescription.system, required: true, type: 'string' },
      { name: 'environment', description: paramsDescription.environment, required: true, type: 'string' },
      { name: 'language', description: paramsDescription.language, required: true, type: 'string' },
      { name: 'namespace', description: paramsDescription.namespace, required: true, type: 'string' },
    ],
    response: TranslationStatusDto,
  })
  @Get(':system/:environment/:language/:namespace/status')
  async getTranslationStatus(
    @Param('system') system: string,
    @Param('environment') environment: string,
    @Param('language') language: string,
    @Param('namespace') namespace: string,
  ): Promise<TranslationStatusDto> {
    return await this.systemService.getTranslationStatus({ system: system, environment, language, namespace });
  }

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  @ApiDoc({
    summary: 'Create a new translation key',
    description: 'Creates a new key for the specified system and namespace on dev environment.',
    body: CreateKeyDto,
    successStatus: 201,
  })
  @Post('key')
  async createNewKey(@Body() body: CreateKeyDto) {
    const keys = body.keys.map((key) => ({ key, value: key }));
    return await this.systemService.createKey(body.system, body.namespace, keys);
  }

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  @ApiDoc({
    summary: 'Create or update a translation',
    description:
      'Creates or updates a translation for the specified system, language, namespace, and key. If the key does not exist, it will be created. If the key already exists, its translation will be updated.',
    body: CreateTranslationDto,
    successStatus: 201,
  })
  @Post('translation')
  async createTranslation(@Body() body: CreateTranslationDto) {
    return await this.systemService.createTranslation(body.system, body.language, body.namespace, body.keys);
  }

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  @ApiDoc({
    summary: 'Update an existing translation',
    description:
      'Updates the translation for the specified system, language, namespace, and key. The key must already exist for the specified system and namespace.',
    body: CreateTranslationDto,
    successStatus: 200,
  })
  @HttpCode(200)
  @Patch('translation')
  async updateTranslation(@Body() body: CreateTranslationDto) {
    return await this.systemService.updateKey(body.system, body.language, body.namespace, body.keys);
  }

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  @ApiDoc({
    summary: 'Delete a translation key',
    description:
      'Deletes the specified key and all its translations for the specified system and namespace. This action cannot be undone.',
    body: CreateKeyDto,
    successStatus: 204,
  })
  @HttpCode(204)
  @Delete('key')
  async deleteKey(@Body() body: CreateKeyDto) {
    return await this.systemService.deleteKey(body.system, body.namespace, body.keys);
  }
}
