export abstract class SystemProvider {
  //!sobre system
  abstract listSystems(): Promise<string[]>;
  abstract createSystem(system: string): Promise<void>;
  abstract deleteSystem(system: string): Promise<void>;
}
