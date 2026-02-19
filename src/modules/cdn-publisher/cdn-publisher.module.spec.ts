import 'reflect-metadata';

import { CdnPublisherModule } from './cdn-publisher.module';
import { CdnPublisher } from './interfaces/CdnPublisher';
import { buildCdnPublisher } from './providers';

jest.mock('./providers', () => ({
  buildCdnPublisher: jest.fn(() => ({ upload: jest.fn() })),
}));

describe('CdnPublisherModule', () => {
  it('registers CdnPublisher provider factory', () => {
    const providers = Reflect.getMetadata('providers', CdnPublisherModule) as any[];
    const cdnProvider = providers.find((provider) => provider.provide === CdnPublisher);

    const instance = cdnProvider.useFactory();

    expect(buildCdnPublisher).toHaveBeenCalledTimes(1);
    expect(instance).toEqual({ upload: expect.any(Function) });
  });
});

