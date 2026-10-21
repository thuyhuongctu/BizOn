// BizOn homepage intro — one continuous composition, 1920x1080.
// World = the homepage laid out as 1600px-wide panels (page scale 1.2), filmed by one camera.
const C = {
  bg: '#FBF4E8', card: '#FFFBF4', tray: '#F3E6CF', ink: '#033337', ink2: '#24403F', sub: '#3E5A5C',
  teal: '#006687', teal2: '#1E7E8C', orange: '#E8762D', gold: '#FDA127', accent: '#C2581B',
  c1: '#7FD3DC', c2: '#FFD58A', c3: '#F4B6C2', c4: '#A9DCC4', c5: '#D9F0F2',
};
const SANS = "'Be Vietnam Pro',system-ui,sans-serif";
const HEAD = "'Plus Jakarta Sans',system-ui,sans-serif";
const H = { fontFamily: HEAD, fontWeight: 800, letterSpacing: '-.02em', lineHeight: 1.14, margin: 0 };
const PW = 1600, L = 224, W = 1152, BASE = 1.2;
const TOP = { Hero: 0, Roles: 900, Games: 1800, Tools: 2700, Trailers: 3600, Evidence: 4500, Flow: 5400, Close: 6300 };
const IMG = 'assets/';

const P = (T, s, d) => clamp((T - s) / d, 0, 1);
const MOTION = {
  enter: (T, s, d = 0.7, dist = 34, axis = 'Y') => {
    const k = Easing.easeOutCubic(P(T, s, d));
    return { opacity: k, transform: `translate${axis}(${(1 - k) * dist}px)` };
  },
  pop: (T, s, d = 0.6) => {
    const k = P(T, s, d);
    return { opacity: Easing.easeOutCubic(Math.min(1, k * 2.2)), transform: `scale(${0.4 + 0.6 * Easing.easeOutBack(k)})` };
  },
  draw: (T, s, d) => Easing.easeInOutCubic(P(T, s, d)),
};
const wave = (T, period, amp, off = 0) => amp * (0.5 - 0.5 * Math.cos((2 * Math.PI * (T + off)) / period));

function camera(T, CUES, zoom) {
  const R = CUES.Roles, G = CUES.Games, Tl = CUES.Tools, Tr = CUES.Trailers, E = CUES.Evidence, F = CUES.Flow, Cl = CUES.Close;
  const y = (n, v) => TOP[n] + v;
  const K = [
    [0, 800, 450, 1], [3.4, 800, 450, 1], [7.4, 1080, y('Hero', 470), 1.45], [R - 0.7, 1060, y('Hero', 480), 1.5],
    [R + 0.4, 800, y('Roles', 450), 1], [R + 2.6, 800, y('Roles', 450), 1], [R + 3.4, 380, y('Roles', 425), 1.55], [G - 0.9, 1220, y('Roles', 425), 1.55],
    [G + 0.4, 800, y('Games', 450), 1], [Tl - 0.7, 800, y('Games', 450), 1.03],
    [Tl + 0.4, 800, y('Tools', 450), 1], [Tr - 0.7, 800, y('Tools', 460), 1.08],
    [Tr + 0.4, 790, y('Trailers', 330), 1.28], [E - 0.7, 810, y('Trailers', 340), 1.36],
    [E + 0.4, 800, y('Evidence', 420), 1.12], [F - 0.7, 800, y('Evidence', 420), 1.18],
    [F + 0.4, 800, y('Flow', 440), 1.2], [Cl - 0.7, 800, y('Flow', 440), 1.27],
    [Cl + 0.4, 800, y('Close', 450), 1], [Cl + 8, 820, y('Close', 455), 1.05],
  ];
  let i = 0;
  while (i < K.length - 2 && T > K[i + 1][0]) i++;
  const a = K[i], b = K[i + 1];
  const k = Easing.easeInOutCubic(clamp((T - a[0]) / (b[0] - a[0]), 0, 1));
  const lerp = (u, v) => u + (v - u) * k;
  const s = lerp(a[3], b[3]);
  return { x: lerp(a[1], b[1]), y: lerp(a[2], b[2]), s: 1 + (s - 1) * zoom };
}

function Wordmark({ size = 24, color = C.ink }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', color, fontFamily: SANS, fontWeight: 800, fontSize: size, letterSpacing: '-.045em', lineHeight: 1 }}>
      Biz
      <span style={{ position: 'relative', display: 'inline-block', width: '.86em', height: '.72em', border: '.15em solid currentColor', borderRadius: '50%', margin: '0 .02em 0 .04em', boxSizing: 'border-box' }}>
        <span style={{ position: 'absolute', right: '.06em', top: '50%', width: '.26em', height: '.26em', marginTop: '-.13em', borderRadius: '50%', background: C.gold }}></span>
      </span>
      n
    </span>
  );
}

const CamCtx = React.createContext(450);
function Panel({ name, bg, h = 900, children }) {
  const cy = React.useContext(CamCtx);
  const vis = Math.abs(cy - (TOP[name] + h / 2)) < h + 50;
  return <div style={{ position: 'absolute', left: 0, top: TOP[name], width: PW, height: h, background: bg, overflow: 'hidden', display: vis ? 'block' : 'none' }}>{children}</div>;
}

