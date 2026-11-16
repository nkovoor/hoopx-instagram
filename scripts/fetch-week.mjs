// Fetches the last 7 NBA nights (ET) from ESPN into data/week.json.  node scripts/fetch-week.mjs [YYYYMMDD end date]
import fs from 'node:fs';
import { buildNight, lastNightET } from './fetch-night.mjs';

const end = process.argv.slice(2).find((a) => /^\d{8}$/.test(a)) || lastNightET();
const base = new Date(`${end.slice(0, 4)}-${end.slice(4, 6)}-${end.slice(6, 8)}T12:00:00Z`);
const nights = [];
for (let i = 6; i >= 0; i -= 1) {
  const d = new Date(base.getTime() - i * 86400000);
  const ymd = d.toISOString().slice(0, 10).replaceAll('-', '');
  try {
    const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${ymd}&limit=100`, { headers: { 'user-agent': 'hoopx-instagram/1.0' } });
    if (!res.ok) throw new Error(res.status);
    const n = buildNight(await res.json(), ymd);
    if (n.status === 'ok' || n.status === 'incomplete') nights.push(n);
    console.log(ymd, n.status, n.games.length);
  } catch (e) { console.log(ymd, 'failed', e.message); }
}
fs.mkdirSync('data', { recursive: true });
fs.writeFileSync('data/week.json', JSON.stringify({ end, nights }, null, 2));
console.log(`week ending ${end}: ${nights.length} nights`);
