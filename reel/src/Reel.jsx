import React from 'react';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';
import {
  AbsoluteFill, Sequence, Audio, useCurrentFrame, useVideoConfig, interpolate, spring, Easing, Img, staticFile,
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
        const x = ((f * 8 * speed + i * 420) % 2600) - 900;
        return (
          <div key={i} style={{
            position: 'absolute', left: x, top: -400, width: 10 + (i % 3) * 8, height: 2800,
            background: `linear-gradient(180deg, transparent, ${colour}, transparent)`,
            opacity: 0.08 + (i % 2) * 0.04, transform: 'rotate(24deg)',
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
  const x = interpolate(f, [0, 16], [-1500, 1700], { ...clamp, easing: Easing.bezier(0.65, 0, 0.35, 1) });
  const fade = interpolate(f, [0, 10], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', overflow: 'hidden' }}>
      <AbsoluteFill style={{ background: BG, opacity: fade }} />
      <div style={{
        position: 'absolute', top: -200, left: x, width: 900, height: 2400, transform: 'skewX(-16deg)',
        background: 'linear-gradient(90deg, transparent, rgba(253,185,39,0.55) 50%, transparent)', opacity: f < 17 ? 1 : 0,
      }} />
    </AbsoluteFill>
  );
};

// One ring that draws itself around a portrait, then holds with a soft glow
const DrawRing = ({ size, start = 0, dur = 28, colour = GOLD }) => {
  const f = useCurrentFrame();
  const r = size / 2 + 22;
  const c = 2 * Math.PI * r;
  const p = interpolate(f, [start, start + dur], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const glow = 0.5 + 0.5 * Math.sin((f - start) / 18);
  return (
    <svg width={size + 90} height={size + 90} viewBox={`${-(size + 90) / 2} ${-(size + 90) / 2} ${size + 90} ${size + 90}`} style={{ position: 'absolute', left: -45, top: -45, overflow: 'visible' }}>
      <circle r={r} fill="none" stroke={colour} strokeWidth={6} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - p)} transform="rotate(-90)" style={{ filter: `drop-shadow(0 0 ${10 + glow * 14}px ${colour})` }} />
    </svg>
  );
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
  const p = night.potn;
  const team = p ? { abbr: p.teamAbbr || '', primary: p.teamPrimary || p.colour, secondary: p.teamSecondary || '#111111' } : null;
  const day = night.dayName || (night.dateLabel || '').split(' · ')[0];
  const dateLong = night.dateLong || (night.dateLabel || '').split(' · ')[1] || '';
  const k = interpolate(f, [0, 10], [0, 1], clamp);
  const dSlam = spring({ frame: f - 6, fps, config: { damping: 11, stiffness: 170 } });
  const d2 = interpolate(f, [16, 28], [0, 100], clamp);
  const pic = spring({ frame: f - 22, fps, config: { damping: 12 } });
  const n1 = spring({ frame: f - 40, fps, config: { damping: 13 } });
  const n2 = spring({ frame: f - 48, fps, config: { damping: 13 } });
  const stat = interpolate(f, [62, 74], [0, 1], clamp);
  const sub = interpolate(f, [80, 92], [0, 1], clamp);
  const y0 = p ? 0 : 160;
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Grain /><Streaks speed={1.6} />
      <div style={{ position: 'absolute', top: 100, width: '100%', textAlign: 'center', opacity: k, fontFamily: BEBAS, fontSize: 112, letterSpacing: '0.2em', color: CREAM }}>LAST NIGHT</div>
      <div style={{ position: 'absolute', top: 215, width: '100%', textAlign: 'center', transform: `scale(${interpolate(dSlam, [0, 1], [2.4, 1])})`, opacity: f < 6 ? 0 : 1, fontFamily: ANTON, fontSize: fit(day, 200, 1000, 0.55), lineHeight: 1, color: GOLD, textShadow: '0 0 60px rgba(253,185,39,0.55), 0 10px 0 #3a1500' }}>{day}</div>
      <div style={{ position: 'absolute', top: 430, width: '100%', textAlign: 'center', clipPath: `inset(0 ${100 - d2}% 0 0)`, fontFamily: ANTON, fontSize: fit(dateLong, 120, 1000, 0.5), lineHeight: 1, color: CREAM, letterSpacing: '0.03em' }}>{dateLong}</div>
      {p ? (
        <>
          <div style={{ position: 'absolute', top: 600, left: 540 - 170, transform: `scale(${pic})` }}>
            <Portrait photo={p.photo} team={team} size={340} />
            <DrawRing size={340} start={26} />
          </div>
          <div style={{ position: 'absolute', top: 960, width: '100%', textAlign: 'center', transform: `translateX(${interpolate(n1, [0, 1], [-900, 0])}px)`, fontFamily: ANTON, fontSize: fit(p.first, 96, 1000, 0.5), color: CREAM, lineHeight: 1 }}>{p.first}</div>
          <div style={{ position: 'absolute', top: 1065, width: '100%', textAlign: 'center', transform: `translateX(${interpolate(n2, [0, 1], [900, 0])}px)`, fontFamily: ANTON, fontSize: fit(p.last, 190, 1000, 0.52), color: GOLD, lineHeight: 1, textShadow: '0 0 50px rgba(253,185,39,0.4), 0 8px 0 #3a1500' }}>{p.last}</div>
          <div style={{ position: 'absolute', top: 1290, width: '100%', textAlign: 'center', opacity: stat, fontFamily: ANTON, fontSize: fit(night.hook.line2, 100, 1000, 0.5), color: CREAM }}>{night.hook.line2}</div>
        </>
      ) : (
        <>
          <div style={{ position: 'absolute', top: 700, width: '100%', textAlign: 'center', transform: `scale(${pic})`, fontFamily: ANTON, fontSize: fit(night.hook.line1, 260, 1000, 0.52), color: GOLD, lineHeight: 1 }}>{night.hook.line1}</div>
          <div style={{ position: 'absolute', top: 1010, width: '100%', textAlign: 'center', opacity: stat, fontFamily: ANTON, fontSize: fit(night.hook.line2, 120, 1000, 0.5), color: CREAM }}>{night.hook.line2}</div>
        </>
      )}
      <div style={{ position: 'absolute', top: 1470 - y0 * 0, left: '50%', transform: `translateX(-50%) scale(${0.9 + sub * 0.1})`, opacity: sub, background: RED, color: '#fff', padding: '20px 44px', borderRadius: 14, fontFamily: BEBAS, fontSize: fit(night.hook.sub, 68, 960, 0.36), letterSpacing: '0.12em', whiteSpace: 'nowrap' }}>{night.hook.sub}</div>
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
      position: 'absolute', left: 60, right: 60, top, height: 330, transform: `translateX(${x}px)`,
      background: `linear-gradient(110deg, ${team.primary} 0%, ${team.primary} 44%, ${team.secondary} 44%, ${team.secondary} 48%, ${team.primary} 48%)`,
      borderRadius: 28, overflow: 'hidden',
      boxShadow: won ? `0 0 0 6px ${GOLD}` : 'none',
    }}>
      <div style={{ position: 'absolute', left: 44, top: 22, fontFamily: ANTON, fontSize: 118, color: ink, lineHeight: 1, opacity: dim }}>{team.abbr}</div>
      <div style={{ position: 'absolute', left: 48, bottom: 26, width: 330, opacity: dim, color: ink, lineHeight: 1.05 }}>
        {team.city ? <div style={{ fontFamily: BEBAS, fontSize: fit(team.city, 46, 330, 0.36), letterSpacing: '0.1em' }}>{team.city}</div> : null}
        <div style={{ fontFamily: ANTON, fontSize: fit(team.nick || team.name, 60, 300, 0.56), letterSpacing: '0.04em' }}>{team.nick || team.name}</div>
      </div>
      <div style={{
        position: 'absolute', right: 44, top: 60, fontFamily: ANTON, fontSize: 180, lineHeight: 1,
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
    <div style={{ display: 'flex', alignItems: 'center', height: 100 }}>
      <div style={{ width: 170, fontFamily: ANTON, fontSize: 60, color: bold ? GOLD : CREAM }}>{t.abbr}</div>
      {(t.quarters || []).concat(t.score).map((v, i, arr) => (
        <div key={i} style={{ flex: 1, textAlign: 'center', fontFamily: ANTON, fontSize: i === arr.length - 1 ? 66 : 58, color: i === arr.length - 1 ? (bold ? GOLD : CREAM) : 'rgba(255,244,220,0.85)' }}>{v}</div>
      ))}
    </div>
  );
  return (
    <div style={{
      position: 'absolute', left: 60, right: 60, top: 1050, opacity: appear, transform: `translateY(${(1 - appear) * 40}px)`,
      background: 'rgba(255,244,220,0.08)', border: '3px solid rgba(253,185,39,0.45)', borderRadius: 24, padding: '16px 36px 22px',
    }}>
      <div style={{ display: 'flex', height: 78, alignItems: 'center', borderBottom: '2px solid rgba(253,185,39,0.35)' }}>
        <div style={{ width: 170, fontFamily: BEBAS, fontSize: 44, letterSpacing: '0.14em', color: GOLD }}>QUARTERS</div>
        {cols.map((c, i) => <div key={i} style={{ flex: 1, textAlign: 'center', fontFamily: BEBAS, fontSize: 44, letterSpacing: '0.1em', color: GOLD }}>{c}</div>)}
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
  const lineIn = interpolate(f, [110, 136], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const starIn = interpolate(f, [190, 220], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const note = interpolate(f, [270, 292], [0, 1], clamp);
  const awayWon = game.away.score > game.home.score;
  const vs = spring({ frame: f - 24, fps, config: { damping: 9 } });
  const hasLine = (game.away.quarters || []).length > 0;
  const starTop = hasLine ? 1440 : 1090;
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Grain /><Streaks colour={game.away.primary === '#C4CED4' ? '#C4CED4' : GOLD} speed={0.7} />
      <Header text={`${game.label || 'FINAL'} · GAME ${index + 1} OF ${total}`} />
      <TeamPanel team={game.away} top={200} won={awayWon} enter={a} side="left" />
      <div style={{ position: 'absolute', top: 548, width: '100%', textAlign: 'center', transform: `scale(${vs})`, fontFamily: BEBAS, fontSize: 52, letterSpacing: '0.2em', color: CREAM }}>AT</div>
      <TeamPanel team={game.home} top={640} won={!awayWon} enter={b} side="right" />
      {hasLine && <LineScore game={game} appear={lineIn} />}
      <div style={{
        position: 'absolute', left: 60, right: 60, top: starTop, opacity: starIn, transform: `translateY(${(1 - starIn) * 60}px)`,
        background: CREAM, borderRadius: 28, padding: '24px 36px', display: 'flex', alignItems: 'center', gap: 32,
      }}>
        <Portrait photo={game.star.photo} team={teamByAbbr(game, game.star.team)} size={230} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: BEBAS, fontSize: 38, letterSpacing: '0.16em', color: '#5b1f8a' }}>TOP PERFORMER · {game.star.team}</div>
          <div style={{ fontFamily: ANTON, fontSize: fit(game.star.name, 76, 600, 0.5), color: '#12001f', lineHeight: 1.15 }}>{game.star.name}</div>
          <div style={{ fontFamily: ANTON, fontSize: fit(game.star.line, 58, 600, 0.5), color: RED, lineHeight: 1.15 }}>{game.star.line}</div>
        </div>
      </div>
      {(game.leaders || []).length > 0 && (
        <div style={{ position: 'absolute', left: 60, right: 60, top: starTop + 292, opacity: note, fontFamily: BEBAS, fontSize: 40, letterSpacing: '0.1em', color: CREAM, textAlign: 'center', lineHeight: 1.4 }}>
          {game.leaders.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      )}
      <div style={{
        position: 'absolute', bottom: 36, width: '100%', textAlign: 'center', opacity: note,
        fontFamily: BEBAS, fontSize: fit(game.note || '', 50, 980, 0.34), letterSpacing: '0.08em', color: GOLD,
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
        <DrawRing size={440} start={14} />
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
  const nm = (t) => { const n = t.nick || t.abbr || ''; return n.includes(' ') && /^TRAIL/i.test(n) ? n.split(' ').pop() : n; };
  const longest = Math.max(...rows.flatMap((g) => [`${nm(g.away)} ${g.away.score}`.length, `${g.home.score} ${nm(g.home)}`.length]), 8);
  const sideW = 400; // each side's width inside the row (row inner width 888, centre gap ~88)
  const szAll = Math.min(Math.floor(rowH * 0.5), Math.floor(sideW / (longest * 0.46)));
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Grain /><Streaks speed={1.2} />
      <Header text="ALL FINAL SCORES" />
      {rows.map((g, i) => {
        const pop = spring({ frame: f - (6 + i * 4), fps, config: { damping: 14 } });
        const awayWon = g.away.score > g.home.score;
        const sz = szAll;
        return (
          <div key={i} style={{
            position: 'absolute', left: 60, right: 60, top: 280 + i * rowH, height: rowH - 14,
            transform: `translateX(${interpolate(pop, [0, 1], [i % 2 ? 900 : -900, 0])}px)`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 32px', borderRadius: 20, background: 'rgba(255,244,220,0.08)', whiteSpace: 'nowrap',
            border: `3px solid ${g.away.primary === '#000000' ? GOLD : g.away.primary}`,
            fontFamily: ANTON, fontSize: sz, color: CREAM,
          }}>
            <span style={{ color: awayWon ? GOLD : CREAM, width: sideW, textAlign: 'left' }}>{nm(g.away)} {g.away.score}</span>
            <span style={{ fontFamily: BEBAS, fontSize: Math.min(40, sz * 0.6), color: 'rgba(255,244,220,0.6)' }}>{g.overtime ? g.label : ''}</span>
            <span style={{ color: awayWon ? CREAM : GOLD, width: sideW, textAlign: 'right' }}>{g.home.score} {nm(g.home)}</span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const FEATURED_MAX = 3;

export const buildScenes = (night) => {
  const featured = night.games.slice(0, FEATURED_MAX);
  const list = [{ key: 'hook', len: 180, el: <Hook night={night} /> }];
  featured.forEach((g, i) => list.push({ key: `g${i}`, len: 350, el: <GameCard game={g} index={i} total={night.games.length} /> }));
  if (night.games.length > featured.length) list.push({ key: 'all', len: 270, el: <AllScores night={night} /> });
  if (night.potn) list.push({ key: 'potn', len: 300, el: <PlayerOfNight night={night} /> });
  list.push({ key: 'outro', len: 150, el: <Outro /> });
  return list;
};

const T = 14; // frames each scene change overlaps
export const seqFrames = (scenes) => scenes.reduce((a, s) => a + s.len, 0) - Math.max(0, scenes.length - 1) * T;
const PRESENT = [() => slide({ direction: 'from-right' }), () => fade(), () => slide({ direction: 'from-bottom' }), () => fade()];

// Shared scene player: smooth eased slide/fade between scenes (Remotion TransitionSeries)
const Music = ({ music, total }) => {
  const { fps } = useVideoConfig();
  if (!music) return null;
  return (
    <Audio
      src={staticFile(music.file)}
      startFrom={Math.round((music.startSec || 0) * fps)}
      volume={(f) => Math.min(1, f / (fps * 0.8)) * Math.min(1, Math.max(0, (total - f) / (fps * 2))) * 0.85}
    />
  );
};

export const SceneSeries = ({ scenes, music }) => (
  <AbsoluteFill style={{ background: '#0c0018' }}>
    <Music music={music} total={seqFrames(scenes)} />
    <TransitionSeries>
      {scenes.flatMap((s, i) => {
        const out = [<TransitionSeries.Sequence key={s.key} durationInFrames={s.len}>{s.el}</TransitionSeries.Sequence>];
        if (i < scenes.length - 1) {
          out.push(
            <TransitionSeries.Transition key={`t${i}`} presentation={PRESENT[i % PRESENT.length]()} timing={linearTiming({ durationInFrames: T, easing: Easing.bezier(0.65, 0, 0.35, 1) })} />,
          );
        }
        return out;
      })}
    </TransitionSeries>
  </AbsoluteFill>
);

export const totalFrames = (night) => seqFrames(buildScenes(night));

export const Reel = ({ night, music }) => <SceneSeries scenes={buildScenes(night)} music={music} />;

export {
  DrawRing, GOLD, CREAM, RED, BG, ANTON, BEBAS, OUTFIT, clamp, fit, Streaks, Grain, Wipe, Count, Header, Portrait, isLight, Outro,
};
