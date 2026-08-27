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

  it('includes shared sales labels used by compact KPI contracts', () => {
    expect(english.sales.remainingGap).toBe('Remaining gap');
    expect(spanish.sales.remainingGap).toBe('Brecha restante');
  });

  it('keeps the approved bilingual login contract', () => {
    expect(spanish.auth.headline).toBe(
      'Convierte tu pipeline en decisiones comerciales más claras.',
    );
    expect(spanish.auth.welcome).toBe('Bienvenido');
    expect(english.auth.headline).toBe('Turn your pipeline into clearer commercial decisions.');
    expect(english.auth.welcome).toBe('Welcome');
  });
});
