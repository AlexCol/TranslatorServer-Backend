import { Injectable } from '@nestjs/common';
import { TranslationsCacheService } from '../translations-cache.service';
import { EnvironmentProvider } from '@/modules/core-translations/core/interfaces/EnvironmentProvider';

@Injectable()
export class EnvironmentService {
  constructor(
    private readonly cache: TranslationsCacheService,
    private readonly provider: EnvironmentProvider,
  ) {}

  async listEnvironments(system: string): Promise<string[]> {
    return this.provider.listEnvironments(system);
  }

  async createEnvironment(system: string, environment: string): Promise<void> {
    await this.provider.createEnvironment(system, environment);
    await this.cache.deleteByPrefix(`${system}:${environment}:`);
  }

  async deleteEnvironment(system: string, environment: string): Promise<void> {
    await this.provider.deleteEnvironment(system, environment);
    await this.cache.deleteByPrefix(`${system}:${environment}:`);
  }
}
