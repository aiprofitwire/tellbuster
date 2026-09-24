# Tellbuster for Chrome

Click the Tellbuster icon, paste your writing, and see which phrases might read as AI. You can also select text on any page, right-click, and pick **Check with Tellbuster**.

Everything runs on your device. The extension makes no network calls and keeps no history.

## Permissions

- `storage`: holds the text you picked with the right-click menu for a moment, in memory only, until the popup opens.
- `activeTab`: reserved for checking the page you are on, only when you click the icon.
- `contextMenus`: adds **Check with Tellbuster** to the right-click menu.

## Try it without the Chrome Web Store

1. Download this repo (**Code > Download ZIP**) and unzip it.
2. In Chrome, open `chrome://extensions` and turn on **Developer mode** (top right).
3. Click **Load unpacked** and pick the `packages/extension` folder.

## Copied files

These files are copies. Do not edit them here. Edit the original, then run `node scripts/sync-extension.js` from the repo root.

| File here | Original |
|---|---|
| `app.js` | `docs/app.js` |
| `style.css` | `docs/style.css` |
| `vendor/tellbuster.js` | `packages/core/src/index.js` |
| `vendor/en.json` | `rules/en.json` |
