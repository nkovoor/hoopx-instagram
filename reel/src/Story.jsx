// Story-first Reel: hook -> story beats -> scores pages -> outro.
// Everything shown comes from night.json (ESPN numbers) and story.json (written by the daily
// Claude task, with a source for every claim). Nothing here is invented.
import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate, spring, Easing, Img, staticFile } from 'remotion';
import {
  DrawRing, SceneSeries, seqFrames, GOLD, CREAM, RED, BG, ANTON, BEBAS, OUTFIT, clamp, fit, Streaks, Grain, Wipe, Count, Header, Portrait, isLight, Outro,
} from './Reel';

const SAMPLE_TAG = (
  <div style={{ position: 'absolute', top: 40, right: 40, zIndex: 50, background: RED, color: '#fff', fontFamily: BEBAS, fontSize: 36, letterSpacing: '0.18em', padding: '4px 18px', borderRadius: 8 }}>
    SAMPLE
  </div>
);

const teamOfStory = (story, night) => {
  const abbr = story.player?.team;
  for (const g of night.games || []) {
    if (g.home.abbr === abbr) return g.home;
    if (g.away.abbr === abbr) return g.away;
  }
  return { abbr: abbr || '', primary: '#552583', secondary: '#FDB927' };
};

// ---------- Scenes ----------

