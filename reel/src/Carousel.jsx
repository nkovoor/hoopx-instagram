import React from 'react';
import { AbsoluteFill } from 'remotion';
import { GOLD, CREAM, RED, BG, ANTON, BEBAS, OUTFIT, fit, Grain, Portrait } from './Reel';

const W = 1080;
const Page = ({ children, n, total }) => (
  <AbsoluteFill style={{ background: BG, overflow: 'hidden' }}>
    <Grain />
    <div style={{ position: 'absolute', left: 80, top: 0, bottom: 0, width: 3, background: 'rgba(253,185,39,0.12)', transform: 'skewX(-12deg)' }} />
    {children}
    <div style={{ position: 'absolute', bottom: 46, width: '100%', textAlign: 'center', fontFamily: BEBAS, fontSize: 38, letterSpacing: '0.2em', color: 'rgba(255,244,220,0.55)' }}>HOOPX · {n}/{total}</div>
  </AbsoluteFill>
);
const Title = ({ text, sub }) => (
  <div style={{ position: 'absolute', top: 90, width: '100%', textAlign: 'center' }}>
    <div style={{ fontFamily: BEBAS, fontSize: 70, letterSpacing: '0.18em', color: GOLD }}>{text}</div>
    {sub && <div style={{ fontFamily: OUTFIT, fontWeight: 600, fontSize: 36, color: 'rgba(255,244,220,0.75)', marginTop: 6 }}>{sub}</div>}
  </div>
);
const Cover = ({ big, small, range, n, total, stats }) => (
  <Page n={n} total={total}>
    <div style={{ position: 'absolute', top: 330, width: '100%', textAlign: 'center' }}>
      <div style={{ fontFamily: BEBAS, fontSize: 64, letterSpacing: '0.25em', color: GOLD }}>{small}</div>
      <div style={{ fontFamily: ANTON, fontSize: fit(big, 190, 960, 0.5), lineHeight: 1.05, color: CREAM, textShadow: '0 0 60px rgba(253,185,39,0.4), 0 10px 0 #3a1500' }}>{big}</div>
      <div style={{ fontFamily: OUTFIT, fontWeight: 600, fontSize: 44, color: 'rgba(255,244,220,0.8)', marginTop: 30 }}>{range}</div>
    </div>
    {stats && (
      <div style={{ position: 'absolute', top: 960, left: 60, right: 60, display: 'flex', justifyContent: 'space-around' }}>
        {stats.map((s) => (
          <div key={s[1]} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: ANTON, fontSize: 120, color: GOLD, lineHeight: 1 }}>{s[0]}</div>
            <div style={{ fontFamily: BEBAS, fontSize: 40, letterSpacing: '0.15em', color: CREAM }}>{s[1]}</div>
          </div>
        ))}
      </div>
    )}
  </Page>
);
const Outro = ({ n, total }) => (
  <Page n={n} total={total}>
    <div style={{ position: 'absolute', top: 480, width: '100%', textAlign: 'center' }}>
      <div style={{ fontFamily: ANTON, fontSize: 200, color: GOLD, lineHeight: 1 }}>HOOPX</div>
      <div style={{ fontFamily: BEBAS, fontSize: 64, letterSpacing: '0.2em', color: CREAM, marginTop: 24 }}>FOLLOW FOR DAILY NBA</div>
      <div style={{ fontFamily: OUTFIT, fontWeight: 600, fontSize: 40, color: 'rgba(255,244,220,0.75)', marginTop: 30 }}>@hoopxnba · hoopxnba.com</div>
      <div style={{ fontFamily: OUTFIT, fontSize: 28, color: 'rgba(255,244,220,0.45)', marginTop: 60 }}>Unofficial fan account, not affiliated with the NBA or any team.</div>
    </div>
  </Page>
);
const Row = ({ g }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '26px 40px', margin: '0 60px 24px', borderRadius: 24, background: 'rgba(255,255,255,0.06)', border: '2px solid rgba(253,185,39,0.3)', fontFamily: ANTON, fontSize: 70 }}>
    <span style={{ color: g.winner === g.away ? GOLD : CREAM }}>{g.away} {g.as}</span>
    <span style={{ fontFamily: BEBAS, fontSize: 34, color: 'rgba(255,244,220,0.6)', letterSpacing: '0.1em' }}>{g.label}</span>
    <span style={{ color: g.winner === g.home ? GOLD : CREAM }}>{g.hs} {g.home}</span>
  </div>
);

