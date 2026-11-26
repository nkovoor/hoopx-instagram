// Builds reel/carousel-props.json for a carousel.   node scripts/prepare-carousel.mjs week|six
// prints slides=N
import fs from 'node:fs';
import path from 'node:path';

const kind = process.argv[2];
const week = JSON.parse(fs.readFileSync('data/week.json', 'utf8'));
const teams = JSON.parse(fs.readFileSync('data/teams.json', 'utf8')).teams;
const slug = (n) => n.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const photo = (n) => (fs.existsSync(`reel/public/players/${slug(n)}.png`) ? `${slug(n)}.png` : null);
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();
const col = (abbr) => ({ primary: teams[abbr]?.primary || '#552583', secondary: teams[abbr]?.secondary || '#FDB927' });
const label = (n) => n.dateLabel.replace(' · ', ' ');
const first = week.nights[0], last = week.nights.at(-1);
const range = `${first?.dateLabel.split(' · ')[1] || ''} – ${last?.dateLabel.split(' · ')[1] || ''}`;

const endD = new Date(`${String(week.end).slice(0, 4)}-${String(week.end).slice(4, 6)}-${String(week.end).slice(6, 8)}T00:00:00Z`);
const weekNo = Math.floor(endD.getTime() / (7 * 86400000));
const theme = weekNo % 5;
const nm = (n) => n.toLowerCase().replace(/(^|[\s-])(\w)/g, (m, a, b) => a + b.toUpperCase());
const lastName = (n) => n.split(' ').slice(-1)[0];
const allGames = week.nights.flatMap((n) => n.games.map((g) => ({ ...g, date: n.dateLabel })));
let data;
if (kind === 'week') {
  const pick = (arr) => arr[weekNo % arr.length];
  const pts = (g) => Number((g.star?.line || '').match(/^(\d+) PTS/)?.[1] || 0);
  const seen = new Set();
  const top = [...allGames].filter((g) => g.star).sort((a, b) => pts(b) - pts(a)).filter((g) => !seen.has(g.star.name) && seen.add(g.star.name)).slice(0, 5).map((g) => ({
    name: g.star.name, team: g.star.team, line: g.star.line, date: g.date, photo: photo(g.star.name), ...col(g.star.team),
  }));
  const game = (g) => ({ away: g.away.abbr, home: g.home.abbr, as: g.away.score, hs: g.home.score, label: g.label, date: g.date, winner: g.winner });
  const uniq = (arr) => { const k = new Set(); return arr.filter((g) => { const id = `${g.away.abbr}${g.home.abbr}${g.date}`; return !k.has(id) && k.add(id); }); };
  const cl = uniq([...allGames].sort((a, b) => a.margin - b.margin)).slice(0, 4), bl = uniq([...allGames].sort((a, b) => b.margin - a.margin)).slice(0, 4);
  const tp = top[0];
  const tpPts = tp ? tp.line.split(' ')[0] : '';
  const full = (a) => (teams[a]?.name || a);
  data = {
    theme,
    title: tp ? pick([`${lastName(tp.name)} DROPPED ${tpPts}`, `THE WEEK ${lastName(tp.name)} WENT OFF`, `${tpPts} POINTS. ${lastName(tp.name)}.`]) : 'WEEK IN REVIEW',
    subtitle: pick(['EVERYTHING YOU MISSED THIS WEEK', 'THE BEST OF THE NBA, IN 5 SLIDES', 'THE WEEK THE NBA WENT CRAZY']),
    titles: { top: pick(['THE WEEK\'S BEST', 'BIGGEST NIGHTS', 'MVP-LEVEL NIGHTS']), closest: pick(['NAIL-BITERS', 'DOWN TO THE WIRE', 'HEART-STOPPERS']), blowouts: pick(['BEATDOWNS', 'NO CONTEST', 'WIPEOUTS']) },
    captions: {
      top: tp ? `${nm(tp.name)} led the week with ${tp.line}.` : '',
      closest: cl[0] ? `${cl[0].away.abbr === cl[0].winner ? full(cl[0].away.abbr) : full(cl[0].home.abbr)} survived by just ${cl[0].margin}.` : '',
      blowouts: bl[0] ? `${full(bl[0].winner)} won by ${bl[0].margin}, the biggest margin of the week.` : '',
    },
    range, games: allGames.length, ot: allGames.filter((g) => g.overtime).length, nights: week.nights.length,
    top, closest: cl.map(game),
    blowouts: bl.map(game),
  };
  fs.writeFileSync('reel/carousel-props.json', JSON.stringify({ kind, data, slide: 0 }));
  console.log('slides=5');
} else {
  const SIX = [['Shai Gilgeous-Alexander', 'OKC'], ['Victor Wembanyama', 'SAS'], ['Anthony Edwards', 'MIN'], ['Luka Dončić', 'LAL'], ['LeBron James', 'LAL'], ['Stephen Curry', 'GSW']];
  const players = SIX.map(([name, dflt]) => {
    const N = norm(name);
    let found = null;
    for (const g of [...allGames].reverse()) {
      if (g.star && norm(g.star.name) === N) { found = { team: g.star.team, line: g.star.line, won: g.winner === g.star.team, g }; break; }
      const l = (g.leaders || []).find((x) => norm(x).includes(N));
      if (l) { const t = l.split(' · ')[0]; found = { team: t, line: l.split(' · ').slice(2).join(' · '), won: g.winner === t, g }; break; }
    }
    const team = found?.team || dflt;
    const caption = found ? `${nm(name.toUpperCase())}: ${found.line}, a ${found.won ? 'win' : 'loss'} on ${found.g.date.split(' · ')[0]}.` : `${nm(name.toUpperCase())} had no top-scorer line this week.`;
    return {
      caption, name, photo: photo(name), team, ...col(team), line: found?.line || null, date: found?.g.date || null,
      result: found ? `${found.won ? 'W' : 'L'} ${found.g.away.abbr} ${found.g.away.score} - ${found.g.home.abbr} ${found.g.home.score}` : null,
    };
  });
  data = { theme, subtitle: ['SIX STARS. ONE WEEK.', 'WHO CAME THROUGH?', 'HOW OUR SIX DID'][weekNo % 3], range, players };
  fs.writeFileSync('reel/carousel-props.json', JSON.stringify({ kind, data, slide: 0 }));
  console.log(`slides=${players.length + 2}`);
}
