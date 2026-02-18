import { Injectable } from '@nestjs/common';
import { PublishAllProps } from '../core/types/PublishAllProps';
import { PublishAllDto } from './dto/publish-all.dto';
import { PublishNamespaceDto } from './dto/publish-namespace.dto';
import { PublisherProvider } from '@/modules/core-translations/core/interfaces/PublisherProvider';
import { PublishNamespaceProps } from '@/modules/core-translations/core/types/PublishNamespaceProps';

@Injectable()
export class PublisherService {
  constructor(private readonly provider: PublisherProvider) {}

  async publishNamespace(dto: PublishNamespaceDto): Promise<string> {
    const publishProps = {
      system: dto.system,
      language: dto.language,
      namespace: dto.namespace,
      from: dto.from,
      to: dto.to,
    } satisfies PublishNamespaceProps;

    return await this.provider.publishNamespace(publishProps);
  }

  async publishAll(dto: PublishAllDto): Promise<string> {
    const publishProps = {
      system: dto.system,
      from: dto.from,
      to: dto.to,
    } satisfies PublishAllProps;

    return await this.provider.publishAll(publishProps);
  }
}
