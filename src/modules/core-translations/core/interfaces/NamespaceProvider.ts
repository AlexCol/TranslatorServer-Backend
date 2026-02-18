export abstract class NamespaceProvider {
  //!sobre namespaces
  abstract listNamespaces(system: string, env: string, language: string): Promise<string[]>;
  abstract createNamespace(system: string, namespace: string): Promise<void>;
  abstract deleteNamespace(system: string, namespace: string): Promise<void>;
}
