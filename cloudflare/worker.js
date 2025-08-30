
const PUBLIC_FE_URL = "https://your-vercel-app.vercel.app"; // set your Vercel deploy
const BASE44_URL = "https://base44.onrender.com";           // origin (same host as DNS CNAME www)

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/_edge_health") return new Response("ok", { status: 200 });

    if (url.pathname.startsWith("/public/")) {
      const slug = url.pathname.slice("/public/".length);
      if (!slug) return new Response("Not found", { status: 404 });
      if (request.method !== "GET") return new Response("Method not allowed", { status: 405 });

      const target = `${PUBLIC_FE_URL}/PublicProfileSlug?slug=${encodeURIComponent(slug)}${url.search}`;
      const resp = await fetch(target, { headers: { "x-forwarded-host": url.host, "x-sfero-proxy": "cf-worker" } });
      const hdrs = new Headers(resp.headers);
      hdrs.set("cache-control", "no-store");
      return new Response(resp.body, { status: resp.status, headers: hdrs });
    }

    const forward = `${BASE44_URL}${url.pathname}${url.search}`;
    return fetch(new Request(forward, request));
  }
}
