# Tellbuster for Chrome

Paste your writing into the Tellbuster popup to see which phrases might read as AI, why, and a plainer way to say them. Or select text on any page, right-click it and pick **Check with Tellbuster**.

## Install it from this folder

1. Download the repo (**Code > Download ZIP** on GitHub) and unzip it.
2. In Chrome, go to `chrome://extensions`.
3. Turn on **Developer mode** (top right).
4. Click **Load unpacked** and pick the `packages/extension` folder.
5. Click the puzzle piece in the toolbar and pin Tellbuster.

## What it can access

| Permission | Why |
|---|---|
| `storage` | Remembers the rules you turned off, and keeps your draft while the popup is closed. The draft lives in memory only and is wiped when Chrome closes. |
| `activeTab` | Lets the right-click menu read the text you selected, only when you click it. |
| `contextMenus` | Adds **Check with Tellbuster** to the right-click menu. |

Tellbuster makes no network calls. Your text is checked on your device and never sent anywhere.

## For developers

The popup uses copies of the engine, the English rules and the web demo's styles in `vendor/`, so the folder works with no build step. After changing `packages/core`, `rules/` or `docs/style.css`, run this from the repo root:

```
node scripts/sync-extension.js
```

The tests (`node --test`) fail if the copies are out of date.
