const GOKZ_API_BASE = "https://api.gokz.top/api/v1";

function normalizePath(value) {
  const path = String(value || "").trim();
  if (!path) return "";
  return path.startsWith("/") ? path : `/${path}`;
}

function resolveProxiedPath(rawPath) {
  const path = normalizePath(rawPath);
  if (!path) return "";

  const netlifyPrefix = "/.netlify/functions/gokz-proxy";
  if (path.startsWith(netlifyPrefix)) {
    const sliced = path.slice(netlifyPrefix.length);
    return normalizePath(sliced);
  }

  const apiPrefix = "/api";
  if (path.startsWith(apiPrefix)) {
    const sliced = path.slice(apiPrefix.length);
    return normalizePath(sliced);
  }

  return "";
}

function resolveQuery(event) {
  if (event.rawQuery) return `?${event.rawQuery}`;

  const query = new URLSearchParams();
  const source = event.queryStringParameters || {};
  for (const [key, value] of Object.entries(source)) {
    if (value === undefined || value === null) continue;
    query.set(key, String(value));
  }

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
}

function buildCorsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, OPTIONS"
  };
}

exports.handler = async (event) => {
  const origin = event.headers?.origin || "";
  const corsHeaders = buildCorsHeaders(origin);

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: ""
    };
  }

  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  const proxiedPath = resolveProxiedPath(event.path);

  if (!proxiedPath || proxiedPath === "/") {
    return {
      statusCode: 400,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ error: "Missing API path" })
    };
  }

  const query = resolveQuery(event);
  const upstreamUrl = `${GOKZ_API_BASE}${proxiedPath}${query}`;

  try {
    const response = await fetch(upstreamUrl, {
      method: "GET",
      headers: {
        Accept: "application/json"
      }
    });

    const bodyText = await response.text();

    return {
      statusCode: response.status,
      headers: {
        ...corsHeaders,
        "Content-Type": response.headers.get("content-type") || "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=15"
      },
      body: bodyText
    };
  } catch (error) {
    return {
      statusCode: 502,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        error: "Proxy request failed",
        details: String(error?.message || error)
      })
    };
  }
};
