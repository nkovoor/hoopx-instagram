import test from 'node:test';
import assert from 'node:assert/strict';
import { buildNight, lastNightET } from '../scripts/fetch-night.mjs';

const leader = (name, id, value) => ({ athlete: { id, displayName: name }, value, displayValue: String(value) });
const cats = (pts, reb, ast) => [
  { name: 'points', leaders: [pts] }, ...(reb ? [{ name: 'rebounds', leaders: [reb] }] : []), ...(ast ? [{ name: 'assists', leaders: [ast] }] : []),
];
const comp = (abbr, score, homeAway, leaders) => ({ homeAway, score: String(score), team: { abbreviation: abbr, displayName: abbr }, leaders });
const ev = (id, home, away, { state = 'post', period = 4, name = 'STATUS_FINAL', notes } = {}) => ({
  id, status: { period, type: { name, state, completed: state === 'post' } },
  competitions: [{ competitors: [home, away], notes }],
});

const sga = leader('Shai Gilgeous-Alexander', '1', 45);
const board = {
  season: { type: 2 },
  events: [
    ev('1', comp('POR', 128, 'home', cats(leader('Deni Avdija', '9', 30))), comp('OKC', 131, 'away', cats(sga, leader('Shai Gilgeous-Alexander', '1', 8).constructor === Object ? { ...leader('Shai Gilgeous-Alexander', '1', 6) } : null, { ...leader('Shai Gilgeous-Alexander', '1', 8) })), { period: 5 }),
    ev('2', comp('NY', 99, 'home', cats(leader('Karl-Anthony Towns', '3', 20))), comp('BOS', 130, 'away', cats(leader('Jayson Tatum', '4', 31)))),
    ev('3', comp('LAL', 0, 'home', []), comp('DEN', 0, 'away', []), { state: 'in', name: 'STATUS_IN_PROGRESS' }),
    ev('4', comp('MIA', 0, 'home', []), comp('ATL', 0, 'away', []), { state: 'pre', name: 'STATUS_POSTPONED' }),
  ],
};

test('lastNightET gives the ET calendar date 8h earlier', () => {
  assert.equal(lastNightET(new Date('2026-11-16T07:30:00Z')), '20261115');
});

test('builds night data: OT game first, abbreviations fixed, pending game flagged', () => {
  const n = buildNight(board, '20261115');
  assert.equal(n.status, 'incomplete');
  assert.equal(n.pendingGames, 1);
  assert.equal(n.games.length, 2);
  assert.equal(n.games[0].label, 'FINAL/OT');
  assert.equal(n.games[0].away.abbr, 'OKC');
  assert.equal(n.games.find((g) => g.id === '2').home.abbr, 'NYK'); // NY -> NYK
  assert.equal(n.games.find((g) => g.id === '2').margin, 31);
  assert.ok(n.games.find((g) => g.id === '2').tags.includes('blowout'));
  assert.equal(n.dateLabel, 'SUN · NOV 15');
  assert.equal(n.potn.first, 'SHAI');
  assert.equal(n.potn.last, 'GILGEOUS-ALEXANDER');
  assert.deepEqual(n.potn.stats.map((s) => s.k), ['PTS', 'REB', 'AST']);
  assert.equal(n.hook.line2, '45 PTS · 6 REB · 8 AST');
});

test('only claims secondary stats when the same player leads that category', () => {
  const n = buildNight({ season: { type: 2 }, events: [ev('9', comp('POR', 100, 'home', cats(leader('A One', '7', 20))), comp('OKC', 110, 'away', cats(leader('B Two', '8', 25), leader('C Three', '5', 12))))] }, '20261115');
  assert.equal(n.games[0].star.line, '25 PTS');
});

test('playoffs switch mode to epic', () => {
  const n = buildNight({ season: { type: 3 }, events: [board.events[1]] }, '20261115');
  assert.equal(n.mode, 'epic');
  assert.ok(n.flags.includes('playoffs'));
});

test('no events -> no-games', () => {
  assert.equal(buildNight({ events: [] }, '20261115').status, 'no-games');
});

test('quarter scores and photo file are carried into the night data', () => {
  const home = comp('SA', 124, 'home', cats(leader('Victor Wembanyama', '1', 32)));
  home.linescores = [{ value: 28 }, { value: 34 }, { value: 30 }, { value: 32 }];
  const away = comp('CHI', 119, 'away', cats(leader('Josh Giddey', '5', 22)));
  away.linescores = [{ value: 30 }, { value: 28 }, { value: 31 }, { value: 30 }];
  const n = buildNight({ season: { type: 2 }, events: [ev('5', home, away)] }, '20261115');
  assert.deepEqual(n.games[0].home.quarters, [28, 34, 30, 32]);
  assert.equal(n.games[0].star.photo, 'victor-wembanyama.png');
  assert.equal(n.potn.photo, 'victor-wembanyama.png');
});
