import React from 'react';
import {
  AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate, spring, Easing, Img, staticFile,
} from 'remotion';

const GOLD = '#FDB927';
const CREAM = '#FFF4DC';
const RED = '#C8102E';
const BG = 'linear-gradient(160deg, #0c0018 0%, #180030 50%, #0c001a 100%)';
const ANTON = 'Anton, sans-serif';
const BEBAS = '"Bebas Neue", sans-serif';
const OUTFIT = 'Outfit, sans-serif';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' };

// Shrink text so long names (e.g. GILGEOUS-ALEXANDER) never overflow the 1080px frame.
// perChar ~ average glyph width as a fraction of font size.
const fit = (text, max, width, perChar = 0.5) =>
  Math.min(max, Math.floor(width / (Math.max(String(text).length, 1) * perChar)));

// Moving diagonal light streaks behind everything
const Streaks = ({ colour = GOLD, speed = 1 }) => {
  const f = useCurrentFrame();
  const lines = [0, 1, 2, 3, 4, 5];
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {lines.map((i) => {
        const x = ((f * 5 * speed + i * 420) % 2600) - 900;
        return (
          <div key={i} style={{
            position: 'absolute', left: x, top: -400, width: 10 + (i % 3) * 8, height: 2800,
            background: `linear-gradient(180deg, transparent, ${colour}, transparent)`,
            opacity: 0.05 + (i % 2) * 0.03, transform: 'rotate(24deg)',
          }} />
        );
      })}
    </AbsoluteFill>
  );
};

const Grain = () => (
  <AbsoluteFill style={{
    background: 'radial-gradient(ellipse at 50% 40%, rgba(85,37,131,0.45), transparent 65%)',
  }} />
);

// Gold bar that sweeps across at the start of a scene
const Wipe = () => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ pointerEvents: 'none', background: BG, opacity: interpolate(f, [0, 8], [1, 0], clamp) }} />;
};

const Count = ({ to, start = 0, dur = 30, style }) => {
  const f = useCurrentFrame();
  const v = Math.round(interpolate(f, [start, start + dur], [0, to], { ...clamp, easing: Easing.out(Easing.cubic) }));
  return <span style={{ fontVariantNumeric: 'tabular-nums', ...style }}>{v}</span>;
};

const Header = ({ text }) => (
  <div style={{
    position: 'absolute', top: 120, width: '100%', textAlign: 'center',
    fontFamily: BEBAS, fontSize: 56, letterSpacing: '0.18em', color: GOLD,
  }}>{text}</div>
);

// ---------- Scenes ----------

