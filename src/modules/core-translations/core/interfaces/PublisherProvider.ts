import { PublishAllProps } from '../types/PublishAllProps';
import { PublishNamespaceProps } from '../types/PublishNamespaceProps';

export abstract class PublisherProvider {
  //!publicação de namespaces
  abstract publishNamespace(props: PublishNamespaceProps): Promise<string>;
  abstract publishAll(props: PublishAllProps): Promise<string>;
}
