// הכספת של בן: שמירת הנתונים בשרת (Netlify Blobs)
// הקוד המשפחתי לא נשמר כאן, רק טביעת SHA-256 שלו
import { getStore } from "@netlify/blobs";

const CODE_HASH = "da567b5f09f055a646df0e74c6014785930a8d207b22964868153f872b9bf9cf";

async function sha256(s) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

export default async (req) => {
  const store = getStore({ name: "ben-vault", consistency: "strong" });

  if (req.method === "GET") {
    const code = new URL(req.url).searchParams.get("code") || "";
    if ((await sha256(code)) !== CODE_HASH) return json({ error: "bad_code" }, 403);
    const r = await store.getWithMetadata("state", { type: "json" });
    if (!r) return json({ data: null, version: "" });
    return json({ data: r.data, version: r.etag });
  }

  if (req.method === "POST") {
    let body;
    try { body = await req.json(); } catch { return json({ error: "bad_json" }, 400); }
    if ((await sha256(body.code || "")) !== CODE_HASH) return json({ error: "bad_code" }, 403);
    if (!body.data || !Array.isArray(body.data.tasks)) return json({ error: "bad_data" }, 400);

    // כתיבה מותנית: נכשלת אם מכשיר אחר שמר בינתיים (מונע דריסה)
    const opts = body.version ? { onlyIfMatch: body.version } : { onlyIfNew: true };
    const { modified, etag } = await store.setJSON("state", body.data, opts);
    if (!modified) return json({ error: "conflict" }, 409);

    // גיבוי יומי אוטומטי: עותק אחד לכל יום
    await store.setJSON("backup-" + new Date().toISOString().slice(0, 10), body.data);
    return json({ ok: true, version: etag });
  }

  return json({ error: "method_not_allowed" }, 405);
};

export const config = { path: "/api/vault" };
