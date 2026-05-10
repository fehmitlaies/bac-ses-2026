/* /api/sync — fonction serverless Vercel
   Backend : Upstash Redis (REST API).
   Variables d'env requises : UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN.
   Si non configurées : renvoie 503 → l'app continue de marcher en local-only.

   GET  /api/sync?id=xxx&pass=yyy
     → { ok:true, data:{...}, ts:1234567890 } si trouvé+pass match
     → { ok:true, data:null, ts:0 } si pas encore créé
     → 401 si pass ne match pas

   POST /api/sync  body { id, pass, data }
     → 1ère écriture : crée la clé avec ce pass
     → suivantes : vérifie pass, écrase data
     → { ok:true, ts:1234567890 }
*/
// Compatible Upstash classique ET Vercel KV (Marketplace) :
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

async function redis(cmd) {
  const r = await fetch(REDIS_URL, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + REDIS_TOKEN,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(cmd)
  });
  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error("redis " + r.status + " " + txt.slice(0, 100));
  }
  const j = await r.json();
  return j.result;
}

function sanitize(s) {
  return String(s || "").trim().slice(0, 80).replace(/[^a-zA-Z0-9_\-.]/g, "");
}

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  if (!REDIS_URL || !REDIS_TOKEN) {
    return res.status(503).json({ ok: false, error: "sync_not_configured" });
  }

  try {
    if (req.method === "GET") {
      const id = sanitize(req.query.id);
      const pass = String(req.query.pass || "");
      if (!id || !pass) return res.status(400).json({ error: "id_and_pass_required" });
      const raw = await redis(["GET", "bac-ses:" + id]);
      if (!raw) return res.json({ ok: true, data: null, ts: 0 });
      const obj = JSON.parse(raw);
      if (obj.pass !== pass) return res.status(401).json({ error: "wrong_passphrase" });
      return res.json({ ok: true, data: obj.data, ts: obj.ts });
    }

    if (req.method === "POST") {
      const body = req.body && typeof req.body === "object" ? req.body : {};
      const id = sanitize(body.id);
      const pass = String(body.pass || "");
      if (!id || !pass) return res.status(400).json({ error: "id_and_pass_required" });
      if (pass.length < 4) return res.status(400).json({ error: "pass_too_short" });

      const raw = await redis(["GET", "bac-ses:" + id]);
      if (raw) {
        const existing = JSON.parse(raw);
        if (existing.pass !== pass) return res.status(401).json({ error: "wrong_passphrase" });
      }
      const ts = Date.now();
      const value = JSON.stringify({ pass, data: body.data || {}, ts });
      if (value.length > 4_000_000) return res.status(413).json({ error: "too_large" });
      await redis(["SET", "bac-ses:" + id, value]);
      return res.json({ ok: true, ts });
    }

    return res.status(405).json({ error: "method_not_allowed" });
  } catch (e) {
    console.error("sync error:", e);
    return res.status(500).json({ error: String(e.message || e) });
  }
}

export const config = {
  api: { bodyParser: { sizeLimit: "4mb" } }
};
