/**
 * Vercel BFF: mirrors Docker nginx /api/elastic/* proxies.
 * Secrets stay server-side (ELASTIC_API_KEY / OK_KIBANA_API_KEY).
 *
 * Non-Next Vite apps cannot use api/[...path] catch-alls for nested URLs.
 * vercel.json rewrites /api/elastic/* → this file; original req.url is preserved.
 */

export const config = {
  maxDuration: 300,
  api: {
    bodyParser: false,
  },
};

const DEFAULT_ES =
  'https://gawdzilla-0d3e9e.es.us-east-2.aws.elastic-cloud.com:443';
const DEFAULT_KB =
  'https://gawdzilla-0d3e9e.kb.us-east-2.aws.elastic-cloud.com';

/** Agents routed to OK_KIBANA_URL (same set as nginx.conf). */
const GAWDZILLA_CHAT_AGENTS = new Set([
  'ok-fraud',
  'ok-grants-data',
  'booster-donor-data',
  'ok-oja-data',
  'gameday-revenue-data',
  'ou-met-catalog-agent',
  'ou-met-provisioning-agent',
  'snap-fraud-investigator',
  'okstate-donor-assistant',
  'okstate-gameday-revenue-assistant',
  'wyo-classify',
  'elastic-ai-agent',
  'rrp-aid-integrity',
]);

const TOOL_EXECUTE_PREFIXES = new Set([
  'gameday-revenue-data',
  'booster-donor-data',
  'ok-grants-data',
  'ok-oja-data',
]);

function env(key, fallback = '') {
  const v = process.env[key];
  return v != null && String(v).trim() !== '' ? String(v).trim() : fallback;
}

function esUrl() {
  return env('ELASTIC_ES_URL', DEFAULT_ES).replace(/\/$/, '');
}

function okEsUrl() {
  return env('OK_ELASTIC_ES_URL', env('ELASTIC_ES_URL', DEFAULT_ES)).replace(/\/$/, '');
}

function kbUrl() {
  return env('ELASTIC_KB_URL', DEFAULT_KB).replace(/\/$/, '');
}

function okKbUrl() {
  return env('OK_KIBANA_URL', env('ELASTIC_KB_URL', DEFAULT_KB)).replace(/\/$/, '');
}

/**
 * @param {string} subPath path after /api/elastic/
 * @returns {{ base: string, upstreamPath: string, useOkKey: boolean }}
 */
