const GOKZ_API_BASE = "https://api.gokz.top/api/v1";

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

  const rawPath = String(event.path || "");
  const marker = "/.netlify/functions/gokz-proxy/";
  const markerIndex = rawPath.indexOf(marker);
  const proxiedPath = markerIndex >= 0 ? rawPath.slice(markerIndex + marker.length - 1) : "";

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

  const query = event.rawQuery ? `?${event.rawQuery}` : "";
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
