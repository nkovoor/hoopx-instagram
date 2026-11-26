import React from 'react';
import { AbsoluteFill } from 'remotion';
import { CREAM, ANTON, BEBAS, OUTFIT, fit, Grain, Portrait, DrawRing } from './Reel';
import { RED, GOLD } from './Reel';

// Five colour themes. One is picked per week (data.theme), so every carousel looks different.
const THEMES = [
  { bg: 'linear-gradient(165deg,#050d24 0%,#0b2a6b 100%)', accent: '#FDB927', hot: '#E03A3E', glow: '#2d6bff' },   // broadcast navy
  { bg: 'radial-gradient(ellipse at 50% 20%,#2a2008 0%,#0a0803 60%,#000 100%)', accent: '#FDB927', hot: '#FFF4DC', glow: '#FDB927' }, // prestige
  { bg: 'linear-gradient(165deg,#03201d 0%,#064d46 100%)', accent: '#2EE6D6', hot: '#FF3D81', glow: '#2EE6D6' },     // teal neon
  { bg: 'linear-gradient(165deg,#2a0a04 0%,#7a1d0a 100%)', accent: '#FFB347', hot: '#FF5A36', glow: '#ff6a3d' },     // sunset
  { bg: 'linear-gradient(165deg,#03140c 0%,#0b4a2c 100%)', accent: '#7CFFB2', hot: '#FDB927', glow: '#22c55e' },     // emerald
];
const T = (data) => THEMES[(data.theme || 0) % THEMES.length];

