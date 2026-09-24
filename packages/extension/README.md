# Tellbuster for Chrome

Click the Tellbuster icon, paste your writing, and see which phrases might read as AI. You can also select text on any page, right-click, and pick **Check with Tellbuster**.

## Check as you type

When you write in a text box on any site (LinkedIn, X, Gmail and most others), a small badge appears in its bottom right corner once you pause typing, for example **3 tells**. Click it, or press **Alt+Shift+T**, to see each phrase with why it stands out and a plainer way to say it. Press **Esc** to close the panel.

- The badge only shows up when something is found. Its underline matches the strongest finding: solid for high, wavy for medium, dotted for low.
- It only reads your text. It never changes what you type.
- **Turn off this rule on this page** hides a rule until you reload the page. Lasting settings come in a later version.
- The badge does not underline words inside other sites' editors. That is fragile, so it is left out on purpose.

Everything runs on your device. The extension makes no network calls and keeps no history.

## Permissions

- `storage`: holds the text you picked with the right-click menu for a moment, in memory only, until the popup opens.
- `activeTab`: reserved for checking the page you are on, only when you click the icon.
- `contextMenus`: adds **Check with Tellbuster** to the right-click menu.
- **Read and change all your data on all websites** (Chrome shows this warning when you install): this is needed to read what you type in text boxes on any site so the badge can count the tells. Your text is checked inside the extension, on your device, and is never sent anywhere or saved. Tellbuster never changes your text. The only thing it adds to a page is its own badge. You can check this in `content.js`, and the tests fail if that file ever gains a network call.

## If the badge does not show up on a site

Turn on the debug log for that site. It writes what the badge is doing to that tab's console: which text box it found, how long the text is, how many tells, and where it put the badge. It never logs your words, and nothing leaves your device.

1. On the site, open the console: **View > Developer > JavaScript Console** on a Mac, or press **Ctrl+Shift+J** on Windows.
2. Paste this line and press Enter: `localStorage.setItem('tellbusterDebug', '1')`
3. Reload the page and try again. Lines starting with `TB-DEBUG` show up in the console.
4. To turn it off: `localStorage.removeItem('tellbusterDebug')`

To try the badge without logging in anywhere, see [test/pages](../../test/pages/README.md).

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
