// Pulls last night's NBA results from ESPN's public scoreboard and writes data/night.json.
// Every number on the Reel/carousel comes from this file, never from memory.
//   node scripts/fetch-night.mjs [YYYYMMDD] [--input=mock.json] [--out=data/night.json]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const teamsFile = JSON.parse(fs.readFileSync(path.join(here, '..', 'data', 'teams.json'), 'utf8'));
const TEAMS = teamsFile.teams;
const ABBR_FIX = teamsFile.espnAbbr || {};

const str = (v) => (typeof v === 'string' ? v.trim() : '');
const num = (v) => {
  const n = Number(typeof v === 'object' && v ? v.value ?? v.displayValue : v);
  return Number.isFinite(n) ? n : null;
};

// The NBA's "night" is the America/New_York calendar date. We run in the IST afternoon
// (~02:00-03:00 ET), so "last night" = ET date of (now - 8h).
export function lastNightET(now = new Date()) {
  const d = new Date(now.getTime() - 8 * 3600 * 1000);
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' })
    .format(d).replaceAll('-', '');
}

const lighten = (hex, mix = 0.5) => {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
  if (!m) return '#FFF4DC';
  const n = parseInt(m[1], 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  const lum = (0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2]) / 255;
  const out = lum >= 0.45 ? ch : ch.map((c) => Math.round(c + (255 - c) * mix));
  return '#' + out.map((c) => c.toString(16).padStart(2, '0')).join('');
};

function teamOf(competitor) {
  const raw = str(competitor?.team?.abbreviation).toUpperCase();
  const abbr = ABBR_FIX[raw] || raw;
  const t = TEAMS[abbr] || {};
  return {
    abbr,
    name: (t.nickname || str(competitor?.team?.name) || abbr).toUpperCase(),
    fullName: t.name || str(competitor?.team?.displayName) || abbr,
    score: num(competitor?.score),
    primary: t.primary || '#444444',
    secondary: t.secondary || '#FFFFFF',
  };
}

// ESPN: competitor.leaders = [{ name:'points', leaders:[{ value, displayValue, athlete:{ id, displayName } }] }, ...]
function leadersOf(competitor) {
  const out = {};
  for (const cat of competitor?.leaders || []) {
    const top = cat?.leaders?.[0];
    if (!top?.athlete) continue;
    out[cat.name] = { id: String(top.athlete.id ?? top.athlete.displayName), name: str(top.athlete.displayName), value: num(top.value ?? top.displayValue) };
  }
  return out;
}

function starOf(home, away, homeLeads, awayLeads) {
  const cands = [
    { team: home, leads: homeLeads },
    { team: away, leads: awayLeads },
  ].filter((c) => c.leads.points && c.leads.points.value != null);
  if (!cands.length) return null;
  cands.sort((a, b) => b.leads.points.value - a.leads.points.value || (b.team.score - a.team.score));
  const { team, leads } = cands[0];
  const p = leads.points;
  const stats = [{ k: 'PTS', v: p.value }];
  for (const [cat, k] of [['rebounds', 'REB'], ['assists', 'AST']]) {
    // Only include a secondary stat when this same player leads that category (the only
    // case ESPN's scoreboard lets us verify). Otherwise we leave it out rather than guess.
    if (leads[cat] && leads[cat].id === p.id) stats.push({ k, v: leads[cat].value });
  }
  const tripleDouble = stats.length === 3 && stats.every((s) => s.v >= 10);
  return { name: p.name, team: team.abbr, teamFull: team.fullName, colour: team.primary, stats, tripleDouble };
}

const lastName = (full) => {
  const parts = full.split(/\s+/);
  const suffix = /^(jr\.?|sr\.?|ii|iii|iv)$/i;
  const core = suffix.test(parts[parts.length - 1]) ? parts.slice(0, -1) : parts;
  return core.length > 1 ? core.slice(1).join(' ') : core[0] || full;
};
const statLine = (stats) => stats.map((s) => `${s.v} ${s.k}`).join(' · ');

