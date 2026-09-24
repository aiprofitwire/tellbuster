// Runs before app.js (both are modules, so they run in page order).
import { readSettings, activeRules } from './settings.js';

// Gives app.js the text picked with "Check with Tellbuster", then forgets it.
window.tellbusterStartText = async () => {
  const { startText = '' } = await chrome.storage.session.get('startText');
  if (startText) await chrome.storage.session.remove('startText');
  return startText;
};

// Gives app.js the rules picked on the settings page.
window.tellbusterRules = async () => {
  const settings = await readSettings();
  return {
    rules: await activeRules(settings),
    disabled: settings.disabledRules,
    strictStyle: settings.strictStyle,
    language: settings.language,
  };
};

document.getElementById('settings').addEventListener('click', (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});
