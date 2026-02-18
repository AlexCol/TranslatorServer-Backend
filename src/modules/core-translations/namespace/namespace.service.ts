import { Injectable } from '@nestjs/common';
import { validateLanguage } from '../common/validateLanguage';
import { NamespaceProvider } from '@/modules/core-translations/core/interfaces/NamespaceProvider';

@Injectable()
export class NamespaceService {
  constructor(private readonly provider: NamespaceProvider) {}

  async listNamespaces(system: string, environment: string, language: string): Promise<string[]> {
    validateLanguage(language);
    return this.provider.listNamespaces(system, environment, language);
  }

  async createNamespace(system: string, namespace: string): Promise<void> {
    await this.provider.createNamespace(system, namespace);
  }

  async deleteNamespace(system: string, namespace: string): Promise<void> {
    await this.provider.deleteNamespace(system, namespace);
  }
}
