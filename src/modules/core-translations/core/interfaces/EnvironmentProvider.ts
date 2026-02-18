export abstract class EnvironmentProvider {
  //!sobre ambientes
  abstract listEnvironments(system: string): Promise<string[]>;
  abstract createEnvironment(system: string, environment: string): Promise<void>;
  abstract deleteEnvironment(system: string, environment: string): Promise<void>;
}
