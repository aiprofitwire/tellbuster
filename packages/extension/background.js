// Runs in the background of the extension. Three jobs:
// 1. Adds "Check with Tellbuster" to the right-click menu for selected text.
//    The selection is kept in session storage (memory only, never synced) until the popup reads it.
// 2. Turns check-as-you-type (content.js) on only after you allow it in Settings.
// 3. Checks text for the badge that follows you as you type.
//    The text arrives here from the page, is checked on your device, and is not kept.
import { check } from './vendor/tellbuster.js';
import { readSettings, activeRules } from './settings.js';
import './i18n.js'; // the menu's words, in the browser's language

const T = globalThis.tellbusterI18n.strings(globalThis.tellbusterI18n.pick({ followBrowser: true }));

const MENU_ID = 'tellbuster-check';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({ id: MENU_ID, title: T.menuCheck, contexts: ['selection'] });
  syncBadge(false);
});
chrome.runtime.onStartup.addListener(() => syncBadge(false));

// ---- Check as you type: off until you allow site access ----
// Site access is optional (optional_host_permissions in manifest.json), so installing asks for none.
// When you turn on "Check as I type" in Settings, Chrome asks you. Only then is content.js added
// to pages, and only on the sites you allowed. Taking the access back removes it again.
const SCRIPT_ID = 'tellbuster-badge';

// Runs one at a time, so two quick changes cannot register the script twice.
let syncing = Promise.resolve();
function syncBadge(injectOpenTabs) {
  syncing = syncing.then(() => updateBadgeScript(injectOpenTabs)).catch(() => {});
  return syncing;
}

async function updateBadgeScript(injectOpenTabs) {
  const { origins = [] } = await chrome.permissions.getAll();
  const matches = origins.filter((o) => /^https?:\/\//.test(o));
  const [current] = await chrome.scripting.getRegisteredContentScripts({ ids: [SCRIPT_ID] });
  if (current) await chrome.scripting.unregisterContentScripts({ ids: [SCRIPT_ID] });
  if (!matches.length) return;
  await chrome.scripting.registerContentScripts([
    { id: SCRIPT_ID, js: ['i18n.js', 'content.js'], matches, runAt: 'document_idle', allFrames: true },
  ]);
  // Tabs that were already open get the badge too, so there is no need to reload them.
  if (!injectOpenTabs) return;
  const tabs = await chrome.tabs.query({ url: matches });
  for (const tab of tabs) {
    chrome.scripting.executeScript({ target: { tabId: tab.id, allFrames: true }, files: ['i18n.js', 'content.js'] }).catch(() => {});
  }
}

chrome.permissions.onAdded.addListener(() => syncBadge(true));
chrome.permissions.onRemoved.addListener(() => syncBadge(false));

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

// Uses your settings for each check: languages (guessed from the text unless you picked one), strict mode, and rules or categories you turned off.
chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  if (msg?.type !== 'tellbuster-check' || typeof msg.text !== 'string') return false;
  readSettings()
    .then(async (settings) => {
      const rules = await activeRules(settings);
      const disabled = settings.disabledRules.concat(msg.disabled || []);
      reply({ findings: check(msg.text, { rules, disabled, strictStyle: settings.strictStyle, language: settings.language }) });
    })
    .catch(() => reply({ error: true }));
  return true; // the reply comes later
});
