import { getEnvironmentId } from './getEnvironmentId';
import { getLanguage } from './getLanguage';
import { getLanguages } from './getLanguages';
import { getNamespaceId } from './getNamespaceId';
import { getSystemId } from './getSystemId';
import { getTranslation } from './getTranslations';

const buildKnexForFirst = (result: any) => {
  const first = jest.fn().mockResolvedValue(result);
  const where = jest.fn().mockReturnValue({ first });
  const from = jest.fn().mockReturnValue({ where });
  const select = jest.fn().mockReturnValue({ from });
  return { knex: { select } as any, select, from, where, first };
};

const buildKnexForMany = (result: any) => {
  const where = jest.fn().mockResolvedValue(result);
  const from = jest.fn().mockReturnValue({ where });
  const select = jest.fn().mockReturnValue({ from });
  return { knex: { select } as any, select, from, where };
};

describe('Database utils', () => {
  it('gets system id', async () => {
    const { knex } = buildKnexForFirst({ id: 7, name: 'app' });
    await expect(getSystemId(knex, 'app')).resolves.toBe(7);
  });

  it('throws when system does not exist', async () => {
    const { knex } = buildKnexForFirst(undefined);
    await expect(getSystemId(knex, 'missing')).rejects.toThrow("System 'missing' does not exist");
  });

  it('gets environment id', async () => {
    const { knex } = buildKnexForFirst({ id: 3, systemId: 1, name: 'dev' });
    await expect(getEnvironmentId(knex, 1, 'dev')).resolves.toBe(3);
  });

  it('throws when environment does not exist', async () => {
    const { knex } = buildKnexForFirst(undefined);
    await expect(getEnvironmentId(knex, 1, 'missing')).rejects.toThrow(
      "Environment 'missing' does not exist for system ID '1'",
    );
  });

  it('gets one language and throws when missing', async () => {
    const success = buildKnexForFirst({ id: 2, environmentId: 1, code: 'en' });
    await expect(getLanguage(success.knex, 1, 'en')).resolves.toEqual({ id: 2, environmentId: 1, code: 'en' });

    const fail = buildKnexForFirst(undefined);
    await expect(getLanguage(fail.knex, 1, 'xx')).rejects.toThrow("Language 'xx' does not exist");
  });

  it('gets languages list and throws when empty', async () => {
    const success = buildKnexForMany([
      { id: 1, environmentId: 1, code: 'en' },
      { id: 2, environmentId: 1, code: 'pt-BR' },
    ]);
    await expect(getLanguages(success.knex, 1)).resolves.toHaveLength(2);

    const fail = buildKnexForMany([]);
    await expect(getLanguages(fail.knex, 1)).rejects.toThrow("Languages do not exist for environment ID '1'");
  });

  it('gets namespace id and translation row', async () => {
    const ns = buildKnexForFirst({ id: 11, languageId: 2, name: 'common' });
    await expect(getNamespaceId(ns.knex, 2, 'common')).resolves.toBe(11);

    const tr = buildKnexForFirst({ id: 30, namespaceId: 11, key: 'hello', value: 'ola' });
    await expect(getTranslation(tr.knex, 11, 'common')).resolves.toEqual({
      id: 30,
      namespaceId: 11,
      key: 'hello',
      value: 'ola',
    });
  });

  it('throws when namespace or translation does not exist', async () => {
    const missingNamespace = buildKnexForFirst(undefined);
    await expect(getNamespaceId(missingNamespace.knex, 9, 'missing')).rejects.toThrow(
      "Namespace 'missing' does not exist for language ID '9'",
    );

    const missingTranslation = buildKnexForFirst(undefined);
    await expect(getTranslation(missingTranslation.knex, 9, 'missing')).rejects.toThrow(
      "Namespace 'missing' does not exist for language ID '9'",
    );
  });
});
