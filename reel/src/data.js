// Sample night: Wed 11 Nov 2026 (US). Numbers from AP / Yardbarker recaps.
export const night = {
  dateLabel: 'WED · NOV 11',
  hook: {
    kicker: 'LAST NIGHT IN THE NBA',
    line1: 'WEMBY',
    line2: '32 PTS · 5 BLK',
    sub: 'SPURS WIN 10 STRAIGHT',
  },
  games: [
    {
      away: { abbr: 'LAL', name: 'LAKERS', score: 123, primary: '#552583', secondary: '#FDB927' },
      home: { abbr: 'MIL', name: 'BUCKS', score: 112, primary: '#00471B', secondary: '#EEE1C6' },
      star: { name: 'LUKA DONČIĆ', team: 'LAL', line: '32 PTS · 5 REB · 5 AST' },
      note: 'LAKERS WIN 7 STRAIGHT · 11-2',
    },
    {
      away: { abbr: 'SAS', name: 'SPURS', score: 124, primary: '#C4CED4', secondary: '#000000' },
      home: { abbr: 'CHI', name: 'BULLS', score: 119, primary: '#CE1141', secondary: '#000000' },
      star: { name: 'VICTOR WEMBANYAMA', team: 'SAS', line: '32 PTS · 9 REB · 5 BLK' },
      note: 'SPURS 10 STRAIGHT · BULLS LOSE 8 IN A ROW',
    },
  ],
  potn: {
    first: 'VICTOR',
    last: 'WEMBANYAMA',
    team: 'SAN ANTONIO SPURS',
    colour: '#C4CED4',
    stats: [
      { v: 32, k: 'PTS' },
      { v: 9, k: 'REB' },
      { v: 5, k: 'BLK' },
    ],
  },
};
