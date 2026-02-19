const sendMock = jest.fn();
const s3CtorMock = jest.fn().mockImplementation(() => ({ send: sendMock }));

class S3ClientMock {
  send = sendMock;
  constructor(config: any) {
    s3CtorMock(config);
  }
}

class ListObjectsV2CommandMock {
  input: any;
  constructor(input: any) {
    this.input = input;
  }
}

class DeleteObjectsCommandMock {
  input: any;
  constructor(input: any) {
    this.input = input;
  }
}

class PutObjectCommandMock {
  input: any;
  constructor(input: any) {
    this.input = input;
  }
}

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: S3ClientMock,
  ListObjectsV2Command: ListObjectsV2CommandMock,
  DeleteObjectsCommand: DeleteObjectsCommandMock,
  PutObjectCommand: PutObjectCommandMock,
}));

import { R2Storage } from './r2-storage';

describe('R2Storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('constructs S3 client with computed endpoint', () => {
    const storage = new R2Storage('acc', 'ak', 'sk', 'bucket', 'translations');
    expect(storage).toBeDefined();
    expect(s3CtorMock).toHaveBeenCalledWith(
      expect.objectContaining({
        endpoint: 'https://acc.r2.cloudflarestorage.com',
      }),
    );
  });

  it('clears files by listing and deleting keys (single page)', async () => {
    sendMock.mockResolvedValueOnce({
      Contents: [{ Key: 'translations/app/dev/en/common.json' }],
      IsTruncated: false,
    });
    sendMock.mockResolvedValueOnce({});
    const storage = new R2Storage('acc', 'ak', 'sk', 'bucket', 'translations');

    await storage.clearFiles('app', 'dev');

    expect(sendMock).toHaveBeenCalledTimes(2);
    const firstCommand = sendMock.mock.calls[0][0] as any;
    expect(firstCommand.input).toEqual(
      expect.objectContaining({
        Bucket: 'bucket',
        Prefix: 'translations/app/dev/',
      }),
    );
    const secondCommand = sendMock.mock.calls[1][0] as any;
    expect(secondCommand.input).toEqual(
      expect.objectContaining({
        Bucket: 'bucket',
        Delete: { Objects: [{ Key: 'translations/app/dev/en/common.json' }] },
      }),
    );
  });

  it('uploads json content with expected object key', async () => {
    sendMock.mockResolvedValue({});
    const storage = new R2Storage('acc', 'ak', 'sk', 'bucket', 'translations');

    await storage.uploadToCdn('app', 'dev', 'pt-BR', 'common', { hello: 'ola' });

    const command = sendMock.mock.calls[0][0] as any;
    expect(command.input).toEqual(
      expect.objectContaining({
        Bucket: 'bucket',
        Key: 'translations/app/dev/pt-BR/common.json',
        ContentType: 'application/json; charset=utf-8',
      }),
    );
  });
});