const Hook = ({ night }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const slam = spring({ frame: f - 8, fps, config: { damping: 11, stiffness: 160 } });
  const scale = interpolate(slam, [0, 1], [2.6, 1]);
  const flash = interpolate(f, [8, 12, 22], [0, 0.55, 0], clamp);
  const kick = interpolate(f, [0, 10], [-80, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  const l2 = interpolate(f, [24, 36], [0, 100], clamp);
  const sub = interpolate(f, [40, 52], [0, 1], clamp);
  const shake = f > 8 && f < 18 ? Math.sin(f * 3) * (18 - f) : 0;
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Grain /><Streaks speed={1.6} />
      <div style={{
        position: 'absolute', top: 360, width: '100%', textAlign: 'center', transform: `translateY(${kick}px)`,
        fontFamily: BEBAS, fontSize: 64, letterSpacing: '0.22em', color: CREAM, opacity: interpolate(f, [0, 8], [0, 1], clamp),
      }}>{night.hook.kicker}</div>
      <div style={{
        position: 'absolute', top: 520, width: '100%', textAlign: 'center',
        transform: `scale(${scale}) translateX(${shake}px)`, opacity: f < 8 ? 0 : 1,
        fontFamily: ANTON, fontSize: fit(night.hook.line1, 340, 1000, 0.52), lineHeight: 1, color: GOLD,
        textShadow: '0 0 60px rgba(253,185,39,0.55), 0 12px 0 #3a1500',
      }}>{night.hook.line1}</div>
      <div style={{
        position: 'absolute', top: 920, width: '100%', textAlign: 'center',
        clipPath: `inset(0 ${100 - l2}% 0 0)`,
        fontFamily: ANTON, fontSize: fit(night.hook.line2, 132, 1000, 0.5), color: CREAM, letterSpacing: '0.02em',
      }}>{night.hook.line2}</div>
      <div style={{
        position: 'absolute', top: 1160, left: '50%', transform: `translateX(-50%) scale(${0.9 + sub * 0.1})`,
        opacity: sub, background: RED, color: '#fff', padding: '20px 44px', borderRadius: 14,
        fontFamily: BEBAS, fontSize: fit(night.hook.sub, 72, 960, 0.36), letterSpacing: '0.12em', whiteSpace: 'nowrap',
      }}>{night.hook.sub}</div>
      <div style={{
        position: 'absolute', bottom: 160, width: '100%', textAlign: 'center',
        fontFamily: OUTFIT, fontWeight: 600, fontSize: 44, color: 'rgba(255,244,220,0.8)', opacity: sub,
      }}>{night.dateLabel}</div>
    </AbsoluteFill>
  );
};

const isLight = (c) => ['#C4CED4', '#EEE1C6', '#FDB927', '#FFC72C', '#FFFFFF'].includes((c || '').toUpperCase());

// Photo (when we have one) or a team-colour badge with the team code.
const Portrait = ({ photo, team, size, ring = GOLD }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
    background: `radial-gradient(circle at 50% 30%, ${team.secondary} 0%, ${team.primary} 75%)`,
    border: `${Math.max(6, size * 0.025)}px solid ${ring}`, boxSizing: 'border-box',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    {photo ? (
      <Img src={staticFile(`players/${photo}`)} style={{ width: '135%', height: '135%', objectFit: 'cover', objectPosition: '50% 12%', marginTop: size * 0.06 }} />
    ) : (
      <span style={{ fontFamily: ANTON, fontSize: size * 0.38, color: isLight(team.primary) ? '#0b0b0b' : '#fff', letterSpacing: '0.02em' }}>{team.abbr}</span>
    )}
  </div>
);

const TeamPanel = ({ team, top, won, enter, side }) => {
  const dim = won ? 1 : 0.85;
  const x = interpolate(enter, [0, 1], [side === 'left' ? -1100 : 1100, 0]);
  const ink = isLight(team.primary) ? '#0b0b0b' : '#ffffff';
  return (
    <div style={{
      position: 'absolute', left: 60, right: 60, top, height: 290, transform: `translateX(${x}px)`,
      background: `linear-gradient(110deg, ${team.primary} 0%, ${team.primary} 44%, ${team.secondary} 44%, ${team.secondary} 48%, ${team.primary} 48%)`,
      borderRadius: 28, overflow: 'hidden',
      boxShadow: won ? `0 0 0 6px ${GOLD}` : 'none',
    }}>
      <div style={{ position: 'absolute', left: 44, top: 26, fontFamily: ANTON, fontSize: 124, color: ink, lineHeight: 1, opacity: dim }}>{team.abbr}</div>
      <div style={{ position: 'absolute', left: 48, bottom: 30, fontFamily: BEBAS, fontSize: fit(team.name, 54, 300, 0.5), letterSpacing: '0.12em', color: ink, opacity: dim }}>{team.name}</div>
      <div style={{
        position: 'absolute', right: 44, top: 44, fontFamily: ANTON, fontSize: 170, lineHeight: 1,
        color: won ? (isLight(team.primary) ? '#0b0b0b' : GOLD) : ink, opacity: dim,
      }}><Count to={team.score} start={14} dur={46} /></div>
      {won && (
        <div style={{
          position: 'absolute', right: 48, bottom: 22, fontFamily: BEBAS, fontSize: 40, letterSpacing: '0.16em',
          background: GOLD, color: '#1a0a00', padding: '2px 16px', borderRadius: 8,
        }}>WIN</div>
      )}
    </div>
  );
};

// Quarter-by-quarter table. Only rendered when ESPN gave us the quarter scores.
const LineScore = ({ game, appear }) => {
  const q = game.away.quarters || [];
  if (!q.length) return null;
  const cols = q.map((_, i) => (i < 4 ? `Q${i + 1}` : i === 4 ? 'OT' : `${i - 3}OT`)).concat('T');
  const row = (t, bold) => (
    <div style={{ display: 'flex', alignItems: 'center', height: 76 }}>
      <div style={{ width: 150, fontFamily: ANTON, fontSize: 52, color: bold ? GOLD : CREAM }}>{t.abbr}</div>
      {(t.quarters || []).concat(t.score).map((v, i, arr) => (
        <div key={i} style={{ flex: 1, textAlign: 'center', fontFamily: ANTON, fontSize: i === arr.length - 1 ? 58 : 50, color: i === arr.length - 1 ? (bold ? GOLD : CREAM) : 'rgba(255,244,220,0.85)' }}>{v}</div>
      ))}
    </div>
  );
  return (
    <div style={{
      position: 'absolute', left: 60, right: 60, top: 880, opacity: appear, transform: `translateY(${(1 - appear) * 40}px)`,
      background: 'rgba(255,244,220,0.08)', border: '3px solid rgba(253,185,39,0.45)', borderRadius: 24, padding: '14px 36px',
    }}>
      <div style={{ display: 'flex', height: 56, alignItems: 'center', borderBottom: '2px solid rgba(253,185,39,0.35)' }}>
        <div style={{ width: 150, fontFamily: BEBAS, fontSize: 40, letterSpacing: '0.14em', color: GOLD }}>QUARTERS</div>
        {cols.map((c, i) => <div key={i} style={{ flex: 1, textAlign: 'center', fontFamily: BEBAS, fontSize: 40, letterSpacing: '0.1em', color: GOLD }}>{c}</div>)}
      </div>
      {row(game.away, game.away.score > game.home.score)}
      {row(game.home, game.home.score > game.away.score)}
    </div>
  );
};

const teamByAbbr = (game, abbr) => (game.home.abbr === abbr ? game.home : game.away);

const GameCard = ({ game, index, total }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame: f - 4, fps, config: { damping: 15, stiffness: 120 } });
  const b = spring({ frame: f - 14, fps, config: { damping: 15, stiffness: 120 } });
  const lineIn = interpolate(f, [90, 112], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const starIn = interpolate(f, [150, 176], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const note = interpolate(f, [210, 228], [0, 1], clamp);
  const awayWon = game.away.score > game.home.score;
  const vs = spring({ frame: f - 24, fps, config: { damping: 9 } });
  const hasLine = (game.away.quarters || []).length > 0;
  const starTop = hasLine ? 1190 : 920;
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Grain /><Streaks colour={game.away.primary === '#C4CED4' ? '#C4CED4' : GOLD} speed={0.7} />
      <Header text={`${game.label || 'FINAL'} · GAME ${index + 1} OF ${total}`} />
      <TeamPanel team={game.away} top={230} won={awayWon} enter={a} side="left" />
      <div style={{ position: 'absolute', top: 528, width: '100%', textAlign: 'center', transform: `scale(${vs})`, fontFamily: BEBAS, fontSize: 52, letterSpacing: '0.2em', color: CREAM }}>AT</div>
      <TeamPanel team={game.home} top={590} won={!awayWon} enter={b} side="right" />
      {hasLine && <LineScore game={game} appear={lineIn} />}
      <div style={{
        position: 'absolute', left: 60, right: 60, top: starTop, opacity: starIn, transform: `translateY(${(1 - starIn) * 60}px)`,
        background: CREAM, borderRadius: 28, padding: '34px 40px', display: 'flex', alignItems: 'center', gap: 36,
      }}>
        <Portrait photo={game.star.photo} team={teamByAbbr(game, game.star.team)} size={300} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: BEBAS, fontSize: 42, letterSpacing: '0.16em', color: '#5b1f8a' }}>TOP PERFORMER · {game.star.team}</div>
          <div style={{ fontFamily: ANTON, fontSize: fit(game.star.name, 84, 560, 0.5), color: '#12001f', lineHeight: 1.15 }}>{game.star.name}</div>
          <div style={{ fontFamily: ANTON, fontSize: fit(game.star.line, 64, 560, 0.5), color: RED, lineHeight: 1.15 }}>{game.star.line}</div>
        </div>
      </div>
      {(game.leaders || []).length > 0 && (
        <div style={{ position: 'absolute', left: 60, right: 60, top: starTop + 400, opacity: note, fontFamily: BEBAS, fontSize: 44, letterSpacing: '0.1em', color: CREAM, textAlign: 'center', lineHeight: 1.4 }}>
          {game.leaders.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      )}
      <div style={{
        position: 'absolute', bottom: 110, width: '100%', textAlign: 'center', opacity: note,
        fontFamily: BEBAS, fontSize: fit(game.note || '', 54, 980, 0.34), letterSpacing: '0.08em', color: GOLD,
      }}>{game.note}</div>
    </AbsoluteFill>
  );
};