function resolveUpstream(subPath) {
  const path = subPath.replace(/^\/+/, '');

  if (path === 'ok-fraud/es' || path.startsWith('ok-fraud/es/')) {
    const rest = path.slice('ok-fraud/es'.length) || '/';
    return { base: okEsUrl(), upstreamPath: rest.startsWith('/') ? rest : `/${rest}`, useOkKey: true };
  }

  if (path === 'es' || path.startsWith('es/')) {
    const rest = path.slice('es'.length) || '/';
    return { base: esUrl(), upstreamPath: rest.startsWith('/') ? rest : `/${rest}`, useOkKey: true };
  }

  if (path === 'workflows' || path.startsWith('workflows/')) {
    const rest = path.slice('workflows'.length).replace(/^\//, '');
    return {
      base: okKbUrl(),
      upstreamPath: `/api/workflows/${rest}`,
      useOkKey: true,
    };
  }

  for (const prefix of TOOL_EXECUTE_PREFIXES) {
    if (path === `${prefix}/tools/_execute`) {
      return {
        base: okKbUrl(),
        upstreamPath: '/api/agent_builder/tools/_execute',
        useOkKey: true,
      };
    }
  }
  if (path === 'ok-fraud/tools/_execute') {
    return {
      base: okKbUrl(),
      upstreamPath: '/api/agent_builder/tools/_execute',
      useOkKey: true,
    };
  }

  const agentMatch = path.match(/^agent\/([^/]+)\/chat(\/stream)?$/);
  if (agentMatch) {
    const agentId = agentMatch[1];
    const isStream = Boolean(agentMatch[2]);

    if (agentId === 'library-receipts-assistant') {
      return {
        base: okKbUrl(),
        upstreamPath: isStream
          ? '/s/tsu-library-receipts/api/agent_builder/converse/async'
          : '/s/tsu-library-receipts/api/agent_builder/converse',
        useOkKey: true,
      };
    }
    if (agentId === 'mesonet-flight-analyst') {
      return {
        base: okKbUrl(),
        upstreamPath: isStream
          ? '/s/ok3d-uas/api/agent_builder/converse/async'
          : '/s/ok3d-uas/api/agent_builder/converse',
        useOkKey: true,
      };
    }
    if (GAWDZILLA_CHAT_AGENTS.has(agentId)) {
      return {
        base: okKbUrl(),
        upstreamPath: isStream
          ? '/api/agent_builder/converse/async'
          : '/api/agent_builder/converse',
        useOkKey: true,
      };
    }
    return {
      base: kbUrl(),
      upstreamPath: isStream
        ? '/api/agent_builder/converse/async'
        : '/api/agent_builder/converse',
      useOkKey: false,
    };
  }

  return {
    base: kbUrl(),
    upstreamPath: path ? `/${path}` : '/',
    useOkKey: false,
  };
}

function pickApiKey(useOkKey) {
  const okKey = env('OK_KIBANA_API_KEY', '');
  const elasticKey = env('ELASTIC_API_KEY', '');
  if (useOkKey && okKey) return okKey;
  return elasticKey || okKey;
}

async function readRawBody(req) {
  if (req.method === 'GET' || req.method === 'HEAD') return undefined;
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  if (!chunks.length) return undefined;
  return Buffer.concat(chunks);
}

/** Path after /api/elastic from the original request URL (preserved by rewrite). */
function buildSubPath(req) {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  return url.pathname.replace(/^\/api\/elastic\/?/, '');
}

const HOP_BY_HOP = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailers',
  'transfer-encoding',
  'upgrade',
  'host',
  'content-length',
  'content-encoding',
]);

export default async function handler(req, res) {
  try {
    const subPath = buildSubPath(req);
    const { base, upstreamPath, useOkKey } = resolveUpstream(subPath);
    const targetUrl = new URL(upstreamPath, `${base}/`);

    const incoming = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    incoming.searchParams.forEach((value, key) => {
      targetUrl.searchParams.append(key, value);
    });

    const headers = {};
    const contentType = req.headers['content-type'];
    if (contentType) headers['Content-Type'] = contentType;
    if (req.headers['kbn-xsrf']) headers['kbn-xsrf'] = req.headers['kbn-xsrf'];
    else headers['kbn-xsrf'] = 'true';

    const incomingAuth = req.headers.authorization || req.headers.Authorization;
    if (incomingAuth) {
      headers.Authorization = incomingAuth;
    } else {
      const key = pickApiKey(useOkKey);
      if (key) headers.Authorization = `ApiKey ${key}`;
    }

    const body = await readRawBody(req);
    const upstream = await fetch(targetUrl.toString(), {
      method: req.method,
      headers,
      body: body && body.length ? body : undefined,
    });

    res.statusCode = upstream.status;
    upstream.headers.forEach((value, key) => {
      if (HOP_BY_HOP.has(key.toLowerCase())) return;
      if (key.toLowerCase() === 'content-encoding') return;
      res.setHeader(key, value);
    });
    if (String(upstream.headers.get('content-type') || '').includes('text/event-stream')) {
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('X-Accel-Buffering', 'no');
    }

    if (!upstream.body) {
      res.end();
      return;
    }

    const reader = upstream.body.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) res.write(Buffer.from(value));
      }
      res.end();
    } catch (streamErr) {
      console.error('elastic proxy stream error:', streamErr?.message || streamErr);
      try {
        res.end();
      } catch {
        /* ignore */
      }
    }
  } catch (err) {
    console.error('elastic proxy error:', err?.message || err);
    if (!res.headersSent) {
      res.statusCode = 502;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Elastic proxy failed', message: String(err?.message || err) }));
    } else {
      try {
        res.end();
      } catch {
        /* ignore */
      }
    }
  }
}