// ── Hero ─────────────────────────────────────────────
function Nav({ T }) {
  const links = ['Universe', 'Games', 'Classroom', 'Academic', 'Evidence', 'Pilot', 'About'];
  return (
    <div style={{ position: 'absolute', left: 216, top: 12, width: 1168, ...MOTION.enter(T, 0.1, 0.8, -40) }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto minmax(0,1fr) auto', alignItems: 'center', gap: 14, minHeight: 68, padding: '8px 10px 8px 20px', borderRadius: 999, background: C.card, boxShadow: '0 18px 30px -16px rgba(110,70,30,.35),inset 0 -6px 0 rgba(0,0,0,.05),inset 0 4px 0 rgba(255,255,255,.9)' }}>
        <Wordmark />
        <div style={{ justifySelf: 'center', display: 'flex', gap: 4, padding: 5, borderRadius: 999, background: C.tray, boxShadow: 'inset 0 3px 6px rgba(110,70,30,.18)', fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap' }}>
          {links.map(l => <span key={l} style={{ padding: '8px 14px', borderRadius: 999, color: C.sub }}>{l}</span>)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', padding: 4, borderRadius: 999, background: C.tray, boxShadow: 'inset 0 3px 5px rgba(110,70,30,.18)', fontSize: 12, fontWeight: 800 }}>
            <span style={{ padding: '7px 12px', borderRadius: 999, color: C.sub }}>VI</span>
            <span style={{ padding: '7px 12px', borderRadius: 999, background: C.teal, color: '#fff', boxShadow: 'inset 0 -3px 0 rgba(0,0,0,.2),0 4px 8px -3px rgba(0,60,80,.5)' }}>EN</span>
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, borderRadius: '50%', background: C.teal, color: '#fff', fontSize: 16, boxShadow: 'inset 0 -5px 0 rgba(0,0,0,.16),inset 0 3px 0 rgba(255,255,255,.35),0 8px 14px -8px rgba(0,60,80,.7)' }}>⬇</span>
          <span style={{ whiteSpace: 'nowrap', padding: '11px 18px', borderRadius: 999, background: C.orange, color: '#fff', fontFamily: HEAD, fontSize: 16, fontWeight: 700, boxShadow: 'inset 0 -5px 0 rgba(0,0,0,.16),inset 0 3px 0 rgba(255,255,255,.35),0 10px 18px -8px rgba(232,118,45,.7)' }}>Launch</span>
        </div>
      </div>
    </div>
  );
}

function HeroStage({ T, t0, left = 860, top = 170, w = 516 }) {
  const h = w * 1.02;
  const sh = 'drop-shadow(0 18px 14px rgba(110,70,30,.35))';
  const img = (src, style, popAt, motion) => (
    <div style={{ position: 'absolute', ...style, ...MOTION.pop(T, t0 + popAt, 0.7), transformOrigin: '50% 100%' }}>
      <img src={IMG + src} alt="" style={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain', ...motion }} />
    </div>
  );
  return (
    <div style={{ position: 'absolute', left, top, width: w, height: h }}>
      <div style={{ position: 'absolute', top: '2%', right: '6%', width: '58%', aspectRatio: '1', ...MOTION.pop(T, t0 + 0.2, 1.0) }}>
        <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: `url(${IMG}brand/trong-dong.svg) center/contain no-repeat`, boxShadow: 'inset 0 -16px 0 rgba(200,110,20,.22),inset 0 10px 0 rgba(255,255,255,.4)', opacity: 0.9, transform: `rotate(${T * 4.5}deg)` }}></div>
      </div>
      <div style={{ position: 'absolute', left: '4%', right: '4%', bottom: '15%', height: '20%', borderRadius: '50%', background: '#F2C98A', boxShadow: 'inset 0 -14px 0 rgba(140,80,20,.18),inset 0 8px 0 rgba(255,255,255,.45),0 30px 40px -20px rgba(110,70,30,.5)', ...MOTION.pop(T, t0 + 0.4, 0.7) }}></div>
      {img('character/huong-ao-dai-sen.png', { left: '30%', bottom: '22%', height: '62%', width: '30%' }, 0.8, { filter: sh, transform: `translateY(${-wave(T, 6, 14)}px)`, objectPosition: 'bottom' })}
      {img('character/anh-tu-ao-dai-welcome-cut-v2.webp', { left: '50%', bottom: '22%', height: '70%', width: '34%' }, 1.1, { filter: sh, transform: `translateY(${-wave(T, 7, 14, 2)}px)`, objectPosition: 'bottom' })}
      {img('character/teo-soi-wink-cut.webp', { left: '4%', bottom: '36%', width: '22%', height: '28%' }, 1.4, { filter: 'drop-shadow(0 14px 10px rgba(30,80,40,.35))', transform: `translateY(${-wave(T, 3.6, 8)}px) rotate(${-3 + wave(T, 3.6, 6)}deg)`, objectPosition: 'bottom' })}
      {img('hc/stamp/vn.png', { left: '-6%', top: '-6%', width: '20%', height: '20%' }, 1.7, { borderRadius: '50%', mixBlendMode: 'multiply', transform: `rotate(${-8 + wave(T, 7, 14)}deg)` })}
      {img('hc/stamp/passport-cover-cut.webp', { right: '1%', top: '37%', width: '15%', height: '22%' }, 1.9, { filter: 'drop-shadow(0 14px 14px rgba(3,51,55,.28))', transform: `translateY(${-wave(T, 5, 14, 1)}px)` })}
    </div>
  );
}

function River({ T, t0 }) {
  const k = MOTION.draw(T, t0, 0.9);
  const x1 = -((T / 6) * 72) % 72, x2 = ((T / 4) * 72) % 72;
  return (
    <div style={{ position: 'absolute', left: 0, top: 790, width: PW, height: 150, transform: `translateY(${(1 - k) * 150}px)` }}>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: 40, background: `radial-gradient(circle at 36px 0, transparent 35px, #5DB8C4 36px) ${x1}px 0/72px 36px repeat-x, linear-gradient(#5DB8C4,#5DB8C4) 0 36px/100% 100% no-repeat` }}></div>
      <img src={IMG + 'character/phu-sa/huong-tu-ghe-chonoi-v2.webp'} alt="" style={{ position: 'absolute', left: '50%', marginLeft: -110, bottom: 34, width: 220, filter: 'drop-shadow(0 10px 8px rgba(0,50,60,.35))', transform: `translateX(${-66 * Math.cos((2 * Math.PI * T) / 22)}px) rotate(${-2 * Math.cos((2 * Math.PI * T) / 22)}deg)` }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: 92, background: `radial-gradient(circle at 36px 0, transparent 35px, #1E7E8C 36px) ${x2}px 0/72px 36px repeat-x, linear-gradient(#1E7E8C,#1E7E8C) 0 36px/100% 100% no-repeat` }}></div>
    </div>
  );
}