const StoryHook = ({ story, night }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const team = teamOfStory(story, night);
  const pic = spring({ frame: f - 2, fps, config: { damping: 11, stiffness: 150 } });
  const l1 = spring({ frame: f - 10, fps, config: { damping: 11, stiffness: 160 } });
  const l2 = interpolate(f, [24, 38], [0, 100], clamp);
  const tag = interpolate(f, [40, 52], [0, 1], clamp);
  const day = night.dayName || (night.dateLabel || '').split(' · ')[0];
  const dateLong = night.dateLong || (night.dateLabel || '').split(' · ')[1] || '';
  const hasPic = !!story.player?.photo;
  const up = hasPic ? 0 : 330; // no photo: no face/badge in the opening, text moves up
  const stars = (night.games || []).filter((g) => g.star && g.star.photo && g.star.name !== story.player?.name).slice(0, 5);
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Grain /><Streaks colour={team.primary} speed={1.4} />
      {story.sample && SAMPLE_TAG}
      <div style={{ position: 'absolute', top: 100, width: '100%', textAlign: 'center', fontFamily: BEBAS, fontSize: 112, letterSpacing: '0.2em', color: CREAM }}>LAST NIGHT</div>
      <div style={{ position: 'absolute', top: 215, width: '100%', textAlign: 'center', fontFamily: ANTON, fontSize: fit(day, 200, 1000, 0.55), lineHeight: 1, color: GOLD, textShadow: '0 0 60px rgba(253,185,39,0.55), 0 10px 0 #3a1500' }}>{day}</div>
      <div style={{ position: 'absolute', top: 430, width: '100%', textAlign: 'center', fontFamily: ANTON, fontSize: fit(dateLong, 120, 1000, 0.5), lineHeight: 1, color: CREAM, letterSpacing: '0.03em' }}>{dateLong}</div>
      {hasPic && (
        <div style={{ position: 'absolute', top: 590, left: 540 - 170, transform: `scale(${interpolate(pic, [0, 1], [0.3, 1])})`, opacity: pic }}>
          <Portrait photo={story.player.photo} team={team} size={340} />
          <DrawRing size={340} start={12} />
        </div>
      )}
      <div style={{ position: 'absolute', top: 950 - up, width: '100%', textAlign: 'center', transform: `scale(${interpolate(l1, [0, 1], [2.2, 1])})`, opacity: f < 10 ? 0 : 1, fontFamily: ANTON, fontSize: fit(story.hook.line1, hasPic ? 170 : 200, 1000, 0.52), lineHeight: 1, color: GOLD, textShadow: '0 0 60px rgba(253,185,39,0.5), 0 10px 0 #3a1500' }}>{story.hook.line1}</div>
      <div style={{ position: 'absolute', top: 1150 - up, width: '100%', textAlign: 'center', clipPath: `inset(0 ${100 - l2}% 0 0)`, fontFamily: ANTON, fontSize: fit(story.hook.line2, 100, 1000, 0.5), color: CREAM }}>{story.hook.line2}</div>
      {story.hook.tag && (
        <div style={{ position: 'absolute', top: 1330 - up, left: '50%', transform: `translateX(-50%) scale(${0.9 + tag * 0.1})`, opacity: tag, background: RED, color: '#fff', padding: '16px 40px', borderRadius: 14, fontFamily: BEBAS, fontSize: fit(story.hook.tag, 66, 940, 0.36), letterSpacing: '0.12em', whiteSpace: 'nowrap' }}>{story.hook.tag}</div>
      )}
      <div style={{ position: 'absolute', top: 1520 - up + 60, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 28 }}>
        {stars.map((g, i) => {
          const pop = spring({ frame: f - 30 - i * 5, fps, config: { damping: 12, stiffness: 160 } });
          const side = [g.away, g.home].find((t) => t.abbr === g.star.team) || g.home;
          return (
            <div key={g.id || i} style={{ transform: `scale(${interpolate(pop, [0, 1], [0.2, 1])})`, opacity: pop }}>
              <Portrait photo={g.star.photo} team={{ primary: side.primary, secondary: side.secondary, abbr: side.abbr }} size={170} />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Frame = ({ children, title, team, story }) => (
  <AbsoluteFill style={{ background: BG }}>
    <Grain /><Streaks colour={team?.primary || GOLD} speed={0.6} />
    {story?.sample && SAMPLE_TAG}
    {title && <Header text={title} />}
    {children}
  </AbsoluteFill>
);

const TextBeat = ({ beat, story, team }) => {
  const f = useCurrentFrame();
  const lines = beat.lines || [];
  return (
    <Frame title={beat.title} team={team} story={story}>
      <div style={{ position: 'absolute', top: 360, left: 70, right: 70, display: 'flex', flexDirection: 'column', gap: 36 }}>
        {lines.map((l, i) => {
          const o = interpolate(f, [10 + i * 34, 28 + i * 34], [0, 1], clamp);
          return <div key={i} style={{ opacity: o, transform: `translateY(${(1 - o) * 50}px)`, fontFamily: ANTON, fontSize: fit(l, 120, 940, 0.5), color: i === lines.length - 1 ? GOLD : CREAM, lineHeight: 1.1 }}>{l}</div>;
        })}
      </div>
    </Frame>
  );
};

const StatBeat = ({ beat, story, team }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: f - 6, fps, config: { damping: 10 } });
  const sub = interpolate(f, [60, 80], [0, 1], clamp);
  return (
    <Frame title={beat.title} team={team} story={story}>
      <div style={{ position: 'absolute', top: 420, left: 60, right: 60, height: 620, borderRadius: 40, background: GOLD, transform: `scale(${pop})`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Count to={beat.value} start={10} dur={50} style={{ fontFamily: ANTON, fontSize: 380, lineHeight: 1, color: '#1a0a00' }} />
        <div style={{ fontFamily: BEBAS, fontSize: 110, letterSpacing: '0.18em', color: '#1a0a00' }}>{beat.label}</div>
      </div>
      <div style={{ position: 'absolute', top: 1120, left: 70, right: 70, textAlign: 'center', opacity: sub, fontFamily: BEBAS, fontSize: fit(beat.sub || '', 78, 940, 0.36), letterSpacing: '0.08em', color: CREAM }}>{beat.sub}</div>
    </Frame>
  );
};

const QuartersBeat = ({ beat, night, story, team }) => {
  const f = useCurrentFrame();
  const game = (night.games || []).find((g) => g.id === beat.gameId) || night.games[0];
  const aq = game.away.quarters || [];
  const hq = game.home.quarters || [];
  if (!aq.length) return <TextBeat beat={{ title: beat.title, lines: beat.fallbackLines || [] }} story={story} team={team} />;
  const max = Math.max(...aq, ...hq, 1);
  const col = (t) => (isLight(t.primary) ? t.secondary : t.primary);
  const labels = aq.map((_, i) => (i < 4 ? `Q${i + 1}` : i === 4 ? 'OT' : `${i - 3}OT`));
  const barW = Math.min(110, Math.floor(820 / aq.length / 2.4));
  return (
    <Frame title={beat.title || 'QUARTER BY QUARTER'} team={team} story={story}>
      <div style={{ position: 'absolute', left: 80, right: 80, top: 330, height: 900, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around' }}>
        {aq.map((v, i) => {
          const grow = interpolate(f, [8 + i * 16, 30 + i * 16], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 760 }}>
                {[[v, game.away], [hq[i], game.home]].map(([val, t], k) => (
                  <div key={k} style={{ width: barW, height: (val / max) * 700 * grow, background: col(t), borderRadius: '12px 12px 0 0', border: `3px solid ${GOLD}`, position: 'relative' }}>
                    <div style={{ position: 'absolute', top: -64, width: '100%', textAlign: 'center', fontFamily: ANTON, fontSize: 48, color: CREAM, opacity: grow }}>{val}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 18, fontFamily: BEBAS, fontSize: 56, letterSpacing: '0.1em', color: GOLD }}>{labels[i]}</div>
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', top: 1340, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 60, fontFamily: ANTON, fontSize: 64, color: CREAM }}>
        <span style={{ color: GOLD }}>■ {game.away.abbr} {game.away.score}</span><span>■ {game.home.abbr} {game.home.score}</span>
      </div>
      {beat.sub && <div style={{ position: 'absolute', top: 1500, left: 70, right: 70, textAlign: 'center', fontFamily: BEBAS, fontSize: fit(beat.sub, 70, 940, 0.36), letterSpacing: '0.08em', color: GOLD }}>{beat.sub}</div>}
    </Frame>
  );
};

// Half court with an optional shot dot. shot.x: 0-50 (left to right), shot.y: 0-47 (baseline to half-court).
const MomentBeat = ({ beat, story, team }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dot = spring({ frame: f - 40, fps, config: { damping: 8 } });
  const shot = beat.shot;
  const sx = shot ? 90 + (shot.x / 50) * 900 : 0;
  const sy = shot ? 420 + (1 - Math.min(shot.y, 47) / 47) * 0 + (Math.min(shot.y, 47) / 47) * 760 : 0;
  const clock = interpolate(f, [0, 40], [0, 1], clamp);
  return (
    <Frame title={beat.title || 'THE MOMENT'} team={team} story={story}>
      <div style={{ position: 'absolute', top: 340, left: 40, width: 1000, height: 1000, borderRadius: 28, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.6)', transform: `scale(${interpolate(f, [0, 210], [1, 1.06], clamp)})` }}>
        {story?.court && <Img src={staticFile(story.court)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
        <svg viewBox="0 0 1080 1000" preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%", display: "block" }}>
          <defs>
            <linearGradient id="wood" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#c58b4e" /><stop offset="0.5" stopColor="#d9a366" /><stop offset="1" stopColor="#a8703a" />
            </linearGradient>
            <pattern id="planks" width="60" height="1000" patternUnits="userSpaceOnUse">
              <rect width="60" height="1000" fill="url(#wood)" />
              <rect width="2.5" height="1000" fill="rgba(70,35,10,0.35)" />
              <rect x="30" width="1.5" height="1000" fill="rgba(70,35,10,0.12)" />
            </pattern>
            <radialGradient id="spot" cx="50%" cy="35%" r="75%">
              <stop offset="0" stopColor="rgba(255,240,200,0.35)" /><stop offset="1" stopColor="rgba(0,0,0,0.55)" />
            </radialGradient>
          </defs>
          {!story?.court && <rect width="1080" height="1000" fill="url(#planks)" />}
          <rect x="390" y="60" width="300" height="380" fill={team?.primary || '#552583'} opacity="0.85" />
          <g fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="7">
            <rect x="90" y="60" width="900" height="880" />
            <rect x="390" y="60" width="300" height="380" />
            <circle cx="540" cy="440" r="150" />
            <path d="M 170 60 L 170 330 A 400 400 0 0 0 910 330 L 910 60" />
          </g>
          <rect width="1080" height="1000" fill="url(#spot)" />
          {(() => {
            // Real-feet geometry: court is 50ft wide, 18px/ft across and 18.7px/ft deep; rim centre is 5.25ft from the baseline.
            const PXX = 18, PXY = 18.7, K = 12; // K = px of screen height per foot of ball height
            const spot = shot || { x: 25, y: 28 };
            const sx = Math.max(0, Math.min(50, spot.x)), sy = Math.max(0, Math.min(47, spot.y));
            const ox = 90 + sx * PXX, oy = 60 + sy * PXY;
            const HX = 90 + 25 * PXX, HFY = 60 + 5.25 * PXY, RIM_FT = 10;
            const HY = HFY - RIM_FT * K; // rim as drawn (elevated)
            const distFt = Math.hypot(sx - 25, sy - 5.25);
            const isThree = distFt >= 23.7 || (sy < 14 && (sx < 3 || sx > 47));
            const kind = distFt < 4 ? 'AT THE RIM' : isThree ? 'THREE-POINTER' : 'MID-RANGE';
            const name = (beat.player || story?.player?.name || '').toUpperCase();
            // Physics: floor position moves linearly; ball height is a parabola (gravity), higher arc for longer shots.
            const flightSec = 0.8 + 0.018 * distFt;
            const FL = Math.round(flightSec * 30 * 1.6); // 1.6x slow-mo
            const REL = 56, LAND = REL + FL;
            const SIL = 0.65;
            const appear = interpolate(f, [26, 40], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
            const jumpAt = (fr) => interpolate(fr, [44, 56, 68], [0, -30, 0], { ...clamp, easing: Easing.inOut(Easing.quad) });
            const jump = jumpAt(f);
            const handsPx = 140 * SIL;
            const h0 = (handsPx - jumpAt(REL)) / K; // ft above floor at release
            const A = 2.2 + distFt * 0.16;
            const at = (t) => ({
              x: ox + (HX - ox) * t,
              y: oy + (HFY - oy) * t,
              h: h0 + (RIM_FT - h0) * t + 4 * A * t * (1 - t),
            });
            const t = interpolate(f, [REL, LAND], [0, 1], clamp);
            const held = f < REL;
            const pass = interpolate(f, [LAND, LAND + 16], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
            let bx, by, bh, gx, gy;
            if (held) { gx = ox; gy = oy; bh = h0; bx = ox; by = oy - handsPx + jump; }
            else if (f <= LAND) { const p = at(t); gx = p.x; gy = p.y; bh = p.h; bx = gx; by = gy - bh * K; }
            else { gx = HX; gy = HFY; bh = RIM_FT - 5 * pass; bx = HX; by = gy - bh * K; }
            const ballR = 20 + bh * 0.7;
            const ballOp = f < 36 ? 0 : interpolate(f, [LAND + 12, LAND + 20], [1, 0], clamp);
            const swish = interpolate(f, [LAND - 2, LAND + 6, LAND + 22], [0, 1, 0], clamp);
            const flash = interpolate(f, [LAND, LAND + 4, LAND + 26], [0, 0.9, 0], clamp);
            const spin = held ? 0 : (f - REL) * 14;
            const trail = [];
            if (!held) for (let i = 0; i <= 24; i += 1) { const tt = (t * i) / 24; const p = at(tt); trail.push(`${p.x},${p.y - p.h * K}`); }
            const sil = '#0b0b16';
            const body = (col, w) => (
              <g stroke={col} strokeLinecap="round" strokeLinejoin="round" fill={col}>
                <circle cx="0" cy="-118" r="19" stroke="none" />
                <path d="M -20 -96 L 22 -96 L 18 -40 L -16 -40 Z" strokeWidth={w} />
                <path d="M -14 -40 L -22 18 M 12 -40 L 24 18" fill="none" strokeWidth={14 + w} />
                <path d="M 16 -90 L 14 -150 M -14 -90 L -8 -134" fill="none" strokeWidth={11 + w} />
              </g>
            );
            const labelOp = interpolate(f, [34, 48], [0, 1], clamp);
            const mx = (ox + HX) / 2, my = (oy + HFY) / 2;
            const lineP = interpolate(f, [30, 52], [0, 1], clamp);
            return (
              <g>
                {/* distance dimension line on the floor, shooter -> basket */}
                <line x1={ox} y1={oy} x2={ox + (HX - ox) * lineP} y2={oy + (HFY - oy) * lineP} stroke="#fff" strokeWidth="4" strokeDasharray="10 10" opacity="0.85" />
                <circle cx={HX} cy={HFY} r="8" fill="#fff" opacity={0.9 * lineP} />
                {shot && <g opacity={labelOp} transform={`translate(${mx} ${my})`}>
                  <rect x="-92" y="-28" width="184" height="56" rx="28" fill="#0b0b16" stroke={GOLD} strokeWidth="4" />
                  <text x="0" y="12" textAnchor="middle" fontFamily="Anton, Impact, sans-serif" fontSize="40" fill={GOLD}>{Math.round(distFt)} FT</text>
                </g>}
                {/* basket back half + backboard */}
                <line x1={HX - 62} y1={HY - 22} x2={HX + 62} y2={HY - 22} stroke="#fff" strokeWidth="9" strokeLinecap="round" />
                <path d={`M ${HX - 28} ${HY} A 28 11 0 0 1 ${HX + 28} ${HY}`} fill="none" stroke="#ff7a2f" strokeWidth="6" />
                {/* floor shadow of the ball */}
                {!held && <ellipse cx={gx} cy={gy} rx={Math.max(8, 22 - bh * 0.6)} ry={Math.max(4, 9 - bh * 0.25)} fill="rgba(0,0,0,0.4)" opacity={ballOp} />}
                {/* player silhouette */}
                <ellipse cx={ox} cy={oy + 22} rx={62 * appear} ry={14 * appear} fill="rgba(0,0,0,0.45)" />
                <g transform={`translate(${ox} ${oy + jump}) scale(${appear * SIL})`} opacity={appear}>
                  {body('#ffffff', 7)}
                  {body(sil, 0)}
                </g>
                {/* player name tag */}
                {name && (
                  <g opacity={labelOp} transform={`translate(${ox} ${oy + 62})`}>
                    <rect x={-Math.min(230, name.length * 14 + 36)} y="-26" width={Math.min(460, name.length * 28 + 72)} height="52" rx="12" fill="#0b0b16" opacity="0.92" />
                    <text x="0" y="12" textAnchor="middle" fontFamily="Anton, Impact, sans-serif" fontSize="34" fill="#fff4dc">{name}</text>
                  </g>
                )}
                {/* flight trail (follows the parabola) */}
                {trail.length > 1 && <polyline points={trail.join(' ')} fill="none" stroke={GOLD} strokeWidth="5" strokeDasharray="12 12" strokeLinecap="round" opacity="0.7" />}
                {/* ball */}
                <g transform={`translate(${bx} ${by}) rotate(${spin}) scale(${ballR / 27})`} opacity={ballOp}>
                  <circle r="27" fill="#e8761e" stroke="#5a2a08" strokeWidth="3" />
                  <path d="M -27 0 L 27 0 M 0 -27 L 0 27" stroke="#5a2a08" strokeWidth="2.5" />
                  <path d="M -19 -19 Q 0 0 -19 19 M 19 -19 Q 0 0 19 19" stroke="#5a2a08" strokeWidth="2.5" fill="none" />
                </g>
                {/* net + front rim drawn over the ball so it drops THROUGH the hoop */}
                <g transform={`translate(${HX} ${HY}) scale(${1 + swish * 0.1} ${1 + swish * 0.45})`} opacity="0.95">
                  <path d="M -28 0 L -17 52 M -10 6 L -6 56 M 10 6 L 6 56 M 28 0 L 17 52 M -23 26 L 23 26 M -19 42 L 19 42" stroke="#fff" strokeWidth="3" fill="none" />
                </g>
                <path d={`M ${HX - 28} ${HY} A 28 11 0 0 0 ${HX + 28} ${HY}`} fill="none" stroke="#ff7a2f" strokeWidth="7" />
                <circle cx={HX} cy={HY + 10} r={100 * swish} fill={GOLD} opacity={flash * 0.3} />
                {/* shot-type tag */}
                {shot && <g opacity={interpolate(f, [LAND, LAND + 10], [0, 1], clamp)} transform="translate(540 930)">
                  <rect x="-190" y="-30" width="380" height="60" rx="30" fill={RED} />
                  <text x="0" y="14" textAnchor="middle" fontFamily="Bebas Neue, Anton, sans-serif" fontSize="42" letterSpacing="4" fill="#fff">{kind}</text>
                </g>}
              </g>
            );
          })()}
        </svg>
      </div>
      <div style={{ position: 'absolute', top: 1360, left: 70, right: 70, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: clock }}>
        <div style={{ fontFamily: ANTON, fontSize: 130, color: GOLD, lineHeight: 1 }}>{beat.clock}</div>
        <div style={{ fontFamily: ANTON, fontSize: 80, color: CREAM, lineHeight: 1.2 }}>{beat.score}</div>
      </div>
      <div style={{ position: 'absolute', top: 1620, left: 70, right: 70, textAlign: 'center', fontFamily: BEBAS, fontSize: fit(beat.text || '', 70, 940, 0.36), letterSpacing: '0.08em', color: CREAM }}>{beat.text}</div>
    </Frame>
  );
};

// A ranking list where one row climbs past another ("passed X on the all-time list").
const LadderBeat = ({ beat, story, team }) => {
  const f = useCurrentFrame();
  const rows = beat.rows || [];
  const rowH = 150;
  const move = interpolate(f, [50, 90], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  return (
    <Frame title={beat.title} team={team} story={story}>
      <div style={{ position: 'absolute', top: 330, left: 60, right: 60 }}>
        {rows.map((r, i) => {
          const y = i * rowH + (r.climbsTo != null ? (r.climbsTo - i) * rowH * move : r.fallsTo != null ? (r.fallsTo - i) * rowH * move : 0);
          const hl = r.climbsTo != null;
          return (
            <div key={r.name} style={{ position: 'absolute', top: y, left: 0, right: 0, height: rowH - 18, borderRadius: 24, background: hl ? GOLD : 'rgba(255,244,220,0.08)', border: hl ? 'none' : '3px solid rgba(253,185,39,0.4)', display: 'flex', alignItems: 'center', padding: '0 40px', gap: 30, zIndex: hl ? 2 : 1 }}>
              <div style={{ fontFamily: ANTON, fontSize: 70, color: hl ? '#1a0a00' : GOLD, width: 130 }}>{r.rank}</div>
              <div style={{ flex: 1, fontFamily: ANTON, fontSize: fit(r.name, 70, 560, 0.5), color: hl ? '#1a0a00' : CREAM }}>{r.name}</div>
              <div style={{ fontFamily: ANTON, fontSize: 62, color: hl ? '#1a0a00' : 'rgba(255,244,220,0.8)' }}>{r.value}</div>
            </div>
          );
        })}
      </div>
      {beat.sub && <div style={{ position: 'absolute', top: 330 + rows.length * rowH + 40, left: 70, right: 70, textAlign: 'center', fontFamily: BEBAS, fontSize: fit(beat.sub, 66, 940, 0.36), letterSpacing: '0.08em', color: CREAM }}>{beat.sub}</div>}
    </Frame>
  );
};

const PayoffBeat = ({ beat, story, team }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - 6, fps, config: { damping: 12 } });
  const fact = interpolate(f, [50, 70], [0, 1], clamp);
  return (
    <Frame title={beat.title || 'WHY IT MATTERS'} team={team} story={story}>
      <div style={{ position: 'absolute', top: 400, left: 60, right: 60, textAlign: 'center', transform: `scale(${s})`, fontFamily: ANTON, fontSize: fit(beat.line, 190, 960, 0.5), lineHeight: 1.05, color: GOLD, textShadow: '0 8px 0 #3a1500' }}>{beat.line}</div>
      {beat.fact && <div style={{ position: 'absolute', top: 1000, left: 70, right: 70, opacity: fact, background: CREAM, borderRadius: 28, padding: '36px 44px', fontFamily: ANTON, fontSize: fit(beat.fact, 64, 860, 0.45) * 1, lineHeight: 1.2, color: '#12001f' }}>{beat.fact}</div>}
    </Frame>
  );
};

const BEATS = { text: TextBeat, stat: StatBeat, quarters: QuartersBeat, moment: MomentBeat, ladder: LadderBeat, payoff: PayoffBeat };
const BEAT_LEN = { text: 190, stat: 220, quarters: 260, moment: 260, ladder: 260, payoff: 220 };

// Five games per page, each with the game's top scorer.
const ScoresPage = ({ games, page, pages }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Grain /><Streaks speed={0.8} />
      <Header text={`ALL FINAL SCORES · ${page}/${pages}`} />
      {games.map((g, i) => {
        const a = spring({ frame: f - (6 + i * 7), fps, config: { damping: 14 } });
        const awayWon = g.away.score > g.home.score;
        const star = g.star || {};
        const starTeam = g.home.abbr === star.team ? g.home : g.away;
        return (
          <div key={g.id || i} style={{ position: 'absolute', left: 60, right: 60, top: 250 + i * 320, height: 296, transform: `translateX(${interpolate(a, [0, 1], [i % 2 ? 900 : -900, 0])}px)`, borderRadius: 28, overflow: 'hidden', background: 'rgba(255,244,220,0.07)', border: '3px solid rgba(253,185,39,0.45)', display: 'flex', alignItems: 'center' }}>
            <div style={{ width: 520, padding: '0 36px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[g.away, g.home].map((t, k) => {
                const won = (k === 0 && awayWon) || (k === 1 && !awayWon);
                return (
                  <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 18, fontFamily: ANTON, fontSize: 84, lineHeight: 1, color: won ? GOLD : CREAM, opacity: won ? 1 : 0.85 }}>
                    <span style={{ width: 22, height: 70, borderRadius: 6, background: t.primary, border: `3px solid ${t.secondary}` }} />
                    <span style={{ width: 300, fontSize: fit(t.nick || t.abbr, 84, 300, 0.5) }}>{t.nick || t.abbr}</span><span>{t.score}</span>
                  </div>
                );
              })}
              {g.overtime ? <div style={{ position: 'absolute', top: 14, left: 36, fontFamily: BEBAS, fontSize: 34, letterSpacing: '0.14em', color: GOLD }}>{g.label}</div> : null}
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 24, paddingRight: 30, minWidth: 0 }}>
              <Portrait photo={star.photo} team={starTeam} size={190} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: ANTON, fontSize: fit(star.name || '', 44, 250, 0.5), color: CREAM, lineHeight: 1.1 }}>{star.name}</div>
                <div style={{ fontFamily: BEBAS, fontSize: fit(star.line || '', 44, 250, 0.4), letterSpacing: '0.06em', color: GOLD, marginTop: 6 }}>{star.line}</div>
              </div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------- Composition ----------

const PER_PAGE = 5;
const MAX_PAGES = 3;

export const buildStoryScenes = (night, story) => {
  const team = teamOfStory(story, night);
  const list = [{ key: 'hook', len: 120, el: <StoryHook story={story} night={night} /> }];
  (story.beats || []).forEach((b, i) => {
    const C = BEATS[b.kind] || TextBeat;
    list.push({ key: `b${i}`, len: BEAT_LEN[b.kind] || 150, el: <C beat={b} night={night} story={story} team={team} /> });
  });
  const games = [...(night.games || [])];
  const pages = Math.min(MAX_PAGES, Math.ceil(games.length / PER_PAGE));
  for (let p = 0; p < pages; p += 1) {
    list.push({ key: `s${p}`, len: 240, el: <ScoresPage games={games.slice(p * PER_PAGE, (p + 1) * PER_PAGE)} page={p + 1} pages={pages} /> });
  }
  list.push({ key: 'outro', len: 150, el: <Outro /> });
  return list;
};

export const storyFrames = (night, story) => seqFrames(buildStoryScenes(night, story));

export const StoryReel = ({ night, story, music }) => <SceneSeries scenes={buildStoryScenes(night, story)} music={music} />;