export function buildNight(scoreboard, etDate) {
  const events = Array.isArray(scoreboard?.events) ? scoreboard.events : [];
  const seasonType = num(scoreboard?.season?.type) ?? num(events[0]?.season?.type);
  const games = [];
  let pending = 0;

  for (const ev of events) {
    const comp = ev?.competitions?.[0];
    const status = ev?.status || comp?.status;
    const stateName = str(status?.type?.name).toUpperCase();
    if (stateName === 'STATUS_POSTPONED' || stateName === 'STATUS_CANCELED') continue;
    if (status?.type?.state !== 'post' && status?.type?.completed !== true) { pending += 1; continue; }
    const home = comp?.competitors?.find((c) => c.homeAway === 'home');
    const away = comp?.competitors?.find((c) => c.homeAway === 'away');
    if (!home || !away) continue;

    const h = teamOf(home), a = teamOf(away);
    if (h.score == null || a.score == null) continue;
    const period = num(status?.period) || 4;
    const ot = period > 4 ? period - 4 : 0;
    const margin = Math.abs(h.score - a.score);
    const star = starOf(h, a, leadersOf(home), leadersOf(away));
    const headline = str(comp?.notes?.[0]?.headline);
    const winner = h.score > a.score ? h : a;

    let interest = 0;
    const tags = [];
    if (ot) { interest += 30; tags.push('overtime'); }
    if (margin <= 3) { interest += 20; tags.push('thriller'); }
    if (margin >= 30) { interest += 10; tags.push('blowout'); }
    if (star) {
      const pts = star.stats[0].v;
      interest += pts * 0.5;
      if (pts >= 40) { interest += 40; tags.push('40-plus'); }
      if (star.tripleDouble) { interest += 35; tags.push('triple-double'); }
    }
    if (seasonType === 3) { interest += 50; tags.push('playoffs'); }

    const note = headline || (ot ? (ot > 1 ? `${ot} OVERTIMES` : 'OVERTIME THRILLER') : margin <= 3 ? `DECIDED BY ${margin}` : margin >= 30 ? `${margin}-POINT BLOWOUT` : '');
    games.push({
      id: String(ev.id),
      label: ot ? `FINAL/${ot > 1 ? ot : ''}OT` : 'FINAL',
      away: { abbr: a.abbr, name: a.name, score: a.score, primary: a.primary, secondary: a.secondary },
      home: { abbr: h.abbr, name: h.name, score: h.score, primary: h.primary, secondary: h.secondary },
      winner: winner.abbr, margin, overtime: ot, tags, interest,
      star: star ? { name: star.name.toUpperCase(), team: star.team, line: statLine(star.stats) } : { name: `${winner.name} WIN`, team: winner.abbr, line: `${h.score > a.score ? h.score : a.score}-${Math.min(h.score, a.score)}` },
      note: note.toUpperCase(),
      _star: star,
    });
  }

  const ymd = `${etDate.slice(0, 4)}-${etDate.slice(4, 6)}-${etDate.slice(6, 8)}`;
  const d = new Date(`${ymd}T12:00:00Z`);
  const dateLabel = `${d.toLocaleDateString('en-US', { timeZone: 'UTC', weekday: 'short' }).toUpperCase()} · ${d.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric' }).toUpperCase()}`;

  if (!games.length) {
    return { status: pending ? 'incomplete' : 'no-games', etDate: ymd, dateLabel, pendingGames: pending, games: [] };
  }

  games.sort((x, y) => y.interest - x.interest);
  const top = games.find((g) => g._star) || games[0];
  const s = top._star;
  const potn = s && {
    first: s.name.split(/\s+/)[0].toUpperCase(),
    last: lastName(s.name).toUpperCase(),
    team: s.teamFull.toUpperCase(),
    colour: lighten(s.colour),
    note: top.note || `${s.team} WIN ${Math.max(top.home.score, top.away.score)}-${Math.min(top.home.score, top.away.score)}`,
    stats: s.stats,
  };
  const hook = s
    ? { kicker: 'LAST NIGHT IN THE NBA', line1: lastName(s.name).toUpperCase(), line2: statLine(s.stats), sub: top.note || `${games.length} GAMES · ${games.length} FINALS` }
    : { kicker: 'LAST NIGHT IN THE NBA', line1: `${games.length} GAMES`, line2: 'ALL THE SCORES', sub: dateLabel };

  const flags = new Set(games.flatMap((g) => g.tags));
  const facts = games.map((g) => {
    const w = g.winner === g.home.abbr ? g.home : g.away;
    const l = w === g.home ? g.away : g.home;
    return `${w.name} beat ${l.name} ${w.score}-${l.score}${g.overtime ? ' in overtime' : ''}${g.star.line && g._star ? `; ${g.star.name} had ${g.star.line}` : ''}.`;
  });

  return {
    status: pending ? 'incomplete' : 'ok',
    etDate: ymd, dateLabel,
    seasonType, mode: seasonType === 3 ? 'epic' : 'hype',
    flags: [...flags], pendingGames: pending,
    hook, games: games.map(({ _star, interest, ...g }) => g), potn, facts,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const input = args.find((a) => a.startsWith('--input='))?.slice(8);
  const out = args.find((a) => a.startsWith('--out='))?.slice(6) || path.join(here, '..', 'data', 'night.json');
  const etDate = args.find((a) => /^\d{8}$/.test(a)) || lastNightET();

  let json;
  if (input) json = JSON.parse(fs.readFileSync(input, 'utf8'));
  else {
    const url = `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${etDate}&limit=100`;
    const res = await fetch(url, { headers: { 'user-agent': 'hoopx-instagram/1.0' } });
    if (!res.ok) throw new Error(`ESPN responded ${res.status} for ${url}`);
    json = await res.json();
  }
  const night = buildNight(json, etDate);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(night, null, 2));
  console.log(`night ${night.etDate}: status=${night.status}, games=${night.games.length}, pending=${night.pendingGames ?? 0}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((e) => { console.error(e); process.exit(1); });
}