const PlayerOfNight = ({ night }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = night.potn;
  const team = { abbr: p.teamAbbr || '', primary: p.teamPrimary || p.colour, secondary: p.teamSecondary || '#111111' };
  const title = interpolate(f, [0, 14], [0, 1], clamp);
  const pic = spring({ frame: f - 8, fps, config: { damping: 12 } });
  const first = spring({ frame: f - 30, fps, config: { damping: 13 } });
  const last = spring({ frame: f - 40, fps, config: { damping: 13 } });
  const ring = (f % 60) / 60;
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Grain /><Streaks colour={p.colour} speed={0.6} />
      <div style={{ position: 'absolute', top: 150, width: '100%', textAlign: 'center', opacity: title, fontFamily: BEBAS, fontSize: 78, letterSpacing: '0.2em', color: GOLD }}>PLAYER OF THE NIGHT</div>
      <div style={{ position: 'absolute', top: 270, left: 540 - 220, transform: `scale(${pic})` }}>
        <Portrait photo={p.photo} team={team} size={440} />
      </div>
      <div style={{ position: 'absolute', top: 750, width: '100%', textAlign: 'center', transform: `translateX(${interpolate(first, [0, 1], [-900, 0])}px)`, fontFamily: ANTON, fontSize: fit(p.first, 120, 1000, 0.5), color: CREAM, lineHeight: 1 }}>{p.first}</div>
      <div style={{ position: 'absolute', top: 880, width: '100%', textAlign: 'center', transform: `translateX(${interpolate(last, [0, 1], [900, 0])}px)`, fontFamily: ANTON, fontSize: fit(p.last, 140, 1000, 0.5), color: p.colour, lineHeight: 1, textShadow: '0 0 50px rgba(255,255,255,0.25)' }}>{p.last}</div>
      <div style={{ position: 'absolute', top: 1040, width: '100%', textAlign: 'center', fontFamily: OUTFIT, fontWeight: 600, fontSize: 42, letterSpacing: '0.08em', color: 'rgba(255,244,220,0.85)', opacity: interpolate(f, [50, 66], [0, 1], clamp) }}>{p.team}</div>
      <div style={{ position: 'absolute', top: 1150, left: 60, right: 60, display: 'flex', gap: 28 }}>
        {p.stats.map((s, i) => {
          const pop = spring({ frame: f - (80 + i * 14), fps, config: { damping: 10 } });
          return (
            <div key={s.k} style={{
              flex: 1, height: 330, borderRadius: 28, transform: `scale(${pop})`,
              background: i === 0 ? GOLD : 'rgba(255,244,220,0.08)', border: i === 0 ? 'none' : `4px solid ${GOLD}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}>
              <Count to={s.v} start={84 + i * 14} dur={40} style={{ fontFamily: ANTON, fontSize: 190, lineHeight: 1, color: i === 0 ? '#1a0a00' : CREAM }} />
              <div style={{ fontFamily: BEBAS, fontSize: 70, letterSpacing: '0.16em', color: i === 0 ? '#1a0a00' : GOLD }}>{s.k}</div>
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', top: 1560, width: '100%', textAlign: 'center', fontFamily: BEBAS, fontSize: fit(p.note, 66, 980, 0.36), letterSpacing: '0.1em', color: CREAM, opacity: interpolate(f, [150, 170], [0, 1], clamp) }}>{p.note}</div>
    </AbsoluteFill>
  );
};

const Outro = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - 4, fps, config: { damping: 12 } });
  const line = interpolate(f, [18, 30], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Grain /><Streaks speed={2} />
      <div style={{
        position: 'absolute', top: 640, width: '100%', textAlign: 'center', transform: `scale(${s})`,
        fontFamily: ANTON, fontSize: 260, lineHeight: 1, color: CREAM,
      }}>HOOP<span style={{ color: RED }}>X</span></div>
      <div style={{
        position: 'absolute', top: 960, width: '100%', textAlign: 'center', opacity: line,
        fontFamily: BEBAS, fontSize: 70, letterSpacing: '0.14em', color: GOLD,
      }}>FULL STATS AT HOOPXNBA.COM</div>
      <div style={{
        position: 'absolute', bottom: 150, width: '100%', textAlign: 'center', opacity: line,
        fontFamily: OUTFIT, fontWeight: 500, fontSize: 36, color: 'rgba(255,244,220,0.75)',
      }}>Unofficial fan account · not affiliated with the NBA</div>
    </AbsoluteFill>
  );
};

// Compact scoreboard of every game, shown after the featured games.
const AllScores = ({ night }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rows = night.games;
  const rowH = Math.min(150, Math.floor(1250 / Math.max(rows.length, 1)));
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Grain /><Streaks speed={1.2} />
      <Header text="ALL FINAL SCORES" />
      {rows.map((g, i) => {
        const pop = spring({ frame: f - (6 + i * 4), fps, config: { damping: 14 } });
        const awayWon = g.away.score > g.home.score;
        const sz = Math.floor(rowH * 0.5);
        return (
          <div key={i} style={{
            position: 'absolute', left: 60, right: 60, top: 280 + i * rowH, height: rowH - 14,
            transform: `translateX(${interpolate(pop, [0, 1], [i % 2 ? 900 : -900, 0])}px)`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 36px', borderRadius: 20, background: 'rgba(255,244,220,0.08)',
            border: `3px solid ${g.away.primary === '#000000' ? GOLD : g.away.primary}`,
            fontFamily: ANTON, fontSize: sz, color: CREAM,
          }}>
            <span style={{ color: awayWon ? GOLD : CREAM }}>{g.away.abbr} {g.away.score}</span>
            <span style={{ fontFamily: BEBAS, fontSize: sz * 0.6, color: 'rgba(255,244,220,0.6)' }}>{g.label || 'FINAL'}</span>
            <span style={{ color: awayWon ? CREAM : GOLD }}>{g.home.score} {g.home.abbr}</span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const FEATURED_MAX = 3;

export const buildScenes = (night) => {
  const featured = night.games.slice(0, FEATURED_MAX);
  const list = [{ key: 'hook', len: 150, el: <Hook night={night} /> }];
  featured.forEach((g, i) => list.push({ key: `g${i}`, len: 270, el: <GameCard game={g} index={i} total={night.games.length} /> }));
  if (night.games.length > featured.length) list.push({ key: 'all', len: 210, el: <AllScores night={night} /> });
  if (night.potn) list.push({ key: 'potn', len: 240, el: <PlayerOfNight night={night} /> });
  list.push({ key: 'outro', len: 120, el: <Outro /> });
  return list;
};

export const totalFrames = (night) => buildScenes(night).reduce((a, s) => a + s.len, 0);

export const Reel = ({ night }) => {
  let at = 0;
  return (
    <AbsoluteFill style={{ background: '#0c0018' }}>
      {buildScenes(night).map((s) => {
        const from = at; at += s.len;
        return (
          <Sequence key={s.key} from={from} durationInFrames={s.len}>
            {s.el}
            {from > 0 && <Wipe />}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export {
  GOLD, CREAM, RED, BG, ANTON, BEBAS, OUTFIT, clamp, fit, Streaks, Grain, Wipe, Count, Header, Portrait, isLight, Outro,
};
