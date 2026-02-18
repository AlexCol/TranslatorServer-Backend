import { Logger } from '@nestjs/common';
import { BunnyStorage } from './bunny/bunny-storage';
import { R2Storage } from './cloudflare-r2/r2-storage';
import { FileSystemStorage } from './file-system/file-system-storage';
import envConfig from '@/env.config';

export function buildCdnPublisher() {
  const logger = new Logger('CDNProviderFactory');

  const providerName = envConfig.cdn.provider;
  try {
    if (providerName === 'bunny') {
      const provider = new BunnyStorage(
        envConfig.cdn.bunny.key,
        envConfig.cdn.bunny.storageName,
        envConfig.cdn.bunny.translationsPath,
      );
      return provider;
    }

    if (providerName === 'filesystem') {
      const provider = new FileSystemStorage(envConfig.cdn.filesystem.basePath);
      return provider;
    }

    if (providerName === 'r2' || providerName === 'cloudflare-r2') {
      const provider = new R2Storage(
        envConfig.cdn.r2.accountId,
        envConfig.cdn.r2.accessKeyId,
        envConfig.cdn.r2.secretAccessKey,
        envConfig.cdn.r2.bucket,
        envConfig.cdn.r2.translationsPath,
        envConfig.cdn.r2.endpoint,
      );
      return provider;
    }
  } catch (error) {
    logger.error(`Error initializing CDN provider: ${error.message}`);
  }

  throw new Error(`Unsupported CDN provider: ${providerName}`);
}
