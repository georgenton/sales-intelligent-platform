import { isIP } from 'node:net';

type TrackableRequest = {
  headers?: Record<string, unknown>;
  ip?: unknown;
};

function singleHeader(value: unknown): string | undefined {
  if (typeof value === 'string') return value.trim();
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0].trim();
  return undefined;
}

export function requestTracker(request: TrackableRequest): Promise<string> {
  const headers = request.headers ?? {};
  const railwayRequestId = singleHeader(headers['x-railway-request-id']);
  const railwayEdge = singleHeader(headers['x-railway-edge']);
  const realIp = singleHeader(headers['x-real-ip']);

  // Railway overwrites X-Real-IP at its edge. Require its request markers so a
  // self-hosted client cannot select an arbitrary throttle bucket by supplying
  // X-Real-IP alone.
  if (railwayRequestId && railwayEdge && realIp && isIP(realIp) !== 0) {
    return Promise.resolve(realIp);
  }

  return Promise.resolve(typeof request.ip === 'string' && request.ip ? request.ip : 'unknown');
}
