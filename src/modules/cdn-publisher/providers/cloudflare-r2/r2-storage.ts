import { DeleteObjectsCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { CdnPublisher } from '../../interfaces/CdnPublisher';

export class R2Storage implements CdnPublisher {
  private readonly s3: S3Client;

  constructor(
    accountId: string,
    accessKeyId: string,
    secretAccessKey: string,
    private readonly bucket: string,
    private readonly translationsPath: string,
    endpoint?: string,
  ) {
    const resolvedEndpoint = endpoint || `https://${accountId}.r2.cloudflarestorage.com`;

    this.s3 = new S3Client({
      region: 'auto',
      endpoint: resolvedEndpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async clearFiles(system: string, environment: string): Promise<void> {
    const prefix = this.buildBasePrefix(system, environment);
    let continuationToken: string | undefined;

    do {
      const listResponse = await this.s3.send(
        new ListObjectsV2Command({
          Bucket: this.bucket,
          Prefix: prefix,
          ContinuationToken: continuationToken,
        }),
      );

      const keys = (listResponse.Contents || []).map((obj) => obj.Key).filter((key): key is string => !!key);

      if (keys.length > 0) {
        await this.s3.send(
          new DeleteObjectsCommand({
            Bucket: this.bucket,
            Delete: {
              Objects: keys.map((key) => ({ Key: key })),
            },
          }),
        );
      }

      continuationToken = listResponse.IsTruncated ? listResponse.NextContinuationToken : undefined;
    } while (continuationToken);
  }

  async uploadToCdn(
    system: string,
    environment: string,
    language: string,
    namespace: string,
    translations: Record<string, any>,
  ): Promise<void> {
    const key = `${this.buildBasePrefix(system, environment)}${language}/${namespace}.json`;
    const body = JSON.stringify(translations, null, 2);

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: 'application/json; charset=utf-8',
      }),
    );
  }

  private buildBasePrefix(system: string, environment: string): string {
    const base = `${this.translationsPath}/${system}/${environment}`;
    return `${base.replace(/^\/+|\/+$/g, '')}/`;
  }
}
