import { describe, expect, it } from 'vitest';
import { requestTracker } from './request-tracker';

describe('requestTracker', () => {
  it('uses the Railway-overwritten real IP only with platform markers', async () => {
    await expect(
      requestTracker({
        headers: {
          'x-railway-request-id': 'railway-request',
          'x-railway-edge': 'railway/us-west2',
          'x-real-ip': '203.0.113.42',
        },
        ip: '10.0.0.8',
      }),
    ).resolves.toBe('203.0.113.42');
  });

  it('falls back to the adapter IP when platform markers are absent', async () => {
    await expect(
      requestTracker({ headers: { 'x-real-ip': '203.0.113.42' }, ip: '127.0.0.1' }),
    ).resolves.toBe('127.0.0.1');
  });

  it('rejects malformed platform IP values', async () => {
    await expect(
      requestTracker({
        headers: {
          'x-railway-request-id': 'railway-request',
          'x-railway-edge': 'railway/us-west2',
          'x-real-ip': 'not-an-ip',
        },
        ip: '127.0.0.1',
      }),
    ).resolves.toBe('127.0.0.1');
  });
});
