export abstract class CdnPublisher {
  abstract clearFiles(system: string, environment: string): Promise<void>;

  abstract uploadToCdn(
    system: string,
    environment: string,
    language: string,
    namespace: string,
    translations: Record<string, any>,
  ): Promise<void>;
}
