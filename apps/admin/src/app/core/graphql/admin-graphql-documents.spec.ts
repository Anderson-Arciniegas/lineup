import { Kind } from 'graphql';
import * as Mutations from './mutations/admin-auth.mutations';
import * as UserMutations from './mutations/admin-users.mutations';
import * as RoleMutations from './mutations/admin-roles.mutations';
import * as SocialMutations from './mutations/admin-social-networks.mutations';
import * as SeedMutations from './mutations/admin-seed.mutations';
import * as AuthQueries from './queries/admin-auth.queries';
import * as UserQueries from './queries/admin-users.queries';
import * as StatsQueries from './queries/admin-stats.queries';
import * as RoleQueries from './queries/admin-roles.queries';
import * as SocialQueries from './queries/admin-social-networks.queries';
import * as BusinessQueries from './queries/admin-businesses.queries';
import * as CommonSelections from './selections/admin-common.selection';
import * as RoleSelections from './selections/admin-role.selection';
import * as SocialSelections from './selections/admin-social-network.selection';
import * as StatsSelections from './selections/admin-stats.selection';
import * as UserSelections from './selections/admin-user.selection';

function assertGraphqlDocument(name: string, doc: unknown): void {
  expect(doc).toBeDefined();
  expect((doc as { kind: string }).kind).toBe(Kind.DOCUMENT);
}

function assertSelection(name: string, value: unknown): void {
  expect(typeof value).toBe('string');
  expect((value as string).length).toBeGreaterThan(0);
}

function assertModuleExports(
  label: string,
  exportsMap: Record<string, unknown>,
  assertFn: (name: string, value: unknown) => void,
): void {
  Object.entries(exportsMap)
    .filter(([key]) => key !== 'default')
    .forEach(([name, value]) => assertFn(`${label}.${name}`, value));
}

describe('admin GraphQL documents', () => {
  it('exports valid auth and user operation documents', () => {
    assertModuleExports('authMutations', Mutations, assertGraphqlDocument);
    assertModuleExports('userMutations', UserMutations, assertGraphqlDocument);
    assertModuleExports('authQueries', AuthQueries, assertGraphqlDocument);
    assertModuleExports('userQueries', UserQueries, assertGraphqlDocument);
  });

  it('exports valid stats, roles, social and business documents', () => {
    assertModuleExports('statsQueries', StatsQueries, assertGraphqlDocument);
    assertModuleExports('roleQueries', RoleQueries, assertGraphqlDocument);
    assertModuleExports('roleMutations', RoleMutations, assertGraphqlDocument);
    assertModuleExports('socialQueries', SocialQueries, assertGraphqlDocument);
    assertModuleExports('socialMutations', SocialMutations, assertGraphqlDocument);
    assertModuleExports('businessQueries', BusinessQueries, assertGraphqlDocument);
    assertModuleExports('seedMutations', SeedMutations, assertGraphqlDocument);
  });

  it('exports non-empty admin selection strings', () => {
    assertModuleExports('commonSelections', CommonSelections, assertSelection);
    assertModuleExports('roleSelections', RoleSelections, assertSelection);
    assertModuleExports('socialSelections', SocialSelections, assertSelection);
    assertModuleExports('statsSelections', StatsSelections, assertSelection);
    assertModuleExports('userSelections', UserSelections, assertSelection);
  });
});
