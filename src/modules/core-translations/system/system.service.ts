import { Injectable } from '@nestjs/common';
import { TranslationsCacheService } from '../translations-cache.service';
import { SystemProvider } from '@/modules/core-translations/core/interfaces/SystemProvider';

@Injectable()
export class SystemService {
  constructor(
    private readonly cache: TranslationsCacheService,
    private readonly provider: SystemProvider,
  ) {}

  async listSystems(): Promise<string[]> {
    return this.provider.listSystems();
  }

  async createSystem(system: string): Promise<void> {
    await this.provider.createSystem(system);
    await this.cache.clear(); // Clear cache after creating a new system
  }

  async deleteSystem(system: string): Promise<void> {
    await this.provider.deleteSystem(system);
    await this.cache.clear(); // Clear cache after deleting a system
  }
}
