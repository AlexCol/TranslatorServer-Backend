const connectMock = jest.fn<any, any[]>().mockReturnValue('zone');
const removeDirectoryMock = jest.fn<any, any[]>();
const uploadMock = jest.fn<any, any[]>();

jest.mock('@bunny.net/storage-sdk', () => ({
  zone: {
    connect_with_accesskey: (region: string, storageName: string, key: string) =>
      connectMock(region, storageName, key),
  },
  regions: {
    StorageRegion: {
      SaoPaulo: 'saopaulo',
    },
  },
  file: {
    removeDirectory: (zone: any, path: string) => removeDirectoryMock(zone, path),
    upload: (zone: any, path: string, stream: any) => uploadMock(zone, path, stream),
  },
}));

import { BunnyStorage } from './bunny-storage';

describe('BunnyStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('connects storage zone in constructor', () => {
    const storage = new BunnyStorage('key', 'storage-name', '/translations');
    expect(storage).toBeDefined();
    expect(connectMock).toHaveBeenCalledWith('saopaulo', 'storage-name', 'key');
  });

  it('removes directory with normalized path', async () => {
    const storage = new BunnyStorage('key', 'storage-name', '/translations');

    await storage.clearFiles('app', 'dev');

    expect(removeDirectoryMock).toHaveBeenCalledWith('zone', 'translations/app/dev');
  });

  it('uploads json file to bunny path', async () => {
    const storage = new BunnyStorage('key', 'storage-name', '/translations');

    await storage.uploadToCdn('app', 'dev', 'pt-BR', 'common', { hello: 'ola' });

    expect(uploadMock).toHaveBeenCalledWith('zone', 'translations/app/dev/pt-BR/common.json', expect.any(Object));
  });
});