const Page = ({ children, n, total, t, caption, last }) => (
  <AbsoluteFill style={{ background: t.bg, overflow: 'hidden' }}>
    <div style={{ position: 'absolute', width: 900, height: 900, left: -300, top: -300, borderRadius: '50%', background: `radial-gradient(circle, ${t.glow}55 0%, transparent 70%)` }} />
    <div style={{ position: 'absolute', width: 1000, height: 1000, right: -400, bottom: -300, borderRadius: '50%', background: `radial-gradient(circle, ${t.glow}40 0%, transparent 70%)` }} />
    <Grain />
    <div style={{ position: 'absolute', left: 80, top: 0, bottom: 0, width: 3, background: `${t.accent}22`, transform: 'skewX(-12deg)' }} />
    {children}
    {caption && (
      <div style={{ position: 'absolute', left: 60, right: 60, bottom: 130, padding: '26px 36px', borderRadius: 22, background: 'rgba(0,0,0,0.45)', borderLeft: `10px solid ${t.hot}`, fontFamily: OUTFIT, fontWeight: 700, fontSize: caption.length > 90 ? 38 : 44, lineHeight: 1.25, color: CREAM }}>{caption}</div>
    )}
    <div style={{ position: 'absolute', bottom: 50, left: 60, right: 60, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: BEBAS, fontSize: 38, letterSpacing: '0.2em', color: 'rgba(255,244,220,0.6)' }}>
      <span>@HOOPXNBA</span>
      <span style={{ display: 'flex', gap: 10 }}>{Array.from({ length: total }).map((_, i) => <i key={i} style={{ width: i === n - 1 ? 34 : 12, height: 12, borderRadius: 6, background: i === n - 1 ? t.accent : 'rgba(255,244,220,0.3)' }} />)}</span>
      <span>{last ? '' : 'SWIPE ➜'}</span>
    </div>
  </AbsoluteFill>
);
const Title = ({ text, sub, t }) => (
  <div style={{ position: 'absolute', top: 90, left: 60, right: 60, textAlign: 'center' }}>
    <div style={{ fontFamily: ANTON, fontSize: fit(text, 120, 960, 0.5), color: t.accent, lineHeight: 1, textShadow: '0 6px 0 rgba(0,0,0,0.35)' }}>{text}</div>
    {sub && <div style={{ fontFamily: BEBAS, fontSize: 46, letterSpacing: '0.14em', color: CREAM, marginTop: 10 }}>{sub}</div>}
  </div>
);
const Cover = ({ data, n, total, t, kicker, big, sub, hero, stats }) => (
  <Page n={n} total={total} t={t}>
    <div style={{ position: 'absolute', top: 110, width: '100%', textAlign: 'center' }}>
      <span style={{ display: 'inline-block', background: t.hot, color: t.hot === '#FFF4DC' ? '#000' : '#fff', padding: '12px 34px', borderRadius: 12, fontFamily: BEBAS, fontSize: 52, letterSpacing: '0.18em' }}>{kicker}</span>
    </div>
    {hero}
    <div style={{ position: 'absolute', top: hero ? 960 : 520, left: 50, right: 50, textAlign: 'center' }}>
      <div style={{ fontFamily: ANTON, fontSize: fit(big, 200, 980, 0.5), lineHeight: 1.02, color: CREAM, textShadow: `0 0 60px ${t.accent}66, 0 10px 0 rgba(0,0,0,0.4)` }}>{big}</div>
      <div style={{ fontFamily: BEBAS, fontSize: 56, letterSpacing: '0.12em', color: t.accent, marginTop: 22 }}>{sub}</div>
    </div>
    {stats && (
      <div style={{ position: 'absolute', top: 1450, left: 60, right: 60, display: 'flex', justifyContent: 'space-around' }}>
        {stats.map((s) => (
          <div key={s[1]} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: ANTON, fontSize: 130, color: t.accent, lineHeight: 1 }}>{s[0]}</div>
            <div style={{ fontFamily: BEBAS, fontSize: 40, letterSpacing: '0.15em', color: CREAM }}>{s[1]}</div>
          </div>
        ))}
      </div>
    )}
  </Page>
);
const Outro = ({ n, total, t }) => (
  <Page n={n} total={total} t={t} last>
    <div style={{ position: 'absolute', top: 420, width: '100%', textAlign: 'center' }}>
      <div style={{ fontFamily: ANTON, fontSize: 230, color: t.accent, lineHeight: 1, textShadow: '0 10px 0 rgba(0,0,0,0.4)' }}>HOOPX</div>
      <div style={{ fontFamily: BEBAS, fontSize: 70, letterSpacing: '0.18em', color: CREAM, marginTop: 24 }}>NEW NBA STORY EVERY DAY</div>
      <div style={{ display: 'inline-block', marginTop: 50, background: t.hot, color: t.hot === '#FFF4DC' ? '#000' : '#fff', padding: '22px 60px', borderRadius: 16, fontFamily: BEBAS, fontSize: 64, letterSpacing: '0.12em' }}>FOLLOW @HOOPXNBA</div>
      <div style={{ fontFamily: OUTFIT, fontWeight: 600, fontSize: 40, color: 'rgba(255,244,220,0.75)', marginTop: 40 }}>SAVE THIS · SHARE WITH A HOOPER</div>
      <div style={{ fontFamily: OUTFIT, fontSize: 28, color: 'rgba(255,244,220,0.45)', marginTop: 60 }}>Unofficial fan account, not affiliated with the NBA or any team.</div>
    </div>
  </Page>
);
const GameRow = ({ g, t }) => (
  <div style={{ margin: '0 56px 22px', borderRadius: 26, background: 'rgba(0,0,0,0.38)', border: `2px solid ${t.accent}55`, overflow: 'hidden' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 40px', fontFamily: ANTON, fontSize: 84, lineHeight: 1 }}>
      <span style={{ color: g.winner === g.away ? t.accent : CREAM }}>{g.away} {g.as}</span>
      <span style={{ fontFamily: BEBAS, fontSize: 38, color: t.hot, letterSpacing: '0.1em', textAlign: 'center' }}>{g.label}<br /><span style={{ color: 'rgba(255,244,220,0.6)', fontSize: 30 }}>{g.date}</span></span>
      <span style={{ color: g.winner === g.home ? t.accent : CREAM }}>{g.hs} {g.home}</span>
    </div>
  </div>
);

export const Carousel = ({ kind, data, slide }) => {
  const t = T(data);
  if (kind === 'week') {
    const total = 5;
    const c = data.captions || {};
    const h = data.top[0];
    if (slide === 0) {
      return <Cover data={data} t={t} n={1} total={total} kicker={`WEEK IN REVIEW · ${data.range}`} big={data.title} sub={data.subtitle}
        hero={h && <div style={{ position: 'absolute', top: 250, width: '100%', display: 'flex', justifyContent: 'center' }}><div style={{ position: 'relative' }}><Portrait photo={h.photo} team={h} size={640} /><DrawRing size={640} start={0} dur={1} /></div></div>}
        stats={[[data.games, 'GAMES'], [data.ot, 'OVERTIMES'], [data.nights, 'NIGHTS']]} />;
    }
    if (slide === 1) {
      return (
        <Page n={2} total={total} t={t} caption={c.top}>
          <Title t={t} text={data.titles.top} sub="THE BEST LINES OF THE WEEK" />
          <div style={{ position: 'absolute', top: 260, left: 0, right: 0 }}>
            {data.top.slice(0, 5).map((p, i) => (
              <div key={p.name + p.date} style={{ display: 'flex', alignItems: 'center', gap: 26, padding: '8px 40px', margin: '0 50px 12px', borderRadius: 24, background: 'rgba(0,0,0,0.38)', borderLeft: `10px solid ${i === 0 ? t.accent : t.hot}` }}>
                <div style={{ fontFamily: ANTON, fontSize: 70, color: i === 0 ? t.accent : 'rgba(255,244,220,0.5)', width: 70 }}>{i + 1}</div>
                <Portrait photo={p.photo} team={p} size={120} />
                <div>
                  <div style={{ fontFamily: ANTON, fontSize: fit(p.name, 50, 560, 0.5), color: CREAM }}>{p.name}</div>
                  <div style={{ fontFamily: BEBAS, fontSize: 46, letterSpacing: '0.06em', color: t.accent }}>{p.line}</div>
                </div>
              </div>
            ))}
          </div>
        </Page>
      );
    }
    if (slide === 2) return <Page n={3} total={total} t={t} caption={c.closest}><Title t={t} text={data.titles.closest} sub="DECIDED BY THE FEWEST POINTS" /><div style={{ position: 'absolute', top: 300, left: 0, right: 0 }}>{data.closest.slice(0, 3).map((g, i) => <GameRow key={i} g={g} t={t} />)}</div></Page>;
    if (slide === 3) return <Page n={4} total={total} t={t} caption={c.blowouts}><Title t={t} text={data.titles.blowouts} sub="THE MOST LOPSIDED RESULTS" /><div style={{ position: 'absolute', top: 300, left: 0, right: 0 }}>{data.blowouts.slice(0, 3).map((g, i) => <GameRow key={i} g={g} t={t} />)}</div></Page>;
    return <Outro n={5} total={total} t={t} />;
  }
  const total = data.players.length + 2;
  if (slide === 0) {
    return <Cover data={data} t={t} n={1} total={total} kicker={`THE SIX WE WATCH · ${data.range}`} big="HOOPX 6 WATCH" sub={data.subtitle}
      hero={<div style={{ position: 'absolute', top: 230, left: 60, right: 60, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 22, justifyItems: 'center' }}>
        {data.players.map((p) => <div key={p.name} style={{ position: 'relative' }}><Portrait photo={p.photo} team={p} size={290} /></div>)}
      </div>} />;
  }
  if (slide === total - 1) return <Outro n={total} total={total} t={t} />;
  const p = data.players[slide - 1];
  const win = (p.result || '').startsWith('W');
  const pt = { ...t, glow: p.primary || t.glow };
  return (
    <Page n={slide + 1} total={total} t={pt} caption={p.caption}>
      <div style={{ position: 'absolute', top: 100, width: '100%', textAlign: 'center' }}>
        <span style={{ display: 'inline-block', background: t.hot, color: t.hot === '#FFF4DC' ? '#000' : '#fff', padding: '10px 30px', borderRadius: 12, fontFamily: BEBAS, fontSize: 48, letterSpacing: '0.18em' }}>HOOPX 6 · {slide} OF 6</span>
      </div>
      <div style={{ position: 'absolute', top: 190, width: '100%', display: 'flex', justifyContent: 'center' }}><div style={{ position: 'relative' }}><Portrait photo={p.photo} team={p} size={400} /><DrawRing size={400} start={0} dur={1} /></div></div>
      <div style={{ position: 'absolute', top: 650, width: '100%', textAlign: 'center', fontFamily: ANTON, fontSize: fit(p.name, 120, 980, 0.5), color: CREAM, lineHeight: 1, textShadow: '0 8px 0 rgba(0,0,0,0.4)' }}>{p.name.toUpperCase()}</div>
      <div style={{ position: 'absolute', top: 790, width: '100%', textAlign: 'center' }}>
        {p.line ? (
          <>
            <div style={{ fontFamily: ANTON, fontSize: fit(p.line, 100, 980, 0.5), color: t.accent }}>{p.line}</div>
            <div style={{ display: 'inline-block', marginTop: 16, padding: '8px 30px', borderRadius: 12, background: win ? '#16a34a' : '#b91c1c', fontFamily: BEBAS, fontSize: 50, letterSpacing: '0.1em', color: '#fff' }}>{p.result}</div>
          </>
        ) : (
          <div style={{ fontFamily: BEBAS, fontSize: 56, letterSpacing: '0.12em', color: 'rgba(255,244,220,0.7)' }}>NO TOP-SCORER LINE THIS WEEK</div>
        )}
      </div>
    </Page>
  );
};

// 1080x1920 image for the Instagram Story that points people to the new Reel.
export const StoryCard = ({ card }) => (
  <AbsoluteFill style={{ background: 'linear-gradient(160deg, #0c0018 0%, #180030 50%, #0c001a 100%)', overflow: 'hidden' }}>
    <Grain />
    <div style={{ position: 'absolute', top: 250, left: 60, right: 60, textAlign: 'center', fontFamily: ANTON, fontSize: (card.headline || '').length > 30 ? 100 : (card.headline || '').length > 16 ? 112 : 150, lineHeight: 1.05, color: CREAM, textShadow: '0 0 50px rgba(253,185,39,0.45), 0 8px 0 #3a1500' }}>{card.headline || 'NEW REEL'}</div>
    <div style={{ position: 'absolute', top: 480, left: 300 }}>
      <Portrait photo={card.photo} team={{ primary: card.primary, secondary: card.secondary }} size={480} />
      <DrawRing size={480} start={0} dur={1} />
    </div>
    <div style={{ position: 'absolute', top: 1080, width: '100%', textAlign: 'center', fontFamily: ANTON, fontSize: fit(card.line1, 120, 1000, 0.52), lineHeight: 1, color: GOLD, textShadow: '0 0 60px rgba(253,185,39,0.5), 0 10px 0 #3a1500' }}>{card.line1}</div>
    <div style={{ position: 'absolute', top: 1230, width: '100%', textAlign: 'center', fontFamily: ANTON, fontSize: fit(card.line2, 80, 1000, 0.5), color: GOLD }}>{card.line2}</div>
    <div style={{ position: 'absolute', top: 1360, width: '100%', textAlign: 'center', fontFamily: OUTFIT, fontWeight: 600, fontSize: 40, color: 'rgba(255,244,220,0.8)' }}>{card.dateLabel}</div>
    <div style={{ position: 'absolute', top: 1500, left: 140, right: 140, textAlign: 'center', background: RED, color: '#fff', padding: '26px 0', borderRadius: 18, fontFamily: BEBAS, fontSize: 60, letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>WATCH IT ON OUR PAGE</div>
    <div style={{ position: 'absolute', bottom: 150, width: '100%', textAlign: 'center', fontFamily: OUTFIT, fontWeight: 600, fontSize: 40, color: 'rgba(255,244,220,0.7)' }}>@hoopxnba · hoopxnba.com</div>
  </AbsoluteFill>
);
