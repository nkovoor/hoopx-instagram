import React from 'react';
import {
  AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate, spring, Easing,
} from 'remotion';
import { night } from './data';

const GOLD = '#FDB927';
const CREAM = '#FFF4DC';
const RED = '#C8102E';
const BG = 'linear-gradient(160deg, #0c0018 0%, #180030 50%, #0c001a 100%)';
const ANTON = 'Anton, sans-serif';
const BEBAS = '"Bebas Neue", sans-serif';
const OUTFIT = 'Outfit, sans-serif';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' };

// Moving diagonal light streaks behind everything
const Streaks = ({ colour = GOLD, speed = 1 }) => {
  const f = useCurrentFrame();
  const lines = [0, 1, 2, 3, 4, 5];
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {lines.map((i) => {
        const x = ((f * 14 * speed + i * 420) % 2600) - 900;
        return (
          <div key={i} style={{
            position: 'absolute', left: x, top: -400, width: 10 + (i % 3) * 8, height: 2800,
            background: `linear-gradient(180deg, transparent, ${colour}, transparent)`,
            opacity: 0.10 + (i % 2) * 0.06, transform: 'rotate(24deg)',
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
  const x = interpolate(f, [0, 10], [-1300, 1300], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{
        position: 'absolute', top: -200, left: x, width: 420, height: 2400,
        background: GOLD, transform: 'skewX(-18deg)', opacity: f < 11 ? 1 : 0,
      }} />
    </AbsoluteFill>
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

const Hook = () => {
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
        fontFamily: ANTON, fontSize: 340, lineHeight: 1, color: GOLD,
        textShadow: '0 0 60px rgba(253,185,39,0.55), 0 12px 0 #3a1500',
      }}>{night.hook.line1}</div>
      <div style={{
        position: 'absolute', top: 920, width: '100%', textAlign: 'center',
        clipPath: `inset(0 ${100 - l2}% 0 0)`,
        fontFamily: ANTON, fontSize: 132, color: CREAM, letterSpacing: '0.02em',
      }}>{night.hook.line2}</div>
      <div style={{
        position: 'absolute', top: 1160, left: '50%', transform: `translateX(-50%) scale(${0.9 + sub * 0.1})`,
        opacity: sub, background: RED, color: '#fff', padding: '20px 44px', borderRadius: 14,
        fontFamily: BEBAS, fontSize: 72, letterSpacing: '0.12em', whiteSpace: 'nowrap',
      }}>{night.hook.sub}</div>
      <div style={{
        position: 'absolute', bottom: 160, width: '100%', textAlign: 'center',
        fontFamily: OUTFIT, fontWeight: 600, fontSize: 44, color: 'rgba(255,244,220,0.8)', opacity: sub,
      }}>{night.dateLabel}</div>
      <AbsoluteFill style={{ background: '#fff', opacity: flash }} />
    </AbsoluteFill>
  );
};

const TeamPanel = ({ team, top, won, enter, side }) => {
  const dim = won ? 1 : 0.85;
  const x = interpolate(enter, [0, 1], [side === 'left' ? -1100 : 1100, 0]);
  const light = ['#C4CED4', '#EEE1C6', '#FDB927', '#FFC72C'].includes(team.primary);
  const ink = light ? '#0b0b0b' : '#ffffff';
  return (
    <div style={{
      position: 'absolute', left: 60, right: 60, top, height: 380, transform: `translateX(${x}px)`,
      background: `linear-gradient(110deg, ${team.primary} 0%, ${team.primary} 44%, ${team.secondary} 44%, ${team.secondary} 48%, ${team.primary} 48%)`,
      borderRadius: 28, overflow: 'hidden',
      boxShadow: won ? `0 0 0 6px ${GOLD}` : 'none',
    }}>
      <div style={{ position: 'absolute', left: 48, top: 40, fontFamily: ANTON, fontSize: 150, color: ink, lineHeight: 1, opacity: dim }}>
        {team.abbr}
      </div>
      <div style={{ position: 'absolute', left: 52, bottom: 46, fontFamily: BEBAS, fontSize: 64, letterSpacing: '0.12em', color: ink, opacity: dim }}>
        {team.name}
      </div>
      <div style={{
        position: 'absolute', right: 48, top: 70, fontFamily: ANTON, fontSize: 210, lineHeight: 1,
        color: won ? (light ? '#0b0b0b' : GOLD) : ink, opacity: dim,
      }}>
        <Count to={team.score} start={14} dur={34} />
      </div>
      {won && (
        <div style={{
          position: 'absolute', right: 52, bottom: 30, fontFamily: BEBAS, fontSize: 46, letterSpacing: '0.16em',
          background: GOLD, color: '#1a0a00', padding: '4px 18px', borderRadius: 8,
        }}>WIN</div>
      )}
    </div>
  );
};

const GameCard = ({ game, index, total }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame: f - 4, fps, config: { damping: 15, stiffness: 120 } });
  const b = spring({ frame: f - 10, fps, config: { damping: 15, stiffness: 120 } });
  const star = interpolate(f, [52, 66], [220, 0], { ...clamp, easing: Easing.out(Easing.back(1.4)) });
  const note = interpolate(f, [74, 86], [0, 1], clamp);
  const awayWon = game.away.score > game.home.score;
  const vs = spring({ frame: f - 18, fps, config: { damping: 9 } });
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Grain /><Streaks colour={game.away.primary === '#C4CED4' ? '#C4CED4' : GOLD} />
      <Header text={`FINAL · GAME ${index + 1} OF ${total}`} />
      <TeamPanel team={game.away} top={290} won={awayWon} enter={a} side="left" />
      <div style={{
        position: 'absolute', top: 690, width: '100%', textAlign: 'center',
        transform: `scale(${vs})`, fontFamily: BEBAS, fontSize: 60, letterSpacing: '0.2em', color: CREAM,
      }}>AT</div>
      <TeamPanel team={game.home} top={780} won={!awayWon} enter={b} side="right" />
      <div style={{
        position: 'absolute', left: 60, right: 60, top: 1250, transform: `translateY(${star}px)`, opacity: f > 52 ? 1 : 0,
        background: CREAM, borderRadius: 24, padding: '30px 40px',
      }}>
        <div style={{ fontFamily: BEBAS, fontSize: 44, letterSpacing: '0.16em', color: '#5b1f8a' }}>TOP PERFORMER · {game.star.team}</div>
        <div style={{ fontFamily: ANTON, fontSize: 96, color: '#12001f', lineHeight: 1.05 }}>{game.star.name}</div>
        <div style={{ fontFamily: ANTON, fontSize: 70, color: RED, lineHeight: 1.1 }}>{game.star.line}</div>
      </div>
      <div style={{
        position: 'absolute', bottom: 150, width: '100%', textAlign: 'center', opacity: note,
        fontFamily: BEBAS, fontSize: 50, letterSpacing: '0.08em', color: GOLD,
      }}>{game.note}</div>
    </AbsoluteFill>
  );
};

const PlayerOfNight = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = night.potn;
  const title = interpolate(f, [0, 12], [0, 1], clamp);
  const first = spring({ frame: f - 10, fps, config: { damping: 13 } });
  const last = spring({ frame: f - 18, fps, config: { damping: 13 } });
  const ring = (f % 45) / 45;
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Grain /><Streaks colour={p.colour} speed={0.8} />
      {[0, 0.33, 0.66].map((o, i) => {
        const r = ((ring + o) % 1);
        return (
          <div key={i} style={{
            position: 'absolute', left: 540 - (200 + r * 500), top: 720 - (200 + r * 500),
            width: 2 * (200 + r * 500), height: 2 * (200 + r * 500), borderRadius: '50%',
            border: `4px solid ${GOLD}`, opacity: (1 - r) * 0.35,
          }} />
        );
      })}
      <div style={{
        position: 'absolute', top: 210, width: '100%', textAlign: 'center', opacity: title,
        fontFamily: BEBAS, fontSize: 82, letterSpacing: '0.2em', color: GOLD,
      }}>PLAYER OF THE NIGHT</div>
      <div style={{
        position: 'absolute', top: 420, width: '100%', textAlign: 'center',
        transform: `translateX(${interpolate(first, [0, 1], [-900, 0])}px)`,
        fontFamily: ANTON, fontSize: 150, color: CREAM, lineHeight: 1,
      }}>{p.first}</div>
      <div style={{
        position: 'absolute', top: 570, width: '100%', textAlign: 'center',
        transform: `translateX(${interpolate(last, [0, 1], [900, 0])}px)`,
        fontFamily: ANTON, fontSize: 168, color: p.colour, lineHeight: 1,
        textShadow: `0 0 50px rgba(196,206,212,0.45)`,
      }}>{p.last}</div>
      <div style={{
        position: 'absolute', top: 790, width: '100%', textAlign: 'center',
        fontFamily: OUTFIT, fontWeight: 600, fontSize: 46, letterSpacing: '0.08em', color: 'rgba(255,244,220,0.85)',
        opacity: interpolate(f, [26, 38], [0, 1], clamp),
      }}>{p.team}</div>
      <div style={{ position: 'absolute', top: 960, left: 60, right: 60, display: 'flex', gap: 30 }}>
        {p.stats.map((s, i) => {
          const pop = spring({ frame: f - (40 + i * 8), fps, config: { damping: 10 } });
          return (
            <div key={s.k} style={{
              flex: 1, height: 400, borderRadius: 28, transform: `scale(${pop})`,
              background: i === 0 ? GOLD : 'rgba(255,244,220,0.08)',
              border: i === 0 ? 'none' : `4px solid ${GOLD}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}>
              <Count to={s.v} start={46 + i * 8} dur={30} style={{
                fontFamily: ANTON, fontSize: 210, lineHeight: 1, color: i === 0 ? '#1a0a00' : CREAM,
              }} />
              <div style={{ fontFamily: BEBAS, fontSize: 78, letterSpacing: '0.16em', color: i === 0 ? '#1a0a00' : GOLD }}>{s.k}</div>
            </div>
          );
        })}
      </div>
      <div style={{
        position: 'absolute', top: 1450, width: '100%', textAlign: 'center',
        fontFamily: BEBAS, fontSize: 72, letterSpacing: '0.12em', color: CREAM,
        opacity: interpolate(f, [80, 92], [0, 1], clamp),
      }}>SPURS: 10 WINS IN A ROW</div>
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

export const SCENES = (() => {
  const list = [{ key: 'hook', len: 90, el: <Hook /> }];
  night.games.forEach((g, i) => list.push({ key: `g${i}`, len: 135, el: <GameCard game={g} index={i} total={night.games.length} /> }));
  list.push({ key: 'potn', len: 150, el: <PlayerOfNight /> });
  list.push({ key: 'outro', len: 90, el: <Outro /> });
  return list;
})();

export const TOTAL = SCENES.reduce((a, s) => a + s.len, 0);

export const Reel = () => {
  let at = 0;
  return (
    <AbsoluteFill style={{ background: '#0c0018' }}>
      {SCENES.map((s) => {
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