const ctaBase = { display: 'inline-flex', alignItems: 'center', gap: 10, minHeight: 58, padding: '0 26px', borderRadius: 22, fontFamily: HEAD, fontSize: 19, fontWeight: 700, whiteSpace: 'nowrap' };
const CTA_TEAL = { ...ctaBase, background: C.teal, color: '#fff', boxShadow: 'inset 0 -7px 0 rgba(0,0,0,.2),inset 0 4px 0 rgba(255,255,255,.25),0 16px 24px -12px rgba(0,102,135,.8)' };
const pill = { padding: '8px 13px', borderRadius: 999, fontSize: 13, fontWeight: 800, boxShadow: 'inset 0 -3px 0 rgba(0,0,0,.08)', whiteSpace: 'nowrap' };

function Hero({ T }) {
  return (
    <Panel name="Hero" bg={C.bg}>
      <Nav T={T} />
      <div style={{ position: 'absolute', left: L, top: 136, width: 610 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 16px 8px 8px', borderRadius: 999, background: C.card, boxShadow: '0 10px 20px -12px rgba(110,70,30,.4),inset 0 -4px 0 rgba(0,0,0,.05)', fontSize: 13, fontWeight: 700, color: C.sub, ...MOTION.enter(T, 0.4) }}>
          <span style={{ width: 26, height: 26, borderRadius: '50%', background: '#DA251D', display: 'grid', placeItems: 'center', color: '#FFDD00', fontSize: 13, boxShadow: 'inset 0 -3px 0 rgba(0,0,0,.18)' }}>★</span>
          Designed in the Mekong Delta · Built for the World
        </span>
        <h1 style={{ ...H, marginTop: 22, fontSize: 56, color: C.ink }}>
          <span style={{ display: 'block', ...MOTION.enter(T, 0.7, 0.8, 40) }}>Simulation-based business learning</span>
          <span style={{ display: 'block', color: C.teal, ...MOTION.enter(T, 1.1, 0.8, 40) }}>from Vietnam to the world.</span>
        </h1>
        <p style={{ margin: '22px 0 0', maxWidth: '33em', fontSize: 18, lineHeight: 1.65, color: C.sub, textWrap: 'pretty', ...MOTION.enter(T, 1.7) }}>Explainable business simulations for learning, research and internationalization – combining deterministic engines, AI-enhanced reflection and open-science practices.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 30 }}>
          <span style={{ ...CTA_TEAL, ...MOTION.enter(T, 2.2) }}>Start with Bến Phù Sa →</span>
          <span style={{ ...ctaBase, background: C.card, color: C.ink, boxShadow: 'inset 0 -7px 0 rgba(110,70,30,.12),inset 0 4px 0 rgba(255,255,255,.9),0 16px 24px -14px rgba(110,70,30,.45)', ...MOTION.enter(T, 2.35) }}>See all simulations</span>
          <span style={{ ...ctaBase, background: C.ink, color: '#FFD58A', fontSize: 17, fontWeight: 800, boxShadow: 'inset 0 -7px 0 rgba(0,0,0,.3),inset 0 4px 0 rgba(255,255,255,.1),0 16px 24px -14px rgba(3,51,55,.7)', ...MOTION.enter(T, 2.5) }}>▶ Get it on Google Play</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 28 }}>
          <span style={{ ...pill, background: C.c5, color: '#03474F', ...MOTION.pop(T, 2.9) }}>Deterministic simulation engine</span>
          <span style={{ ...pill, background: C.c2, color: '#7A4A0E', ...MOTION.pop(T, 3.05) }}>7 markets · 6 quarters</span>
          <span style={{ ...pill, background: '#FBD9E0', color: '#7A2338', ...MOTION.pop(T, 3.2) }}>Preliminary classroom evidence</span>
        </div>
      </div>
      <HeroStage T={T} t0={0.3} />
      <River T={T} t0={0} />
    </Panel>
  );
}

