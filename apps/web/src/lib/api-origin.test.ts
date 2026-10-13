import { describe, expect, it } from 'vitest';
import { resolveApiOrigin } from './api-origin';

describe('resolveApiOrigin', () => {
  it('accepts an HTTPS production origin', () => {
    expect(resolveApiOrigin('https://api.example.test', 'production').origin).toBe(
      'https://api.example.test',
    );
  });

  it('accepts only the pinned private Compose API over production HTTP', () => {
    expect(resolveApiOrigin('http://api:4000', 'production').origin).toBe('http://api:4000');
    expect(() => resolveApiOrigin('http://api:4100', 'production')).toThrow(
      'pinned private Compose origin',
    );
    expect(() => resolveApiOrigin('http://localhost:4000', 'production')).toThrow(
      'pinned private Compose origin',
    );
  });

  it('rejects credentials, paths and unsupported protocols', () => {
    expect(() => resolveApiOrigin('https://user:password@example.test', 'production')).toThrow(
      'without credentials',
    );
    expect(() => resolveApiOrigin('https://example.test/backend', 'production')).toThrow(
      'without credentials',
    );
    expect(() => resolveApiOrigin('file:///tmp/api', 'development')).toThrow('HTTP or HTTPS');
  });
});
