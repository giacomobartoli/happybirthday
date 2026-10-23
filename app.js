const days = window.AGENDA;
const tabs = document.getElementById('tabs');
const list = document.getElementById('list');
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};
let done = store.get('done', {});
let current = store.get('day', days[0].id);
if (!days.some(d => d.id === current)) current = days[0].id;
const emoji = { food: '🍹', rest: '😴' };

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text) e.textContent = text;
  return e;
}

function render() {
  tabs.replaceChildren(...days.map(d => {
    const b = el('button', '', d.name);
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-selected', d.id === current);
    b.onclick = () => { current = d.id; store.set('day', current); render(); window.scrollTo(0, 0); };
    return b;
  }));
  const day = days.find(d => d.id === current);
  list.replaceChildren(...day.items.map((it, i) => {
    const key = current + i;
    const card = el('article', 'item' + (it.tag ? ' ' + it.tag : '') + (done[key] ? ' done' : ''));
    const chk = el('button', 'check', done[key] ? '✓' : '');
    chk.setAttribute('aria-label', 'Segna come fatto');
    chk.onclick = () => { done[key] = !done[key]; if (!done[key]) delete done[key]; store.set('done', done); render(); };
    const body = el('div', 'body');
    if (it.time) body.append(el('div', 'time', it.time));
    const h = el('h2');
    if (it.tag) h.append(el('span', 'tag', emoji[it.tag]));
    h.append(it.title);
    body.append(h);
    if (it.note) body.append(el('p', 'note', it.note));
    if (it.cost || it.map) {
      const meta = el('div', 'meta');
      if (it.cost) meta.append(el('span', 'cost', it.cost));
      if (it.map) {
        const a = el('a', 'map', '📍 Mappa');
        a.href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(it.map);
        a.target = '_blank'; a.rel = 'noopener';
        meta.append(a);
      }
      body.append(meta);
    }
    card.append(chk, body);
    return card;
  }));
}
render();

document.getElementById('cake').onclick = () => {
  const bits = ['🎉', '🎈', '✨', '🌴', '🍋', '🎊', '☀️'];
  for (let i = 0; i < 40; i++) {
    const c = el('span', 'confetti', bits[i % bits.length]);
    c.style.left = Math.random() * 100 + 'vw';
    c.style.fontSize = 16 + Math.random() * 18 + 'px';
    c.style.animationDuration = 2 + Math.random() * 2.5 + 's';
    c.style.animationDelay = Math.random() * .6 + 's';
    document.body.append(c);
    setTimeout(() => c.remove(), 5500);
  }
};

if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});

(function glitter() {
  const cv = document.getElementById('sparkle');
  const ctx = cv.getContext('2d');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hues = [330, 290, 200, 45, 170];
  let w, h, dpr, orbs, stars;
  const rnd = (a, b) => a + Math.random() * (b - a);
  function setup() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = innerWidth; h = innerHeight;
    cv.width = w * dpr; cv.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    orbs = Array.from({ length: 26 }, () => ({ x: rnd(0, w), y: rnd(0, h), r: rnd(10, 38), hue: hues[(Math.random() * 5) | 0], vy: rnd(-.12, -.03), a: rnd(.3, .55) }));
    stars = Array.from({ length: 90 }, () => ({ x: rnd(0, w), y: rnd(0, h), r: rnd(3, 9), p: rnd(0, 6.28), s: rnd(.01, .035), hue: hues[(Math.random() * 5) | 0] }));
  }
  function star(x, y, r, a, hue) {
    ctx.globalAlpha = a;
    ctx.fillStyle = `hsl(${hue} 100% 97%)`;
    ctx.shadowColor = `hsl(${hue} 100% 65%)`; ctx.shadowBlur = r * 3;
    ctx.beginPath();
    ctx.moveTo(x, y - r * 2); ctx.quadraticCurveTo(x, y, x + r * 2, y);
    ctx.quadraticCurveTo(x, y, x, y + r * 2); ctx.quadraticCurveTo(x, y, x - r * 2, y);
    ctx.quadraticCurveTo(x, y, x, y - r * 2); ctx.fill();
    ctx.shadowBlur = 0;
  }
  function frame() {
    ctx.clearRect(0, 0, w, h);
    for (const o of orbs) {
      if (!still) { o.y += o.vy; if (o.y < -o.r) o.y = h + o.r; }
      const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
      g.addColorStop(0, `hsla(${o.hue},100%,85%,${o.a})`);
      g.addColorStop(.8, `hsla(${o.hue},100%,80%,${o.a * .7})`);
      g.addColorStop(1, `hsla(${o.hue},100%,80%,0)`);
      ctx.globalAlpha = 1; ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, 6.283); ctx.fill();
    }
    for (const s of stars) {
      if (!still) s.p += s.s;
      star(s.x, s.y, s.r, still ? .7 : .25 + .75 * Math.abs(Math.sin(s.p)), s.hue);
    }
    ctx.globalAlpha = 1;
    if (!still) requestAnimationFrame(frame);
  }
  addEventListener('resize', () => { setup(); if (still) frame(); });
  setup(); frame();
})();
