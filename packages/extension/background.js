// Runs in the background of the extension. Two jobs:
// 1. Adds "Check with Tellbuster" to the right-click menu for selected text.
//    The selection is kept in session storage (memory only, never synced) until the popup reads it.
// 2. Checks text for the badge that follows you as you type (content.js).
//    The text arrives here from the page, is checked on your device, and is not kept.
import { check, loadRules } from './vendor/tellbuster.js';

const MENU_ID = 'tellbuster-check';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({ id: MENU_ID, title: 'Check with Tellbuster', contexts: ['selection'] });
});

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId !== MENU_ID) return;
  await chrome.storage.session.set({ startText: info.selectionText || '' });
  try {
    await chrome.action.openPopup();
  } catch {
    // Older Chrome versions cannot open the popup from here, so open it in a small window.
    await chrome.windows.create({ url: 'popup.html', type: 'popup', width: 460, height: 640 });
  }
});

// The rules ship inside the extension, so this reads local files, not the internet.
// The strict pack (common filler words) loads only when the strictStyle setting is on.
const cache = {};
function loadFile(name) {
  cache[name] ??= fetch(chrome.runtime.getURL(`vendor/${name}`))
    .then((res) => res.json())
    .then(loadRules)
    .catch((err) => { delete cache[name]; throw err; });
  return cache[name];
}

async function getRules(strictStyle) {
  const base = await loadFile('en.json');
  return strictStyle ? base.concat(await loadFile('en-strict.json')) : base;
}

// Off unless the user turns it on. The settings page (Step 6) will add the switch.
async function strictStyleOn() {
  const { strictStyle } = await chrome.storage.sync.get({ strictStyle: false });
  return strictStyle === true;
}

chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  if (msg?.type !== 'tellbuster-check' || typeof msg.text !== 'string') return false;
  strictStyleOn()
    .then(async (strictStyle) => {
      const rules = await getRules(strictStyle);
      reply({ findings: check(msg.text, { rules, disabled: msg.disabled || [], strictStyle }) });
    })
    .catch(() => reply({ error: true }));
  return true; // the reply comes later
});
