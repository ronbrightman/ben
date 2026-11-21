// הכספת של בן: משחקים ותוצאות של מנצ'סטר סיטי (מקור: ה-API הציבורי של ESPN), שמור במטמון של Netlify ל-10 דקות
const TEAM = 382;
const LEAGUES = { "eng.1": "פרמייר ליג", "uefa.champions": "ליגת האלופות", "eng.fa": "גביע אנגלי", "eng.league_cup": "גביע הליגה" };

async function grab(league, fixture) {
  try {
    const r = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${league}/teams/${TEAM}/schedule?fixture=${fixture}`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) return [];
    const d = await r.json();
    return (d.events || []).map((e) => {
      const c = (e.competitions || [])[0] || {};
      const side = (h) => {
        const x = (c.competitors || []).find((t) => t.homeAway === h) || {};
        const s = x.score && typeof x.score === "object" ? x.score.displayValue : x.score;
        return {
          id: x.team && x.team.id,
          name: x.team && (x.team.shortDisplayName || x.team.displayName),
          logo: x.team && ((x.team.logos || [])[0] || {}).href,
          score: s == null || s === "" ? null : String(s),
        };
      };
      const st = (c.status && c.status.type) || {};
      return {
        id: e.id,
        date: e.date,
        comp: LEAGUES[league],
        venue: (c.venue || {}).fullName || "",
        home: side("home"),
        away: side("away"),
        state: st.state || "pre", // pre | in | post
        detail: st.shortDetail || "",
        clock: (c.status || {}).displayClock || "",
      };
    });
  } catch {
    return [];
  }
}

export default async () => {
  const all = (await Promise.all(Object.keys(LEAGUES).flatMap((l) => [grab(l, true), grab(l, false)]))).flat();
  const seen = new Map();
  for (const g of all) if (g.id && g.date) seen.set(g.id, g);
  const games = [...seen.values()].sort((a, b) => a.date.localeCompare(b.date));
  return new Response(JSON.stringify({ updated: new Date().toISOString(), games }), {
    headers: {
      "content-type": "application/json",
      "cache-control": "public, max-age=60",
      "netlify-cdn-cache-control": "public, s-maxage=600, stale-while-revalidate=3600",
    },
  });
};

export const config = { path: "/api/city" };
