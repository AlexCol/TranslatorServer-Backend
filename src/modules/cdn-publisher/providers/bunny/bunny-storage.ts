import { ReadableStream } from 'stream/web';
import * as BunnyStorageSDK from '@bunny.net/storage-sdk';
import { CdnPublisher } from '../../interfaces/CdnPublisher';

export class BunnyStorage implements CdnPublisher {
  private readonly storageZone: BunnyStorageSDK.StorageZone;
  private readonly translationsPath: string;

  constructor(key: string, storageName: string, translationsPath: string) {
    this.storageZone = BunnyStorageSDK.zone.connect_with_accesskey(
      BunnyStorageSDK.regions.StorageRegion.SaoPaulo,
      storageName,
      key,
    );
    this.translationsPath = translationsPath;
  }

  async clearFiles(system: string, environment: string): Promise<void> {
    const path = `${this.translationsPath}/${system}/${environment}`.replace(/^\/+/, '');
    await BunnyStorageSDK.file.removeDirectory(this.storageZone, path);
  }

  async uploadToCdn(
    system: string,
    environment: string,
    language: string,
    namespace: string,
    translations: Record<string, any>,
  ): Promise<void> {
    const path = `${this.translationsPath}/${system}/${environment}/${language}/${namespace}.json`.replace(/^\/+/, '');

    const jsonString = JSON.stringify(translations, null, 2);
    const encoder = new TextEncoder();
    const uint8Array = encoder.encode(jsonString);

    const stream = ReadableStream.from([uint8Array]);

    await BunnyStorageSDK.file.upload(this.storageZone, path, stream);
  }
}
