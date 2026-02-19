const mkdirMock = jest.fn();
const writeFileMock = jest.fn();
const rmMock = jest.fn();

jest.mock('fs', () => ({
  promises: {
    mkdir: (...args: any[]) => mkdirMock(...args),
    writeFile: (...args: any[]) => writeFileMock(...args),
    rm: (...args: any[]) => rmMock(...args),
  },
}));

import path from 'path';
import { FileSystemStorage } from './file-system-storage';

describe('FileSystemStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates directory and writes json file', async () => {
    const storage = new FileSystemStorage('/tmp/base');

    await storage.uploadToCdn('app', 'dev', 'pt-BR', 'common', { hello: 'ola' });

    expect(mkdirMock).toHaveBeenCalledWith(path.join('/tmp/base', 'app', 'dev', 'pt-BR'), { recursive: true });
    expect(writeFileMock).toHaveBeenCalledWith(
      path.join('/tmp/base', 'app', 'dev', 'pt-BR', 'common.json'),
      JSON.stringify({ hello: 'ola' }, null, 2),
      'utf-8',
    );
  });

  it('clears files recursively', async () => {
    const storage = new FileSystemStorage('/tmp/base');

    await storage.clearFiles('app', 'dev');

    expect(rmMock).toHaveBeenCalledWith(path.join('/tmp/base', 'app', 'dev'), { recursive: true, force: true });
  });
});
