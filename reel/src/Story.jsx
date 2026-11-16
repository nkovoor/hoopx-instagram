// Story-first Reel: hook -> story beats -> scores pages -> outro.
// Everything shown comes from night.json (ESPN numbers) and story.json (written by the daily
// Claude task, with a source for every claim). Nothing here is invented.
import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion';
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
  const stars = (night.games || []).filter((g) => g.star && g.star.name !== story.player?.name).slice(0, 5);
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Grain /><Streaks colour={team.primary} speed={1.4} />
      {story.sample && SAMPLE_TAG}
      <div style={{ position: 'absolute', top: 190, left: 540 - 260, transform: `scale(${interpolate(pic, [0, 1], [0.3, 1])})`, opacity: pic }}>
        <Portrait photo={story.player?.photo} team={team} size={520} />
        <DrawRing size={520} start={12} />
      </div>
      <div style={{ position: 'absolute', top: 780, width: '100%', textAlign: 'center', transform: `scale(${interpolate(l1, [0, 1], [2.2, 1])})`, opacity: f < 10 ? 0 : 1, fontFamily: ANTON, fontSize: fit(story.hook.line1, 220, 1000, 0.52), lineHeight: 1, color: GOLD, textShadow: '0 0 60px rgba(253,185,39,0.5), 0 10px 0 #3a1500' }}>{story.hook.line1}</div>
      <div style={{ position: 'absolute', top: 1040, width: '100%', textAlign: 'center', clipPath: `inset(0 ${100 - l2}% 0 0)`, fontFamily: ANTON, fontSize: fit(story.hook.line2, 120, 1000, 0.5), color: CREAM }}>{story.hook.line2}</div>
      {story.hook.tag && (
        <div style={{ position: 'absolute', top: 1260, left: '50%', transform: `translateX(-50%) scale(${0.9 + tag * 0.1})`, opacity: tag, background: RED, color: '#fff', padding: '16px 40px', borderRadius: 14, fontFamily: BEBAS, fontSize: fit(story.hook.tag, 66, 940, 0.36), letterSpacing: '0.12em', whiteSpace: 'nowrap' }}>{story.hook.tag}</div>
      )}
      <div style={{ position: 'absolute', top: 1400, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 28 }}>
        {stars.map((g, i) => {
          const pop = spring({ frame: f - 30 - i * 5, fps, config: { damping: 12, stiffness: 160 } });
          const side = [g.away, g.home].find((t) => t.abbr === g.star.team) || g.home;
          return (
            <div key={g.id || i} style={{ transform: `scale(${interpolate(pop, [0, 1], [0.2, 1])})`, opacity: pop }}>
              <Portrait photo={g.star.photo} team={{ primary: side.primary, secondary: side.secondary, abbr: side.abbr }} size={190} />
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', bottom: 150, width: '100%', textAlign: 'center', fontFamily: OUTFIT, fontWeight: 600, fontSize: 42, color: 'rgba(255,244,220,0.8)', opacity: tag }}>{night.dateLabel}</div>
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
      <svg viewBox="0 0 1080 1000" style={{ position: 'absolute', top: 360, left: 0, width: 1080, height: 1000 }}>
        <g fill="none" stroke="rgba(255,244,220,0.55)" strokeWidth="6">
          <rect x="90" y="60" width="900" height="880" rx="6" />
          <rect x="390" y="60" width="300" height="380" />
          <circle cx="540" cy="440" r="150" />
          <path d="M 170 60 L 170 330 A 400 400 0 0 0 910 330 L 910 60" />
          <circle cx="540" cy="140" r="26" stroke={GOLD} />
        </g>
        {shot && (
          <g transform={`translate(${sx - 0}, ${sy - 360 + 60 - 60})`}>
            <circle r={60 * dot} fill={GOLD} opacity="0.25" />
            <circle r={26 * dot} fill={GOLD} />
          </g>
        )}
      </svg>
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
const BEAT_LEN = { text: 150, stat: 180, quarters: 210, moment: 210, ladder: 210, payoff: 180 };

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
                    <span style={{ width: 190 }}>{t.abbr}</span><span>{t.score}</span>
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
  const list = [{ key: 'hook', len: 90, el: <StoryHook story={story} night={night} /> }];
  (story.beats || []).forEach((b, i) => {
    const C = BEATS[b.kind] || TextBeat;
    list.push({ key: `b${i}`, len: BEAT_LEN[b.kind] || 150, el: <C beat={b} night={night} story={story} team={team} /> });
  });
  const games = [...(night.games || [])];
  const pages = Math.min(MAX_PAGES, Math.ceil(games.length / PER_PAGE));
  for (let p = 0; p < pages; p += 1) {
    list.push({ key: `s${p}`, len: 180, el: <ScoresPage games={games.slice(p * PER_PAGE, (p + 1) * PER_PAGE)} page={p + 1} pages={pages} /> });
  }
  list.push({ key: 'outro', len: 120, el: <Outro /> });
  return list;
};

export const storyFrames = (night, story) => seqFrames(buildStoryScenes(night, story));

export const StoryReel = ({ night, story }) => <SceneSeries scenes={buildStoryScenes(night, story)} />;
