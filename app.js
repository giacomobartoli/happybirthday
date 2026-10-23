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
