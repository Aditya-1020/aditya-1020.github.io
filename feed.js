// ── Config ────────────────────────────────────────────────
const PROXY     = 'https://api.allorigins.win/raw?url=';
const CACHE_KEY = 'arxiv_papers';
const CACHE_AGE = 30 * 60 * 1000; // 30 minutes

// Feed ID → display label
const FEEDS = {
  // Computer Science
  'cs.AR':  'Hardware Architecture',
  'cs.DC':  'Distributed & Parallel Computing',
  'cs.ET':  'Emerging Technologies',
  'cs.PF':  'Performance',
};
/*
'quant-ph':        'Quantum Physics',
'physics.ins-det': 'Instrumentation & Detectors',
'eess.SP': 'Signal Processing',
'cs.GR':  'Graphics',
'cs.NE':  'Neural & Evolutionary Computing',
'eess.SY': 'Systems & Control'
*/

const FEED_IDS = Object.keys(FEEDS);
let papers = [];
let activeFilter = 'all';

function saveCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
  } catch (e) {}
}

function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    data.forEach(p => p.date = new Date(p.date));
    return { stale: Date.now() - ts > CACHE_AGE, data };
  } catch (e) { return null; }
}

// ── Fetch ─────────────────────────────────────────────────
async function fetchFeed(cat) {
  const url = 'https://export.arxiv.org/rss/' + cat;
  const res = await fetch(PROXY + encodeURIComponent(url));
  const xml = await res.text();
  const doc = new DOMParser().parseFromString(xml, 'text/xml');

  return Array.from(doc.querySelectorAll('item')).map(item => {
    const link    = item.querySelector('link')?.textContent?.trim() || '';
    const descRaw = item.querySelector('description')?.textContent?.trim() || '';
    const tmp     = document.createElement('div');
    tmp.innerHTML = descRaw;

    return {
      title:    (item.querySelector('title')?.textContent?.trim() || '').replace(/\[.*?\]\s*/, ''),
      authors:  item.querySelector('creator')?.textContent?.trim()
             || item.querySelector('dc\\:creator')?.textContent?.trim() || '',
      abstract: tmp.textContent.trim(),
      link,
      id:       (link.match(/abs\/([\d.]+)/) || [])[1] || '',
      date:     new Date(item.querySelector('pubDate')?.textContent?.trim() || Date.now()),
      cat,
    };
  });
}

async function fetchAndUpdate() {
  try {
    const results = await Promise.allSettled(FEED_IDS.map(fetchFeed));
    const fresh = [];
    results.forEach(r => { if (r.status === 'fulfilled') fresh.push(...r.value); });
    fresh.sort((a, b) => b.date - a.date);
    saveCache(fresh);
    papers = fresh;
    render();
    setStatus(buildStatus(papers, 'updated just now'));
  } catch (e) {
    setStatus(buildStatus(papers, 'refresh failed'));
  }
}

async function loadAll() {
  const cached = loadCache();

  if (cached) {
    papers = cached.data;
    render();
    const age = cached.stale ? 'stale \u2014 refreshing\u2026' : 'cached';
    setStatus(buildStatus(papers, age));
    if (cached.stale) fetchAndUpdate();
  } else {
    setStatus('Loading\u2026');
    await fetchAndUpdate();
  }
}

// ── Filter ────────────────────────────────────────────────
function filter(cat, el) {
  activeFilter = cat;
  document.querySelectorAll('.feed-controls a').forEach(a => a.classList.remove('active'));
  el.classList.add('active');
  render();
}

// ── Render ────────────────────────────────────────────────
function render() {
  const list = activeFilter === 'all' ? papers : papers.filter(p => p.cat === activeFilter);
  const feed = document.getElementById('feed');

  if (!list.length) {
    feed.innerHTML = '<p style="font-size:85%;color:#555">No papers.</p>';
    return;
  }

  feed.innerHTML = list.map((p, i) => `
    <div class="paper">
      <a class="paper-toggle" href="#" onclick="toggle(${i});return false;">${esc(p.title)}</a>
      <span class="paper-meta">[${FEEDS[p.cat] || p.cat} &bull; ${relDate(p.date)}]</span>
      <div class="abstract" id="abs-${i}">
        <div class="abstract-authors">${esc(p.authors)}</div>
        <div class="abstract-body">${esc(p.abstract)}</div>
        <div class="abstract-links">
          <a href="${esc(p.link)}" target="_blank" rel="noopener">[arXiv]</a>
          ${p.id ? `<a href="https://arxiv.org/pdf/${p.id}" target="_blank" rel="noopener">[PDF]</a>` : ''}
        </div>
      </div>
    </div>
  `).join('');
}

function toggle(i) {
  document.getElementById('abs-' + i)?.classList.toggle('open');
}

// ── Helpers ───────────────────────────────────────────────
function setStatus(msg) {
  document.getElementById('status').textContent = msg;
}

function buildStatus(list, note) {
  const total = list.length;
  return `${total} papers across ${FEED_IDS.length} feeds (${note})`;
}

function relDate(d) {
  const h = Math.floor((Date.now() - d) / 3600000);
  if (h < 1)  return 'just now';
  if (h < 24) return h + 'h ago';
  const days = Math.floor(h / 24);
  return days === 1 ? '1d ago' : days + 'd ago';
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Init ──────────────────────────────────────────────────
buildControls();
loadAll();

// ── Controls ──────────────────────────────────────────────
function buildControls() {
  const el = document.getElementById('feed-controls');

  const all = document.createElement('a');
  all.href = '#';
  all.className = 'active';
  all.textContent = 'All';
  all.onclick = e => { e.preventDefault(); filter('all', all); };
  el.appendChild(all);

  Object.entries(FEEDS).forEach(([id, label]) => {
    const a = document.createElement('a');
    a.href = '#';
    a.textContent = label;
    a.onclick = e => { e.preventDefault(); filter(id, a); };
    el.appendChild(a);
  });
}