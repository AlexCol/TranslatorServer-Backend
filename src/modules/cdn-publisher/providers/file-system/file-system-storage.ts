import { promises as fs } from 'fs';
import path from 'path';
import { CdnPublisher } from '../../interfaces/CdnPublisher';

export class FileSystemStorage implements CdnPublisher {
  constructor(private readonly basePath: string) {}

  async clearFiles(system: string, environment: string): Promise<void> {
    const pathToDelete = path.join(this.basePath, system, environment);
    await this.deleteDirectoryRecursive(pathToDelete);
  }

  async uploadToCdn(
    system: string,
    environment: string,
    language: string,
    namespace: string,
    translations: Record<string, any>,
  ): Promise<void> {
    const dirPath = path.join(this.basePath, system, environment, language);

    await fs.mkdir(dirPath, { recursive: true });

    const filePath = path.join(dirPath, `${namespace}.json`);
    const jsonString = JSON.stringify(translations, null, 2);
    await fs.writeFile(filePath, jsonString, 'utf-8');
  }

  private async deleteDirectoryRecursive(dirPath: string): Promise<void> {
    try {
      await fs.rm(dirPath, { recursive: true, force: true });
    } catch {
      // diretório não existe, ok
    }
  }
}
