import { describe, expect, it } from 'vitest';
import english from '../../messages/en.json';
import spanish from '../../messages/es.json';

function leafKeys(value: unknown, prefix = ''): string[] {
  if (!value || typeof value !== 'object') return [prefix];
  return Object.entries(value)
    .flatMap(([key, child]) => leafKeys(child, prefix ? `${prefix}.${key}` : key))
    .sort();
}

describe('message catalog contract', () => {
  it('keeps English and Spanish namespaces in parity', () => {
    expect(leafKeys(spanish)).toEqual(leafKeys(english));
  });
});
