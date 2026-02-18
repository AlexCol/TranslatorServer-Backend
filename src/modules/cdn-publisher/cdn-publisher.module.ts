import { Module } from '@nestjs/common';
import { CoreTranslationsModule } from '../core-translations/core-translations.module';
import { CdnPublisherController } from './cdn-publisher.controller';
import { CdnPublisherService } from './cdn-publisher.service';
import { CdnPublisher } from './interfaces/CdnPublisher';
import { buildCdnPublisher } from './providers';

@Module({
  imports: [CoreTranslationsModule],
  controllers: [CdnPublisherController],
  providers: [
    CdnPublisherService,
    {
      provide: CdnPublisher,
      useFactory: () => buildCdnPublisher(),
    },
  ],
})
export class CdnPublisherModule {}