// ── Roles ────────────────────────────────────────────
const ROLES = [
  { n: '01', bg: C.c2, t: 'Students', d: 'Play a short round, make decisions and get feedback from Lumina.', p: ['Bến Phù Sa →', 'Bật Nghiệp →', 'Brand Passport →', 'Durian Passport →'] },
  { n: '02', bg: C.c1, t: 'Instructors', d: 'Run a class, follow decision traces and grade with rubrics.', p: ['Open my class dashboard →', 'Instructor page →', 'Grading scale →'], hl: 0 },
  { n: '03', bg: C.c4, t: 'Researchers', d: 'Review the models, assumptions, equations and published limitations.', p: ['Academic framework →', 'IE Lab →'] },
  { n: '04', bg: C.c3, t: 'Institutions · partners · funders', d: 'See pilot results and how to deploy at your institution.', p: ['Evidence →', 'Pilot programme →'] },
];
function Roles({ T, CUES }) {
  const R = CUES.Roles, cw = (W - 60) / 4;
  const pan = clamp((T - (R + 3.4)) / (CUES.Games - 0.9 - (R + 3.4)), 0, 1);
  const focus = pan * 3;
  return (
    <Panel name="Roles" bg={C.teal2}>
      <div style={{ position: 'absolute', left: L, top: 90, width: W }}>
        <div style={{ fontFamily: HEAD, fontSize: 16, fontWeight: 700, color: '#FFD58A', ...MOTION.enter(T, R + 0.3) }}>Start from your role</div>
        <h2 style={{ ...H, marginTop: 6, fontSize: 52, maxWidth: '18em', color: '#fff', ...MOTION.enter(T, R + 0.5, 0.8, 40) }}>Each audience has its own way in.</h2>
      </div>
      {ROLES.map((r, i) => {
        const near = T > R + 3.0 ? Math.max(0, 1 - Math.abs(focus - i)) : 0;
        return (
          <div key={i} style={{ position: 'absolute', left: L + i * (cw + 20), top: 270, width: cw, ...MOTION.enter(T, R + 1.1 + i * 0.18, 0.8, 80) }}>
            <div style={{ padding: '26px 24px', borderRadius: 30, background: r.bg, display: 'flex', flexDirection: 'column', gap: 12, minHeight: 310, boxSizing: 'border-box', boxShadow: `inset 0 -10px 0 rgba(0,0,0,.08),inset 0 6px 0 rgba(255,255,255,.5),0 ${24 + near * 16}px ${30 + near * 14}px -18px rgba(0,30,40,.55)`, transform: `translateY(${-near * 12}px) rotate(${(1 - Math.min(1, P(T, R + 1.1 + i * 0.18, 0.9))) * (i % 2 ? 4 : -4)}deg)` }}>
              <div style={{ width: 52, height: 52, borderRadius: 18, background: C.card, display: 'grid', placeItems: 'center', fontFamily: HEAD, fontSize: 22, fontWeight: 800, color: C.teal, boxShadow: 'inset 0 -5px 0 rgba(0,0,0,.08),0 8px 14px -8px rgba(0,0,0,.35)' }}>{r.n}</div>
              <div style={{ fontFamily: HEAD, fontSize: 24, fontWeight: 800, lineHeight: 1.14, color: C.ink }}>{r.t}</div>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: C.ink2, flex: 1 }}>{r.d}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {r.p.map((t, j) => (
                  <span key={j} style={{ ...pill, background: r.hl === j ? '#FFD58A' : 'rgba(255,251,244,.85)', color: C.ink, ...MOTION.pop(T, R + 1.7 + i * 0.18 + j * 0.1, 0.5) }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </Panel>
  );
}

// ── Games ────────────────────────────────────────────
const GAMES = [
  { lv: 1, c: '#2E7139', img: 'covers/ben-phu-sa-3d.webp', z: 1, o: '50% 50%', k: 'LEVEL 1 · START-UP', t: 'Bến Phù Sa', d: "A riverside street-vendor start-up on Bến Phù Sa's floating market: pick a Method, Product and Location each week, and learn when to test cheap and when to scale.", m: ['5 weeks', 'Solo or team play'], alt: ['3D · team play', '2D'] },
  { lv: 2, c: '#A84A14', img: 'covers/bat-nghiep-3d.webp', z: 1, o: '50% 50%', k: 'LEVEL 2 · RUNNING A BUSINESS', t: 'Bật Nghiệp', d: 'Build and operate a business through multi-round strategic decisions in a Vietnamese context.', m: ['6 decision rounds', 'Market arena'], alt: ['2D'] },
  { lv: 3, c: '#006687', img: 'covers/ho-chieu-thuong-hieu-3d.webp', z: 1, o: '50% 50%', k: 'LEVEL 3 · GOING GLOBAL', t: 'Brand Passport', d: 'Take a Vietnamese brand across borders through market intelligence, entry strategy, adaptation and resilience.', m: ['6 quarters', '7 markets'], alt: ['2D', 'Lite 3D', 'Lite 2D'] },
  { lv: 3, c: '#006687', img: 'covers/ho-chieu-sau-rieng-3d.webp', z: 1, o: '50% 50%', k: 'LEVEL 3 · GOING GLOBAL', t: 'Durian Passport', d: 'Take Vietnamese durian to the world over 6 seasons on a walkable 3D map: planting-area codes, the China phytosanitary protocol, official vs border trade, frozen and premium markets. Teams of 5 roles face AI rivals.', m: ['6 seasons', 'Teams of 5 roles'], alt: ['2D', 'Classroom playbook'] },
];
function GameCard({ g, T, kb }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '640px 1fr', gap: 8, borderRadius: 34, background: C.card, padding: 12, boxShadow: 'inset 0 -9px 0 rgba(110,70,30,.08),inset 0 5px 0 rgba(255,255,255,.95),0 30px 44px -26px rgba(110,70,30,.6)' }}>
      <div style={{ position: 'relative', height: 400, borderRadius: 26, overflow: 'hidden', background: g.c, boxShadow: 'inset 0 -8px 0 rgba(0,0,0,.08)' }}>
        <img src={IMG + g.img} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transformOrigin: g.o, transform: `scale(${g.z * (1 + kb * 0.1)})` }} />
        <span style={{ position: 'absolute', left: 14, top: 14, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px 6px 6px', borderRadius: 999, background: 'rgba(255,251,244,.95)', font: `800 13px/1 ${HEAD}`, color: C.ink, boxShadow: '0 10px 18px -10px rgba(0,0,0,.55)' }}>
          <b style={{ display: 'grid', placeItems: 'center', width: 30, height: 30, borderRadius: '50%', background: g.c, color: '#fff', fontSize: 15, boxShadow: 'inset 0 -3px 0 rgba(0,0,0,.22)' }}>{g.lv}</b>Level {g.lv}
        </span>
        <span style={{ position: 'absolute', right: 14, top: 14, display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44, padding: '0 16px 0 6px', borderRadius: 999, background: 'rgba(3,51,55,.86)', color: '#fff', font: `800 14px ${HEAD}`, boxShadow: '0 10px 18px -10px rgba(0,0,0,.6)' }}>
          <span style={{ display: 'grid', placeItems: 'center', width: 32, height: 32, borderRadius: '50%', background: C.gold, color: C.ink, fontSize: 12 }}>▶</span>Trailer
        </span>
      </div>
      <div style={{ padding: '22px 22px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.12em', color: g.c }}>{g.k}</div>
        <h3 style={{ ...H, fontSize: 38, lineHeight: 1.1, color: C.ink }}>{g.t}</h3>
        <p style={{ margin: 0, fontSize: 17, lineHeight: 1.6, color: C.sub, flex: 1, textWrap: 'pretty' }}>{g.d}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {g.m.map(m => <span key={m} style={{ padding: '6px 12px', borderRadius: 999, background: C.tray, fontSize: 13, fontWeight: 700, color: C.ink2 }}>{m}</span>)}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px 18px', marginTop: 6 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, minHeight: 52, padding: '0 24px', borderRadius: 18, background: C.orange, color: '#1F0E02', font: `800 17px ${HEAD}`, boxShadow: 'inset 0 -5px 0 rgba(0,0,0,.16),inset 0 3px 0 rgba(255,255,255,.35),0 12px 20px -12px rgba(194,88,27,.8)' }}>Play in 3D <span>→</span></span>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px 14px', fontSize: 14, fontWeight: 700, color: C.sub }}>
            <span>Other versions:</span>
            {g.alt.map(a => <span key={a} style={{ color: C.teal, textDecoration: 'underline', textUnderlineOffset: 3 }}>{a}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}
function Games({ T, CUES }) {
  const G = CUES.Games, s0 = G + 1.4, step = 2.8;
  const act = [1, 2, 3].reduce((a, i) => a + MOTION.draw(T, s0 + i * step - 0.3, 0.7), 0);
  const inK = MOTION.draw(T, s0 - 0.4, 0.9);
  return (
    <Panel name="Games" bg={C.bg}>
      <div style={{ position: 'absolute', left: L, top: 70, width: W }}>
        <div style={{ fontFamily: HEAD, fontSize: 16, fontWeight: 700, color: C.accent, ...MOTION.enter(T, G + 0.3) }}>Three game levels · three support tools</div>
        <h2 style={{ ...H, marginTop: 6, fontSize: 52, maxWidth: '18em', color: C.ink, ...MOTION.enter(T, G + 0.5, 0.8, 40) }}>Learn business by making consequential decisions.</h2>
        <p style={{ margin: '18px 0 0', maxWidth: '40em', fontSize: 17, lineHeight: 1.6, color: C.sub, ...MOTION.enter(T, G + 0.8) }}>Start at Level 1; each level builds on the one before. Every game has a 3D version and a 2D version.</p>
      </div>
      {GAMES.map((g, i) => {
        const off = i - act;
        const near = Math.max(0, 1 - Math.abs(off));
        const kb = clamp((T - (s0 + (i - 0.3) * step)) / (step * 1.6), 0, 1);
        return (
          <div key={i} style={{ position: 'absolute', left: L, top: 320, width: W, opacity: inK * (0.35 + 0.65 * near), transform: `translateX(${off * 1210 + (1 - inK) * 500}px) scale(${0.92 + 0.08 * near})`, transformOrigin: '50% 50%' }}>
            <GameCard g={g} T={T} kb={kb} />
          </div>
        );
      })}
      <div style={{ position: 'absolute', left: L, top: 780, display: 'flex', gap: 10, ...MOTION.enter(T, s0) }}>
        {GAMES.map((g, i) => {
          const on = Math.max(0, 1 - Math.abs(i - act));
          return (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px 6px 6px', borderRadius: 999, background: on > 0.5 ? g.c : C.tray, color: on > 0.5 ? '#fff' : C.ink2, font: `800 13px/1 ${HEAD}`, boxShadow: 'inset 0 -3px 0 rgba(0,0,0,.1)', transform: `scale(${1 + on * 0.08})` }}>
              <b style={{ display: 'grid', placeItems: 'center', width: 26, height: 26, borderRadius: '50%', background: on > 0.5 ? 'rgba(255,251,244,.95)' : g.c, color: on > 0.5 ? g.c : '#fff', fontSize: 13 }}>{g.lv}</b>{g.t}
            </span>
          );
        })}
      </div>
    </Panel>
  );
}

// ── Tools ────────────────────────────────────────────
const TOOLS = [
  { img: 'hc/item/forecast.png', k: 'STRATEGY MODEL', t: 'IE Lab', d: 'Experiment with internationalization assumptions and observe how strategic variables change outcomes.', l: ['Explore the model'] },
  { img: 'cmr-lab/dragon-magnifier.jpg', pad: true, mul: true, k: 'PRACTICUM LABS', t: 'Practicum labs', d: 'Three one-session labs: contribution margin ratio (CMR), cost–volume–profit and break-even (CVP), and the gravity model of trade and FDI into Viet Nam.', l: ['CMR Lab', 'CVP Lab', 'Gravity Lab'] },
  { img: 'character/arcade-rong-bay-sau-rieng.webp', pad: true, k: 'SKILL DRILLS', t: 'Arcade', d: 'Short, focused simulations for practicing one business skill or decision pattern at a time.', l: ['Practice a skill'] },
];
function Tools({ T, CUES }) {
  const S = CUES.Tools;
  return (
    <Panel name="Tools" bg={C.bg}>
      <div style={{ position: 'absolute', left: L, top: 120, width: W, display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '6px 18px' }}>
        <h3 style={{ ...H, fontSize: 44, color: C.ink, ...MOTION.enter(T, S + 0.3) }}>Support tools</h3>
        <p style={{ margin: 0, fontSize: 20, color: C.sub, ...MOTION.enter(T, S + 0.5) }}>Use alongside the games to practise one model or skill at a time.</p>
      </div>
      {TOOLS.map((x, i) => (
        <div key={i} style={{ position: 'absolute', left: L, top: 230 + i * 172, width: W, ...MOTION.enter(T, S + 0.8 + i * 0.35, 0.8, i % 2 ? -160 : 160, 'X') }}>
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 22, alignItems: 'center', padding: 18, borderRadius: 30, background: C.card, boxShadow: 'inset 0 -6px 0 rgba(110,70,30,.07), 0 14px 22px -18px rgba(110,70,30,.5)' }}>
            <div style={{ width: 120, height: 120, borderRadius: 24, overflow: 'hidden', background: '#fff', boxShadow: 'inset 0 -5px 0 rgba(0,0,0,.05)', ...MOTION.pop(T, S + 1.1 + i * 0.35) }}>
              <img src={IMG + x.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', boxSizing: 'border-box', padding: x.pad ? '6%' : 0, mixBlendMode: x.mul ? 'multiply' : 'normal' }} />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.12em', color: '#A84A14' }}>{x.k}</div>
              <h4 style={{ ...H, marginTop: 3, fontSize: 26, color: C.ink }}>{x.t}</h4>
              <p style={{ margin: '6px 0 0', fontSize: 17, lineHeight: 1.5, color: C.sub, maxWidth: '52em' }}>{x.d}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                {x.l.map((t, j) => <span key={t} style={{ ...pill, background: C.tray, color: C.ink, ...MOTION.pop(T, S + 1.4 + i * 0.35 + j * 0.1, 0.5) }}>{t}</span>)}
              </div>
            </div>
          </div>
        </div>
      ))}
    </Panel>
  );
}

// ── Trailers ─────────────────────────────────────────
const TRAILERS = [
  { img: 'video/bizon-trailer-poster.jpg', t: 'Bật Nghiệp', d: 'A 6-round market arena · English narration · 1:30' },
  { img: 'video/ben-phu-sa-trailer-poster.jpg', t: 'Bến Phù Sa', d: 'A riverside street-vendor start · English narration · 1:30' },
  { img: 'video/bp-trailer-poster.jpg', t: 'Brand Passport', d: 'Taking a brand to 7 markets · English narration · 1:30' },
  { img: 'video/srp-trailer-poster.jpg', t: 'Durian Passport', d: 'Durian export through 6 seasons · English narration · 1:40' },
];
function Trailers({ T, CUES }) {
  const S = CUES.Trailers, cw = (W - 66) / 4;
  return (
    <Panel name="Trailers" bg={C.ink}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: PW, height: 36, background: `radial-gradient(circle at 36px 0,${C.bg} 35px,transparent 36px) 0 0/72px 36px repeat-x` }}></div>
      <div style={{ position: 'absolute', left: L, top: 92, width: W }}>
        <div style={{ fontFamily: HEAD, fontSize: 16, fontWeight: 700, color: '#FFD58A', ...MOTION.enter(T, S + 0.4) }}>Trailer · built from real in-game footage</div>
        <h2 style={{ ...H, marginTop: 6, fontSize: 52, color: '#fff', ...MOTION.enter(T, S + 0.6, 0.8, 40) }}>Watch before you play.</h2>
      </div>
      {TRAILERS.map((x, i) => {
        const fs = S + 2.0 + i * 1.1;
        const f = Math.max(0, Math.min(MOTION.draw(T, fs, 0.4), 1 - MOTION.draw(T, fs + 1.0, 0.4)));
        return (
          <div key={i} style={{ position: 'absolute', left: L + i * (cw + 22), top: 248, width: cw, ...MOTION.enter(T, S + 0.9 + i * 0.15, 0.8, 60) }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 12, borderRadius: 30, background: '#0B4A4F', color: '#E1F2F5', boxShadow: `inset 0 -8px 0 rgba(0,0,0,.2),inset 0 5px 0 rgba(255,255,255,.08),0 ${f * 30}px ${f * 40}px -20px rgba(0,0,0,.7)`, transform: `translateY(${-f * 14}px) scale(${1 + f * 0.05})` }}>
              <div style={{ position: 'relative', aspectRatio: '16/9', borderRadius: 22, overflow: 'hidden', background: '#022225' }}>
                <img src={IMG + x.img} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1 + f * 0.08})` }} />
                <span style={{ position: 'absolute', right: 14, top: 14, width: 50, height: 50, borderRadius: '50%', background: C.gold, display: 'grid', placeItems: 'center', color: C.ink, fontSize: 16, boxShadow: 'inset 0 -5px 0 rgba(0,0,0,.18),0 8px 14px -6px rgba(0,0,0,.5)', transform: `scale(${1 + f * 0.18})` }}>▶</span>
              </div>
              <div style={{ padding: '0 8px 8px' }}>
                <div style={{ fontFamily: HEAD, fontSize: 24, fontWeight: 700, color: '#fff' }}>{x.t}</div>
                <div style={{ marginTop: 2, fontSize: 14, color: '#9CC9C9' }}>{x.d}</div>
              </div>
            </div>
          </div>
        );
      })}
      <div style={{ position: 'absolute', left: 0, bottom: 0, width: PW, height: 36, background: `radial-gradient(circle at 36px 36px,${C.bg} 35px,transparent 36px) 0 0/72px 36px repeat-x` }}></div>
    </Panel>
  );
}

// ── Evidence ─────────────────────────────────────────
const PRINC = [
  { n: '01', bg: C.c1, t: 'Explainable engine', d: 'Core scoring remains deterministic so results can be inspected, discussed and reproduced.' },
  { n: '02', bg: C.c2, t: 'Observable decisions', d: 'Strategic choices leave traces for debriefing, rubrics, reflection and classroom analysis.' },
  { n: '03', bg: C.c3, t: 'Learning evidence', d: 'Game mechanics connect with learning outcomes, pre/post measures and documented limitations.' },
];
function Evidence({ T, CUES }) {
  const S = CUES.Evidence, cw = (W - 48) / 2;
  const btn = { padding: '13px 20px', borderRadius: 18, background: C.card, color: C.ink, fontWeight: 800, fontSize: 14, boxShadow: 'inset 0 -5px 0 rgba(110,70,30,.12),0 12px 20px -14px rgba(110,70,30,.5)' };
  return (
    <Panel name="Evidence" bg={C.bg}>
      <div style={{ position: 'absolute', left: L, top: 190, width: cw }}>
        <div style={{ fontFamily: HEAD, fontSize: 16, fontWeight: 700, color: C.accent, ...MOTION.enter(T, S + 0.3) }}>Evidence before marketing</div>
        <h2 style={{ ...H, marginTop: 6, fontSize: 52, color: C.ink, ...MOTION.enter(T, S + 0.5, 0.8, 40) }}>Learning that can be examined.</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 26 }}>
          {['Preliminary classroom pilot: 40 learners', 'Published model cards and equations', 'AI interprets; it does not replace scoring'].map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, fontWeight: 700, color: C.sub, ...MOTION.enter(T, S + 1.2 + i * 0.25, 0.6, -24, 'X') }}>
              <span style={{ width: 14, height: 14, borderRadius: '50%', background: C.gold, boxShadow: 'inset 0 -3px 0 rgba(0,0,0,.15)', ...MOTION.pop(T, S + 1.3 + i * 0.25, 0.5) }}></span>{t}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 28 }}>
          <span style={{ ...btn, ...MOTION.enter(T, S + 2.2) }}>View Academic Framework →</span>
          <span style={{ ...btn, ...MOTION.enter(T, S + 2.35) }}>View Evidence →</span>
        </div>
      </div>
      <div style={{ position: 'absolute', left: L + cw + 48, top: 190, width: cw, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {PRINC.map((p, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '56px 1fr', gap: 16, alignItems: 'start', padding: 20, borderRadius: 26, background: C.card, boxShadow: 'inset 0 -7px 0 rgba(110,70,30,.08),inset 0 4px 0 #fff,0 18px 26px -20px rgba(110,70,30,.5)', ...MOTION.enter(T, S + 1.0 + i * 0.4, 0.8, 120, 'X') }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: p.bg, display: 'grid', placeItems: 'center', fontFamily: HEAD, fontWeight: 800, fontSize: 20, color: C.ink, boxShadow: 'inset 0 -5px 0 rgba(0,0,0,.1),inset 0 3px 0 rgba(255,255,255,.5)', ...MOTION.pop(T, S + 1.3 + i * 0.4) }}>{p.n}</div>
            <div>
              <div style={{ fontFamily: HEAD, fontSize: 22, fontWeight: 800, lineHeight: 1.15, color: C.ink }}>{p.t}</div>
              <p style={{ margin: '4px 0 0', fontSize: 15, lineHeight: 1.55, color: C.sub }}>{p.d}</p>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

// ── Flow ─────────────────────────────────────────────
const FLOW = [
  ['01', C.c1, 'Research', 'IB · Entrepreneurship'], ['02', C.c2, 'Model', 'Assumptions & parameters'], ['03', C.c3, 'Simulation', 'Consequential scenarios'],
  ['04', C.c4, 'Decision', 'Actions & trade-offs'], ['05', C.c1, 'Outcome', 'Explainable consequences'], ['06', C.c2, 'Reflection', 'AI-enhanced questioning'], ['07', C.c3, 'Evidence', 'Observable learning artifacts'],
];
function Flow({ T, CUES }) {
  const S = CUES.Flow, inner = W - 56, colW = (inner - 6 * 14) / 7;
  const line = MOTION.draw(T, S + 0.9, 0.45 * 6 + 0.4);
  return (
    <Panel name="Flow" bg={C.bg}>
      <div style={{ position: 'absolute', left: L, top: 270, width: W, padding: '34px 28px', boxSizing: 'border-box', borderRadius: 36, background: C.tray, boxShadow: 'inset 0 6px 12px rgba(110,70,30,.15)', ...MOTION.enter(T, S + 0.2, 0.8, 50) }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
          <div style={{ fontFamily: HEAD, fontSize: 32, fontWeight: 800, color: C.ink, ...MOTION.enter(T, S + 0.5) }}>From theory to decision.</div>
          <div style={{ fontFamily: HEAD, fontSize: 16, fontWeight: 700, color: C.accent, ...MOTION.enter(T, S + 0.7) }}>Research → learning design</div>
        </div>
        <div style={{ position: 'relative', marginTop: 30 }}>
          <div style={{ position: 'absolute', left: colW / 2, top: 30, height: 4, borderRadius: 2, width: (inner - colW) * line, background: C.teal, opacity: 0.35 }}></div>
          <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(7,minmax(0,1fr))', gap: 14 }}>
            {FLOW.map((f, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 8 }}>
                <span style={{ width: 64, height: 64, borderRadius: '50%', background: f[1], display: 'grid', placeItems: 'center', fontFamily: HEAD, fontSize: 22, fontWeight: 800, color: C.ink, boxShadow: 'inset 0 -6px 0 rgba(0,0,0,.12),inset 0 4px 0 rgba(255,255,255,.55),0 12px 16px -10px rgba(110,70,30,.6)', ...MOTION.pop(T, S + 0.9 + i * 0.45) }}>{f[0]}</span>
                <span style={{ fontFamily: HEAD, fontSize: 19, fontWeight: 800, lineHeight: 1.14, color: C.ink, ...MOTION.enter(T, S + 1.05 + i * 0.45, 0.5, 14) }}>{f[2]}</span>
                <span style={{ fontSize: 13, lineHeight: 1.4, color: C.sub, ...MOTION.enter(T, S + 1.15 + i * 0.45, 0.5, 14) }}>{f[3]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
}

// ── Close ────────────────────────────────────────────
function Close({ T, CUES }) {
  const S = CUES.Close;
  const press = T > S + 3.2 && T < S + 3.6 ? 1 : 0;
  return (
    <Panel name="Close" bg={C.bg}>
      <div style={{ position: 'absolute', left: L, top: 250, width: 600 }}>
        <div style={{ ...MOTION.pop(T, S + 0.5, 0.8), transformOrigin: '0 50%' }}><Wordmark size={132} /></div>
        <div style={{ display: 'flex', marginTop: 56, ...MOTION.enter(T, S + 1.4) }}>
          <span style={{ ...CTA_TEAL, minHeight: 72, padding: '0 34px', fontSize: 26, borderRadius: 26, transform: `translateY(${press * 3}px) scale(${1 + 0.04 * Math.sin(Math.max(0, T - S - 2) * 3)})` }}>Start with Bến Phù Sa →</span>
        </div>
        <div style={{ marginTop: 26, fontFamily: HEAD, fontSize: 28, fontWeight: 700, color: C.sub, ...MOTION.enter(T, S + 1.9) }}>bizonland.com</div>
      </div>
      <HeroStage T={T} t0={S + 0.3} />
      <River T={T} t0={S - 2} />
    </Panel>
  );
}


const VO = [
  ['01-hero', 'Hero', 1.0], ['02-roles', 'Roles', 1.0], ['03-games', 'Games', 0.8], ['04-tools', 'Tools', 0.6],
  ['05-trailers', 'Trailers', 1.0], ['06-evidence', 'Evidence', 0.1], ['07-flow', 'Flow', 1.0], ['08-close', 'Close', 1.2],
];
function useVoiceover(T, CUES, playing, enabled, volume) {
  const ref = React.useRef(null);
  if (!ref.current && typeof Audio !== 'undefined') {
    ref.current = VO.map(([f]) => { const a = new Audio(IMG + 'vo/' + f + '.mp3'); a.preload = 'auto'; return a; });
  }
  React.useEffect(() => () => ref.current && ref.current.forEach(a => a.pause()), []);
  React.useEffect(() => {
    const list = ref.current; if (!list) return;
    VO.forEach(([, scene, off], i) => {
      const a = list[i], start = (CUES[scene] ?? 0) + off, local = T - start;
      const dur = isFinite(a.duration) ? a.duration : 12;
      a.volume = volume;
      if (enabled && playing && local >= 0 && local < dur) {
        if (Math.abs(a.currentTime - local) > 0.3) a.currentTime = local;
        if (a.paused) a.play().catch(() => {});
      } else if (!a.paused) a.pause();
    });
  });
  return ref;
}

// Background music: «Hương and the World (EN)», ducked to ~−20 dB under the voice,
// brought back up in the gaps and after the closing line. Same levels as the rendered MP4.
const MUSIC = IMG + 'audio/huong-and-the-world-en.mp3';
const MUSIC_GAP = 0.6, MUSIC_DUCK = 0.12, MUSIC_RAMP = 0.3;
function musicGain(T, CUES, total, voice, vo) {
  const fadeIn = clamp(T / 1.0, 0, 1), fadeOut = clamp((total - T) / 1.2, 0, 1);
  let duck = 0;
  if (voice) VO.forEach(([, scene, off], i) => {
    const s = (CUES[scene] ?? 0) + off, d = vo && isFinite(vo[i].duration) ? vo[i].duration : 0;
    if (!d) return;
    duck = Math.max(duck, clamp((T - s + MUSIC_RAMP) / MUSIC_RAMP, 0, 1) * clamp((s + d + MUSIC_RAMP - T) / MUSIC_RAMP, 0, 1));
  });
  return (MUSIC_GAP - (MUSIC_GAP - MUSIC_DUCK) * duck) * fadeIn * fadeOut;
}
function useMusic(T, CUES, total, playing, voice, volume, voRef) {
  const ref = React.useRef(null);
  if (!ref.current && typeof Audio !== 'undefined') { ref.current = new Audio(MUSIC); ref.current.preload = 'auto'; }
  React.useEffect(() => () => ref.current && ref.current.pause(), []);
  React.useEffect(() => {
    const a = ref.current; if (!a) return;
    a.volume = clamp(musicGain(T, CUES, total, voice, voRef.current) * volume, 0, 1);
    if (playing && T < total) {
      if (Math.abs(a.currentTime - T) > 0.3) a.currentTime = T;
      if (a.paused) a.play().catch(() => {});
    } else if (!a.paused) a.pause();
  });
}

function Piece({ zoom = 1, voice = true, volume = 1, music = true }) {
  const { T, CUES, authoredTotal, playing } = useComposition();
  const voRef = useVoiceover(T, CUES, playing, voice, volume);
  useMusic(T, CUES, authoredTotal, playing && music, voice, volume, voRef);
  const cam = camera(T, CUES, zoom);
  const fadeOut = MOTION.draw(T, authoredTotal - 0.7, 0.7);
  const props = { T, CUES };
  return (
    <div data-screen-label={`t=${Math.floor(T)}s`} style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: C.bg, fontFamily: SANS, color: C.ink, WebkitFontSmoothing: 'antialiased' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: PW, height: TOP.Close + 900, transformOrigin: '0 0', transform: `translate(960px,540px) scale(${BASE * cam.s}) translate(${-cam.x}px,${-cam.y}px)` }}>
        <CamCtx.Provider value={cam.y}>
        <Hero T={T} />
        <Roles {...props} />
        <Games {...props} />
        <Tools {...props} />
        <Trailers {...props} />
        <Evidence {...props} />
        <Flow {...props} />
        <Close {...props} />
        </CamCtx.Provider>
      </div>
      <div style={{ position: 'absolute', inset: 0, background: C.bg, opacity: fadeOut, pointerEvents: 'none' }}></div>
    </div>
  );
}

function BizonIntro() {
  const [t, setTweak] = useTweaks(window.TWEAK_DEFAULTS);
  return (
    <>
      <CompositionStage width={1920} height={1080} scenes={window.OM_SCENES} playback={window.OM_PLAYBACK} bg={C.bg}>
        <Piece zoom={t.zoomIntensity} voice={t.voiceover} volume={t.voiceVolume} music={t.music} />
      </CompositionStage>
      <TweaksPanel>
        <TweakSection label="Playback" />
        <TweakToggle label="Motion editor" value={t.motionEditor} onChange={v => setTweak('motionEditor', v)} />
        <TweakSection label="Voiceover" />
        <TweakToggle label="Voiceover" value={t.voiceover} onChange={v => setTweak('voiceover', v)} />
        <TweakToggle label="Music" value={t.music} onChange={v => setTweak('music', v)} />
        <TweakSlider label="Volume" value={t.voiceVolume} min={0} max={1} step={0.05} onChange={v => setTweak('voiceVolume', v)} />
        <TweakSection label="Camera" />
        <TweakSlider label="Zoom intensity" value={t.zoomIntensity} min={0} max={1.5} step={0.05} onChange={v => setTweak('zoomIntensity', v)} />
      </TweaksPanel>
    </>
  );
}
window.BizonIntro = BizonIntro;
