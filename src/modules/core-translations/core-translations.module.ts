import { Module } from '@nestjs/common';
import { buildTranslarionProvider } from './core';
import { DiagnosticController } from './diagnostic/diagnostic.controller';
import { DiagnosticService } from './diagnostic/diagnostic.service';
import { EnvironmentController } from './environment/environment.controller';
import { EnvironmentService } from './environment/environment.service';
import { LanguageController } from './language/language.controller';
import { LanguageService } from './language/language.service';
import { NamespaceController } from './namespace/namespace.controller';
import { NamespaceService } from './namespace/namespace.service';
import { PublisherController } from './publisher/publisher.controller';
import { PublisherService } from './publisher/publisher.service';
import { SystemController } from './system/system.controller';
import { SystemService } from './system/system.service';
import { TranslationsController } from './translations/translations.controller';
import { TranslationsService } from './translations/translations.service';
import { TranslationsCacheService } from './translations-cache.service';

const controllers = [
  SystemController,
  EnvironmentController,
  LanguageController,
  NamespaceController,
  DiagnosticController,
  TranslationsController,
  PublisherController,
];

const services = [
  SystemService,
  EnvironmentService,
  LanguageService,
  NamespaceService,
  DiagnosticService,
  TranslationsService,
  PublisherService,
];

const exportableServices = [TranslationsCacheService];

const jsonProviders = [...buildTranslarionProvider()];

@Module({
  imports: [],
  controllers: [...controllers],
  providers: [...services, ...jsonProviders, ...exportableServices],
  exports: [...exportableServices],
})
export class CoreTranslationsModule {}
