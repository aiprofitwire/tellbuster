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

// The rules ship inside the extension, so this reads a local file, not the internet.
let rulesReady = null;
function getRules() {
  rulesReady ??= fetch(chrome.runtime.getURL('vendor/en.json'))
    .then((res) => res.json())
    .then(loadRules)
    .catch((err) => { rulesReady = null; throw err; });
  return rulesReady;
}

chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  if (msg?.type !== 'tellbuster-check' || typeof msg.text !== 'string') return false;
  getRules()
    .then((rules) => reply({ findings: check(msg.text, { rules, disabled: msg.disabled || [] }) }))
    .catch(() => reply({ error: true }));
  return true; // the reply comes later
});
