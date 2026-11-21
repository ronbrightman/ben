// הכספת של בן: מוצא את תמונת התצוגה (og:image) של לינק, כדי שאבא לא יצטרך לחפש תמונה בעצמו
const CODE_HASH = "da567b5f09f055a646df0e74c6014785930a8d207b22964868153f872b9bf9cf";
async function sha256(s) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

export default async (req) => {
  const u = new URL(req.url);
  if ((await sha256(u.searchParams.get("code") || "")) !== CODE_HASH) return json({ error: "bad_code" }, 403);
  let target;
  try { target = new URL(u.searchParams.get("url") || ""); } catch { return json({ error: "bad_url" }, 400); }
  if (!/^https?:$/.test(target.protocol)) return json({ error: "bad_url" }, 400);
  try {
    const r = await fetch(target, {
      redirect: "follow",
      signal: AbortSignal.timeout(7000),
      headers: { "user-agent": "Mozilla/5.0 (compatible; facebookexternalhit/1.1)", accept: "text/html" },
    });
    const html = (await r.text()).slice(0, 600000);
    const pick = (re) => { const m = html.match(re); return m && m[1]; };
    const raw =
      pick(/<meta[^>]+(?:property|name)=["'](?:og:image(?::secure_url)?|twitter:image(?::src)?)["'][^>]*content=["']([^"']+)["']/i) ||
      pick(/<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["'](?:og:image|twitter:image)["']/i) ||
      pick(/<link[^>]+rel=["']image_src["'][^>]*href=["']([^"']+)["']/i);
    if (!raw) return json({ image: null });
    const img = new URL(raw.replace(/&amp;/g, "&"), r.url || target).href;
    return json({ image: /^https?:/.test(img) ? img : null });
  } catch {
    return json({ image: null });
  }
};

export const config = { path: "/api/linkimg" };
