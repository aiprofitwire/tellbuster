// Tellbuster: watches the text box you are typing in and shows a small badge with the
// number of phrases that might read as AI. Click the badge (or press Alt+Shift+T) for details.
// It only reads your text and never changes it. The text is checked by this extension's own
// background script (background.js), on your device. Nothing is sent anywhere else.
(() => {
  if (globalThis.tellbusterWatching) return;
  globalThis.tellbusterWatching = true;

  const PAUSE_MS = 500; // check after you stop typing for this long
  const MAX_CHARS = 100000; // very long documents are cut here to keep things fast
  const SEVERITY_ORDER = ['high', 'medium', 'low'];

  const CSS = `
:host { all: initial; }
.ui {
  --bg: #faf9f7; --surface: #ffffff; --text: #1f2328; --muted: #595f69; --border: #e2dfda;
  --accent: #2c6b5a; --accent-soft: rgba(44, 107, 90, 0.14);
  --high: #d0473b; --medium: #b7790a; --low: #7d838c;
  font: 15px/1.5 system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  color: var(--text);
  color-scheme: light dark;
}
@media (prefers-color-scheme: dark) {
  .ui {
    --bg: #15171a; --surface: #1d2024; --text: #e9e7e3; --muted: #a7acb4; --border: #353a41;
    --accent: #72c2a8; --accent-soft: rgba(114, 194, 168, 0.18);
    --high: #f28b80; --medium: #e3b04b; --low: #969ca5;
  }
}
* { box-sizing: border-box; }
[hidden] { display: none !important; }
button { font: inherit; color: inherit; cursor: pointer; }
:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.badge {
  position: fixed; z-index: 2147483647;
  display: inline-flex; align-items: center; gap: 6px;
  min-height: 36px; padding: 0 12px 0 10px;
  background: var(--surface); color: var(--text);
  border: 1px solid var(--border); border-radius: 999px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.12);
  font-size: 14px; font-weight: 600; white-space: nowrap;
}
.badge:hover { border-color: var(--muted); }
.badge.offscreen { visibility: hidden; }
.mark { color: var(--accent); flex: none; }
.count { text-decoration-line: underline; text-underline-offset: 4px; text-decoration-thickness: 2px; }
.sev-high { text-decoration-style: solid; text-decoration-color: var(--high); }
.sev-medium { text-decoration-style: wavy; text-decoration-color: var(--medium); text-decoration-thickness: 1.5px; }
.sev-low { text-decoration-style: dotted; text-decoration-color: var(--low); }
.panel {
  position: fixed; z-index: 2147483647;
  overflow-y: auto; overscroll-behavior: contain;
  padding: 12px 16px 8px;
  background: var(--bg); color: var(--text);
  border: 1px solid var(--border); border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);
}
.panel:focus { outline: none; }
.head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.summary { margin: 8px 0 0; font-size: 16px; font-weight: 600; }
.close {
  flex: none; min-height: 36px; padding: 0 12px;
  background: var(--surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px;
}
.close:hover { border-color: var(--muted); }
.note, .turned-off, .foot { margin: 4px 0 10px; color: var(--muted); font-size: 13px; }
.legend { display: flex; flex-wrap: wrap; gap: 4px 14px; margin: 0 0 10px; padding: 0; list-style: none; color: var(--muted); font-size: 13px; }
.sample { color: var(--text); font-weight: 600; text-decoration-line: underline; text-underline-offset: 4px; text-decoration-thickness: 2px; }
.sample.sev-medium { text-decoration-thickness: 1.5px; }
.list { margin: 0; padding: 0; list-style: none; }
.card { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 10px 14px 0; margin-bottom: 10px; }
.card p { margin: 0 0 6px; }
.card-name { display: flex; align-items: baseline; gap: 8px; font-weight: 600; }
.card-match, .card-why { color: var(--muted); font-size: 14px; }
.card-fix { font-size: 14px; }
.sev { flex: none; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; text-decoration-line: underline; text-underline-offset: 4px; text-decoration-thickness: 2px; }
.link { min-height: 44px; padding: 0; border: 0; background: none; color: var(--accent); font-size: 13px; text-decoration: underline; }
`;

  const ctrl = new AbortController();
  const on = (target, type, fn, opts = {}) => target.addEventListener(type, fn, { ...opts, signal: ctrl.signal });
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

  let field = null; // the text box being watched
  let findings = [];
  const off = new Set(); // rules turned off on this page, until it reloads
  let timer = 0;
  let watchTimer = 0;
  let frame = 0;
  let seq = 0;
  let host = null;
  let ui = null;
  let layer = null; // the open modal or popover that holds the text box, if any
  let htmlUnsafe = false; // true once the page removed the badge from <html>
  let lastValue = null; // textarea text at the last check
  let why = ''; // what started the next check, for the debug log
  let lastPlaced = '';
  const changes = new MutationObserver(() => schedule('the text changed'));

  // Sites where the badge is turned off in settings. A frame also checks the pages around it.
  const hostOf = (url) => { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; } };
  const hosts = [location.href, ...Array.from(location.ancestorOrigins || [])].map(hostOf).filter(Boolean);
  const topHost = hosts[hosts.length - 1] || '';
  let siteOff = false;

  // Debug log, off by default. Turn it on for a site by running this in its console, then reload:
  //   localStorage.setItem('tellbusterDebug', '1')
  // It writes to this browser's console only. It logs lengths and rule ids, never your words.
  let debug = false;
  function readDebug() {
    try { debug = localStorage.getItem('tellbusterDebug') === '1'; } catch { debug = false; }
  }
  const where = window === window.top ? 'page' : `frame ${location.host}`;
  const log = (...args) => { if (debug) console.log('TB-DEBUG', `[${where}]`, ...args); };

  // A short label for an element, like div#main[role=textbox][data-testid=tweetTextarea_0].
  function describe(el) {
    if (!el || el.nodeType !== 1) return String(el);
    if (el === host) return 'the Tellbuster badge';
    let label = el.tagName.toLowerCase();
    if (el.id) label += `#${el.id}`;
    for (const a of ['role', 'data-testid', 'aria-label']) {
      const v = el.getAttribute(a);
      if (v) label += `[${a}=${v.slice(0, 40)}]`;
    }
    if (el.isContentEditable) label += '[editable]';
    return label;
  }

  // ---- Finding the text box ----

  // Returns the text box that holds this node: a textarea or the outer edge of an editable area.
  function editableOf(node) {
    let el = node && node.nodeType === 1 ? node : node?.parentElement;
    if (!el || el === host) return null;
    if (el.tagName === 'TEXTAREA') return el.readOnly || el.disabled ? null : el;
    if (!el.isContentEditable) return null;
    while (el.parentElement?.isContentEditable) el = el.parentElement;
    return el;
  }

  // The focused element, looking inside open shadow roots (some sites build editors that way).
  function focused() {
    let el = document.activeElement;
    while (el && el !== host && el.shadowRoot?.activeElement) el = el.shadowRoot.activeElement;
    return el;
  }

  function matches(el, selector) {
    try { return el.matches(selector); } catch { return false; } // older Chrome lacks some selectors
  }

  // Modal dialogs, popovers and full screen elements sit in the browser's "top layer",
  // above everything else on the page. A badge outside them is hidden behind them, so find
  // the one holding the text box (walking out of shadow roots too) and put the badge inside it.
  function topLayerOf(el) {
    for (let node = el; node; node = node.parentElement || node.getRootNode().host) {
      if (node.isContentEditable) continue; // never put the badge inside the writing itself
      if (node === document.fullscreenElement || matches(node, ':modal') || matches(node, ':popover-open')) return node;
    }
    return null;
  }

  function mount() {
    if (!host) return;
    const parent = (layer?.isConnected && topLayerOf(field) === layer && layer) || (htmlUnsafe ? document.body : document.documentElement);
    if (host.parentNode === parent) return;
    if (host.parentNode === null && parent === document.documentElement && host.dataset.mounted) {
      // We put it on <html> and the page took it off, so use <body> from now on.
      htmlUnsafe = true;
      log('the page removed the badge from <html>, moving it to <body>');
      return mount();
    }
    parent.append(host);
    host.dataset.mounted = '1';
    log(`badge moved into ${describe(parent)}`);
    // Some pages remove nodes they did not add. Look again on the next frame.
    requestAnimationFrame(() => { if (field && !host.isConnected) place(); });
  }

  function readText(el) {
    const text = el.tagName === 'TEXTAREA' ? el.value : el.innerText;
    return text.length > MAX_CHARS ? text.slice(0, MAX_CHARS) : text;
  }

  // ---- Building the badge and panel (plain DOM, no HTML strings, so strict sites allow it) ----

  function make(tag, props = {}, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
      if (k === 'class') el.className = v;
      else if (k.startsWith('aria-') || k === 'role') el.setAttribute(k, v);
      else el[k] = v;
    }
    el.append(...kids.filter((k) => k !== null && k !== undefined && k !== false));
    return el;
  }

  function logo() {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    for (const [k, v] of Object.entries({ viewBox: '0 0 32 32', width: '18', height: '18', 'aria-hidden': 'true', class: 'mark' })) svg.setAttribute(k, v);
    const shapes = [
      ['rect', { x: '2', y: '4', width: '28', height: '20', rx: '6', fill: 'none', stroke: 'currentColor', 'stroke-width': '2.5' }],
      ['path', { d: 'M10 24l-2 5 7-5', fill: 'none', stroke: 'currentColor', 'stroke-width': '2.5', 'stroke-linejoin': 'round' }],
      ['path', { d: 'M8 14.5h16', stroke: 'currentColor', 'stroke-width': '2.5', 'stroke-linecap': 'round', 'stroke-dasharray': '3 3' }],
    ];
    for (const [tag, attrs] of shapes) {
      const shape = document.createElementNS(ns, tag);
      for (const [k, v] of Object.entries(attrs)) shape.setAttribute(k, v);
      svg.append(shape);
    }
    return svg;
  }

  function build() {
    host = document.createElement('tellbuster-badge');
    const root = host.attachShadow({ mode: 'closed' });
    try {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(CSS);
      root.adoptedStyleSheets = [sheet];
    } catch {
      root.append(make('style', { textContent: CSS }));
    }
    const count = make('span', { class: 'count' });
    const badge = make('button', { type: 'button', class: 'badge', hidden: true, title: 'Tellbuster (Alt+Shift+T)', 'aria-expanded': 'false', 'aria-haspopup': 'dialog' }, logo(), count);
    const panel = make('div', { class: 'panel', role: 'dialog', 'aria-label': 'Tellbuster', tabIndex: -1, hidden: true });
    const wrap = make('div', { class: 'ui' }, badge, panel);
    root.append(wrap);
    ui = { root, badge, count, panel };

    // Keep the cursor in the text box when the badge or panel is clicked.
    on(wrap, 'mousedown', (e) => e.preventDefault());
    on(badge, 'click', () => (panel.hidden ? openPanel(false) : closePanel()));
    on(wrap, 'click', (e) => {
      const btn = e.target.closest('[data-off], [data-on], [data-site-off], .close');
      if (!btn) return;
      if (btn.classList.contains('close')) { closePanel(); field?.focus(); return; }
      if (btn.dataset.siteOff) { turnOffSite(); return; }
      if (btn.dataset.off) off.add(btn.dataset.off); else off.clear();
      runNow();
    });
    on(wrap, 'keydown', (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); closePanel(); field?.focus(); }
    });
  }

  function summaryText() {
    if (!findings.length) return 'No tells found. Nice work.';
    const counts = SEVERITY_ORDER
      .map((s) => [s, findings.filter((f) => f.severity === s).length])
      .filter(([, n]) => n)
      .map(([s, n]) => `${n} ${s}`);
    return `${plural(findings.length, 'phrase might', 'phrases might')} read as AI (${counts.join(', ')})`;
  }

  function card(f) {
    const sevLabel = f.severity[0].toUpperCase() + f.severity.slice(1);
    const norm = (t) => t.toLowerCase().replace(/[^a-z0-9À-ſ]+/g, ' ').trim();
    const match = f.match.trim() || f.match;
    const showMatch = !norm(f.name).includes(norm(match));
    const fix = make('p', { class: 'card-fix' }, make('strong', { textContent: 'Try this:' }), ` ${f.fix}`);
    const offBtn = make('button', { type: 'button', class: 'link', textContent: 'Turn off this rule on this page' });
    offBtn.dataset.off = f.ruleId;
    return make('li', { class: 'card' },
      make('p', { class: 'card-name' }, make('span', { textContent: f.name }), make('span', { class: `sev sev-${f.severity}`, textContent: sevLabel })),
      showMatch && make('p', { class: 'card-match', textContent: `“${match}”` }),
      make('p', { textContent: f.message }),
      make('p', { class: 'card-why', textContent: f.why }),
      fix,
      offBtn);
  }

  function siteButton() {
    const btn = make('button', { type: 'button', class: 'link', textContent: `Turn off the badge on ${topHost}` });
    btn.dataset.siteOff = '1';
    return btn;
  }

  function fillPanel() {
    const { panel, root } = ui;
    const hadFocus = panel.contains(root.activeElement); // keyboard users keep their place
    let turnedOff = null;
    if (off.size) {
      const onBtn = make('button', { type: 'button', class: 'link', textContent: `Turn ${off.size === 1 ? 'it' : 'them'} back on` });
      onBtn.dataset.on = '1';
      turnedOff = make('p', { class: 'turned-off' }, `${plural(off.size, 'rule is', 'rules are')} turned off on this page. `, onBtn);
    }
    const legend = make('ul', { class: 'legend', 'aria-label': 'Legend' },
      ...[['high', 'strong tell'], ['medium', 'common tell'], ['low', 'style note']].map(([s, label]) =>
        make('li', {}, make('span', { class: `sample sev-${s}`, textContent: s[0].toUpperCase() + s.slice(1) }), ` ${label}`)));
    const parts = [
      make('div', { class: 'head' },
        make('p', { class: 'summary', textContent: summaryText(), 'aria-live': 'polite' }),
        make('button', { type: 'button', class: 'close', textContent: 'Close' })),
      make('p', { class: 'note', textContent: 'These are style notes, not proof of anything. People use these phrases too.' }),
      findings.length ? legend : null,
      turnedOff,
      make('ol', { class: 'list' }, ...findings.map(card)),
      make('p', { class: 'foot', textContent: 'Checked on your device. Nothing is sent anywhere.' }),
      topHost && siteButton(),
    ];
    panel.replaceChildren(...parts.filter(Boolean));
    if (hadFocus) panel.focus();
  }

  // ---- Showing results ----

  function render() {
    if (!field || (!findings.length && ui?.panel.hidden !== false)) { hideAll(); return; }
    if (!ui) build();
    const top = SEVERITY_ORDER.find((s) => findings.some((f) => f.severity === s));
    ui.count.className = `count${top ? ` sev-${top}` : ''}`;
    ui.count.textContent = findings.length ? plural(findings.length, 'tell', 'tells') : 'No tells';
    ui.badge.setAttribute('aria-label', `${findings.length ? summaryText() : 'No tells found'}. Show details.`);
    ui.badge.hidden = false;
    if (!ui.panel.hidden) fillPanel();
    place();
  }

  function hideAll() {
    if (!ui) return;
    ui.badge.hidden = true;
    closePanel();
  }

  function openPanel(focusIt) {
    if (!ui || ui.badge.hidden) return;
    fillPanel();
    ui.panel.hidden = false;
    ui.badge.setAttribute('aria-expanded', 'true');
    place();
    if (focusIt) ui.panel.focus();
  }

  function closePanel() {
    if (!ui || ui.panel.hidden) return;
    ui.panel.hidden = true;
    ui.badge.setAttribute('aria-expanded', 'false');
    if (!findings.length) ui.badge.hidden = true;
  }

  // Sets a fixed position in screen pixels. If an ancestor has a transform (common on modals),
  // "fixed" is measured from that ancestor instead of the screen, so measure and correct.
  function setPos(el, left, top) {
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
    const r = el.getBoundingClientRect();
    const dx = r.left - left;
    const dy = r.top - top;
    if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
      el.style.left = `${left - dx}px`;
      el.style.top = `${top - dy}px`;
    }
    return [Math.round(dx), Math.round(dy)];
  }

  // Puts the badge in the bottom right corner of the text box, and the panel next to it.
  function place() {
    if (!ui || ui.badge.hidden || !field) return;
    if (!field.isConnected) { stop('the text box was removed from the page'); return; }
    mount();
    const { badge, panel } = ui;
    const r = field.getBoundingClientRect();
    // Stay on screen, and inside the modal if there is one (it may cut off anything outside it).
    let b = { left: 0, top: 0, right: document.documentElement.clientWidth || innerWidth, bottom: document.documentElement.clientHeight || innerHeight };
    if (host.parentNode === layer && layer) {
      const d = layer.getBoundingClientRect();
      b = { left: Math.max(b.left, d.left), top: Math.max(b.top, d.top), right: Math.min(b.right, d.right), bottom: Math.min(b.bottom, d.bottom) };
    }
    const gone = r.width === 0 || r.bottom < b.top || r.top > b.bottom || r.right < b.left || r.left > b.right;
    badge.classList.toggle('offscreen', gone);
    if (gone) {
      closePanel();
      if (lastPlaced !== 'off') log('text box is off screen, badge hidden');
      lastPlaced = 'off';
      return;
    }
    const bw = badge.offsetWidth;
    const bh = badge.offsetHeight;
    const left = Math.max(b.left + 4, Math.min(r.right, b.right) - bw - 8);
    const top = Math.max(b.top + 4, Math.min(r.bottom, b.bottom) - bh - 8);
    const shift = setPos(badge, left, top);
    const spot = `badge at ${Math.round(left)},${Math.round(top)} in ${describe(host.parentNode)}${shift[0] || shift[1] ? `, corrected by ${shift.join(',')} for a transform` : ''}`;
    if (spot !== lastPlaced) log(spot);
    lastPlaced = spot;
    if (panel.hidden) return;
    const width = Math.min(380, b.right - b.left - 16);
    panel.style.width = `${width}px`;
    const above = top - b.top - 14;
    const below = b.bottom - (top + bh) - 14;
    const down = below >= 320 || below >= above;
    panel.style.maxHeight = `${Math.max(120, down ? below : above)}px`;
    const panelLeft = Math.max(b.left + 8, Math.min(left + bw - width, b.right - width - 8));
    setPos(panel, panelLeft, down ? top + bh + 6 : top - 6 - panel.offsetHeight);
  }

  function placeSoon() {
    if (frame || !ui || ui.badge.hidden) return;
    frame = requestAnimationFrame(() => { frame = 0; place(); });
  }

  // ---- Checking ----

  async function run() {
    if (!field) return;
    const el = field;
    const id = ++seq;
    const text = readText(el);
    if (el.tagName === 'TEXTAREA') lastValue = el.value;
    log(`checking ${text.length} characters (${why || 'no reason noted'})`);
    why = '';
    let next = [];
    if (text.trim()) {
      let res;
      try {
        res = await chrome.runtime.sendMessage({ type: 'tellbuster-check', text, disabled: [...off] });
      } catch (err) {
        log('could not reach the checker:', err?.message);
        if (!chrome.runtime?.id) shutdown(); // the extension was reloaded or removed
        return;
      }
      if (!res || res.error) { log('the checker returned an error'); return; }
      next = res.findings;
    }
    if (id !== seq || el !== field) { log('result skipped, a newer check started'); return; }
    findings = next;
    log(`${plural(findings.length, 'finding', 'findings')}${findings.length ? `: ${findings.map((f) => f.ruleId).join(', ')}` : ''}`);
    render();
  }

  function schedule(reason) {
    if (!field) return;
    if (!why) why = reason;
    clearTimeout(timer);
    timer = setTimeout(run, PAUSE_MS);
  }

  function runNow() {
    clearTimeout(timer);
    why = 'a rule was turned off or on';
    run();
  }

  function watch(el, reason) {
    field = el;
    findings = [];
    lastValue = null;
    lastPlaced = '';
    seq++;
    readDebug();
    hideAll();
    layer = topLayerOf(el);
    log(`watching ${describe(el)} (${reason})${layer ? `, inside top layer ${describe(layer)}` : ''}`);
    changes.disconnect();
    // Some editors (and some sites) change the text without an "input" event, so also watch the text itself.
    if (el.tagName !== 'TEXTAREA') changes.observe(el, { childList: true, subtree: true, characterData: true });
    why = '';
    schedule('started watching');
    clearInterval(watchTimer);
    // Text boxes grow, move and disappear without telling anyone, so check now and then.
    watchTimer = setInterval(() => {
      syncFocus('regular check');
      if (field?.tagName === 'TEXTAREA' && field.value !== lastValue && lastValue !== null) schedule('the text changed');
      place();
    }, 1000);
  }

  function stop(reason) {
    if (field) log(`stopped watching (${reason})`);
    field = null;
    layer = null;
    findings = [];
    seq++;
    changes.disconnect();
    clearTimeout(timer);
    clearInterval(watchTimer);
    hideAll();
    mount(); // back out of any modal
  }

  function shutdown() {
    stop('the extension was reloaded or removed');
    ctrl.abort();
    try { chrome.storage.onChanged.removeListener(settingsChanged); } catch { /* already gone */ }
    host?.remove();
    globalThis.tellbusterWatching = false;
  }

  // Starts or stops watching based on what has focus now. Safe to call often.
  function syncFocus(reason) {
    const now = focused();
    if (host && now === host) return; // focus is in the panel
    const el = siteOff ? null : editableOf(now);
    if (el === field) return;
    if (el) watch(el, reason);
    else if (field) stop(`focus moved to ${describe(now)}`);
    else if (reason === 'focusin') log(`focus on ${describe(now)}: not a text box, ignored`);
  }

  // ---- Listening (all passive: nothing here blocks or changes your typing) ----
  // Listeners sit on window so they run before most of the page's own. Sites can still swallow
  // events, so selectionchange, the text watcher and the regular check back them up.

  on(window, 'focusin', (e) => {
    if (host && e.composedPath().includes(host)) return; // focus moved into the panel
    syncFocus('focusin');
  }, { capture: true });

  on(window, 'focusout', () => setTimeout(() => syncFocus('focusout'), 150), { capture: true });

  on(document, 'selectionchange', () => syncFocus('selectionchange'));

  on(window, 'input', (e) => {
    if (field && editableOf(e.composedPath()[0]) === field) schedule('input');
  }, { capture: true });

  on(window, 'pointerdown', (e) => {
    if (ui && !ui.panel.hidden && !e.composedPath().includes(host)) closePanel();
  }, { capture: true });

  on(window, 'keydown', (e) => {
    if (!field || !e.altKey || !e.shiftKey || e.code !== 'KeyT') return;
    if (!ui || ui.badge.hidden) return;
    e.preventDefault();
    if (ui.panel.hidden) openPanel(true); else { closePanel(); field.focus(); }
  }, { capture: true });

  on(window, 'keyup', () => {
    if (field?.tagName === 'TEXTAREA' && field.value !== lastValue && lastValue !== null) schedule('keyup');
  }, { capture: true });

  on(window, 'scroll', placeSoon, { capture: true, passive: true });
  on(window, 'resize', placeSoon, { passive: true });

  // ---- Settings ----

  function readSites(sites) {
    const list = Array.isArray(sites) ? sites : [];
    siteOff = list.some((site) => hosts.some((h) => h === site || h.endsWith(`.${site}`)));
    log(siteOff ? 'the badge is turned off on this site in settings' : 'the badge is on for this site');
    if (siteOff) stop('the badge is turned off on this site'); else syncFocus('settings read');
  }

  // Any other change (a rule or strict mode) checks the text again with the new settings.
  function settingsChanged(changed, area) {
    if (area !== 'sync') return;
    if (changed.offSites) readSites(changed.offSites.newValue);
    else if (field) runNow();
  }

  async function turnOffSite() {
    try {
      const { offSites } = await chrome.storage.sync.get({ offSites: [] });
      const list = Array.isArray(offSites) ? offSites : [];
      if (!list.includes(topHost)) await chrome.storage.sync.set({ offSites: [...list, topHost] });
      // The change above reaches readSites through settingsChanged, which hides the badge.
    } catch {
      shutdown(); // the extension was reloaded or removed
    }
  }

  // The page may have opened with the cursor already in a text box.
  readDebug();
  log(`ready on ${location.host}`);
  try {
    chrome.storage.onChanged.addListener(settingsChanged);
    chrome.storage.sync.get({ offSites: [] }).then(({ offSites }) => readSites(offSites), () => readSites([]));
  } catch {
    readSites([]);
  }
})();