export const Carousel = ({ kind, data, slide }) => {
  if (kind === 'week') {
    const total = 5;
    if (slide === 0) return <Cover n={1} total={total} small="THE NBA" big="WEEK IN REVIEW" range={data.range} stats={[[data.games, 'GAMES'], [data.ot, 'OVERTIMES'], [data.nights, 'NIGHTS']]} />;
    if (slide === 1) {
      return (
        <Page n={2} total={total}>
          <Title text="TOP PERFORMANCES" />
          <div style={{ position: 'absolute', top: 210, left: 0, right: 0 }}>
            {data.top.map((p) => (
              <div key={p.name + p.date} style={{ display: 'flex', alignItems: 'center', gap: 28, padding: '10px 44px', margin: '0 50px 14px', borderRadius: 24, background: 'rgba(255,255,255,0.06)' }}>
                <Portrait photo={p.photo} team={p} size={130} />
                <div>
                  <div style={{ fontFamily: ANTON, fontSize: fit(p.name, 56, 640, 0.5), color: CREAM }}>{p.name}</div>
                  <div style={{ fontFamily: BEBAS, fontSize: 48, letterSpacing: '0.08em', color: GOLD }}>{p.line}</div>
                  <div style={{ fontFamily: OUTFIT, fontSize: 26, color: 'rgba(255,244,220,0.6)' }}>{p.team} · {p.date}</div>
                </div>
              </div>
            ))}
          </div>
        </Page>
      );
    }
    if (slide === 2) return <Page n={3} total={total}><Title text="CLOSEST GAMES" sub="DECIDED BY THE FEWEST POINTS" /><div style={{ position: 'absolute', top: 300, left: 0, right: 0 }}>{data.closest.map((g, i) => <Row key={i} g={g} />)}</div></Page>;
    if (slide === 3) return <Page n={4} total={total}><Title text="BIGGEST BLOWOUTS" sub="THE MOST LOPSIDED RESULTS" /><div style={{ position: 'absolute', top: 300, left: 0, right: 0 }}>{data.blowouts.map((g, i) => <Row key={i} g={g} />)}</div></Page>;
    return <Outro n={5} total={total} />;
  }
  const total = data.players.length + 2;
  if (slide === 0) return <Cover n={1} total={total} small="THE SIX PLAYERS WE WATCH" big="HOOPX 6 WATCH" range={data.range} />;
  if (slide === total - 1) return <Outro n={total} total={total} />;
  const p = data.players[slide - 1];
  return (
    <Page n={slide + 1} total={total}>
      <Title text="HOOPX 6 WATCH" sub={p.team} />
      <div style={{ position: 'absolute', top: 260, width: '100%', display: 'flex', justifyContent: 'center' }}><Portrait photo={p.photo} team={p} size={460} /></div>
      <div style={{ position: 'absolute', top: 780, width: '100%', textAlign: 'center', fontFamily: ANTON, fontSize: fit(p.name, 120, 980, 0.5), color: CREAM, lineHeight: 1 }}>{p.name.toUpperCase()}</div>
      <div style={{ position: 'absolute', top: 930, width: '100%', textAlign: 'center' }}>
        {p.line ? (
          <>
            <div style={{ fontFamily: ANTON, fontSize: fit(p.line, 96, 980, 0.5), color: GOLD }}>{p.line}</div>
            <div style={{ fontFamily: BEBAS, fontSize: 52, letterSpacing: '0.12em', color: CREAM, marginTop: 14 }}>{p.result}</div>
            <div style={{ fontFamily: OUTFIT, fontSize: 30, color: 'rgba(255,244,220,0.6)', marginTop: 10 }}>{p.date}</div>
          </>
        ) : (
          <div style={{ fontFamily: BEBAS, fontSize: 56, letterSpacing: '0.12em', color: 'rgba(255,244,220,0.7)' }}>NO TOP-SCORER LINE THIS WEEK</div>
        )}
      </div>
    </Page>
  );
};
