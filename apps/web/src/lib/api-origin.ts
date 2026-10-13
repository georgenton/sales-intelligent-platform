export function resolveApiOrigin(value: string | undefined, nodeEnv: string | undefined): URL {
  const origin = new URL(value ?? 'http://localhost:4000');
  if (!['http:', 'https:'].includes(origin.protocol)) {
    throw new Error('API_ORIGIN must use HTTP or HTTPS');
  }
  if (
    origin.username ||
    origin.password ||
    origin.pathname !== '/' ||
    origin.search ||
    origin.hash
  ) {
    throw new Error('API_ORIGIN must be an origin without credentials, path, query, or fragment');
  }
  const isPinnedPrivateComposeOrigin =
    origin.protocol === 'http:' && origin.hostname === 'api' && origin.port === '4000';
  if (nodeEnv === 'production' && origin.protocol !== 'https:' && !isPinnedPrivateComposeOrigin) {
    throw new Error('API_ORIGIN must use HTTPS or the pinned private Compose origin in production');
  }
  return origin;
}
