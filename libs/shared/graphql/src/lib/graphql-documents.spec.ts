import { Kind } from 'graphql';
import * as Mutations from './mutations';
import * as Queries from './queries';
import * as Selections from './selections';

function assertGraphqlDocument(name: string, doc: unknown): void {
  expect(doc).toBeDefined();
  expect(typeof doc).toBe('object');
  expect((doc as { kind: string }).kind).toBe(Kind.DOCUMENT);
}

function assertSelection(name: string, value: unknown): void {
  expect(value).toBeDefined();
  expect(typeof value).toBe('string');
  expect((value as string).length).toBeGreaterThan(0);
}

function assertExports(
  moduleName: string,
  exportsMap: Record<string, unknown>,
  assertFn: (name: string, value: unknown) => void,
): void {
  const entries = Object.entries(exportsMap).filter(
    ([key]) => key !== 'default',
  );
  expect(entries.length).toBeGreaterThan(0);
  entries.forEach(([name, value]) => assertFn(`${moduleName}.${name}`, value));
}

describe('GraphQL queries', () => {
  it('exports valid GraphQL documents', () => {
    assertExports('queries', Queries, assertGraphqlDocument);
  });
});

describe('GraphQL mutations', () => {
  it('exports valid GraphQL documents', () => {
    assertExports('mutations', Mutations, assertGraphqlDocument);
  });
});

describe('GraphQL selections', () => {
  it('exports non-empty selection strings', () => {
    assertExports('selections', Selections, assertSelection);
  });
});
