const REQUEST_HEADER_ALLOWLIST = [
  'accept',
  'accept-language',
  'content-type',
  'cookie',
  'origin',
  'user-agent',
  'x-csrf-token',
] as const;

const RESPONSE_HEADER_ALLOWLIST = [
  'content-disposition',
  'content-type',
  'etag',
  'retry-after',
  'x-ratelimit-limit',
  'x-ratelimit-remaining',
  'x-ratelimit-reset',
  'x-request-id',
] as const;

export const dynamic = 'force-dynamic';

function apiOrigin(): URL {
  const origin = new URL(process.env.API_ORIGIN ?? 'http://localhost:4000');
  if (
    origin.username ||
    origin.password ||
    origin.pathname !== '/' ||
    origin.search ||
    origin.hash
  ) {
    throw new Error('API_ORIGIN must be an origin without credentials, path, query, or fragment');
  }
  if (process.env.NODE_ENV === 'production' && origin.protocol !== 'https:') {
    throw new Error('API_ORIGIN must use HTTPS in production');
  }
  if (!['http:', 'https:'].includes(origin.protocol)) {
    throw new Error('API_ORIGIN must use HTTP or HTTPS');
  }
  return origin;
}

function safePath(segments: string[]): string {
  if (
    segments.length === 0 ||
    segments.some(
      (segment) => segment === '.' || segment === '..' || !/^[A-Za-z0-9._~-]+$/.test(segment),
    )
  ) {
    throw new Error('Invalid backend path');
  }
  return segments.map(encodeURIComponent).join('/');
}

async function proxyRequest(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
): Promise<Response> {
  try {
    const { path } = await context.params;
    const incomingUrl = new URL(request.url);
    const target = new URL(`/${safePath(path)}`, apiOrigin());
    target.search = incomingUrl.search;

    const headers = new Headers();
    for (const name of REQUEST_HEADER_ALLOWLIST) {
      const value = request.headers.get(name);
      if (value) headers.set(name, value);
    }

    const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
    const upstream = await fetch(target, {
      method: request.method,
      headers,
      body: hasBody ? await request.arrayBuffer() : undefined,
      cache: 'no-store',
      redirect: 'manual',
      signal: AbortSignal.timeout(25_000),
    });

    const responseHeaders = new Headers({ 'cache-control': 'no-store' });
    for (const name of RESPONSE_HEADER_ALLOWLIST) {
      const value = upstream.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }
    for (const cookie of upstream.headers.getSetCookie()) {
      responseHeaders.append('set-cookie', cookie);
    }

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Backend proxy request failed', {
      message: error instanceof Error ? error.message : 'Unknown proxy error',
    });
    return Response.json(
      { code: 'UPSTREAM_UNAVAILABLE', message: 'The application service is unavailable' },
      { status: 502, headers: { 'cache-control': 'no-store' } },
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
export const OPTIONS = proxyRequest;
