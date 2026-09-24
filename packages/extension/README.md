# Tellbuster for Chrome

Click the Tellbuster icon, paste your writing, and see which phrases might read as AI. You can also select text on any page, right-click, and pick **Check with Tellbuster**. Both work right after you install, with no access to any website.

## Check as you type (off until you turn it on)

To turn it on, open the settings (right-click the Tellbuster icon and pick **Options**) and tick **Check as I type**. Chrome then asks to let Tellbuster read the sites you visit. Say yes and it starts on every site, including tabs that are already open. Untick it to turn it off, and Chrome takes the access back.

When you write in a text box on any site (LinkedIn, X, Gmail and most others), a small badge appears in its bottom right corner once you pause typing, for example **3 tells**. Click it, or press **Alt+Shift+T**, to see each phrase with why it stands out and a plainer way to say it. Press **Esc** to close the panel.

- The badge only shows up when something is found. Its underline matches the strongest finding: solid for high, wavy for medium, dotted for low.
- It only reads your text. It never changes what you type.
- **Turn off this rule on this page** hides a rule until you reload the page. To turn a rule off for good, use the settings page.
- **Turn off the badge on this site** hides the badge on that site from now on. You can turn it back on in the settings.
- The badge does not underline words inside other sites' editors. That is fragile, so it is left out on purpose.

Everything runs on your device. The extension makes no network calls and keeps no history.

## Settings

Right-click the Tellbuster icon and pick **Options**, or click **Settings** at the bottom of the popup. Changes save on their own.

- **Languages:** which languages to check: English and French. Tellbuster guesses the language of each text from its common words. If it guesses wrong, pick **Always English** or **Always French**.
- **Strict mode: also flag common filler words:** off by default. Adds everyday words like "crucial" that show up a lot in AI writing.
- **Rules:** turn off a whole group (like Punctuation), or open a group and turn off single rules (like Em dash).
- **Check as I type:** off at install. Turning it on asks Chrome for site access (see Permissions).
- **Sites where the badge is off:** shows once check as you type is on. Type a site, like linkedin.com, to turn the badge off there. Its subdomains are covered too.

Settings apply to the popup and to the badge. They are saved with `chrome.storage.sync`, so Chrome can carry them to your other computers if you use Chrome sync. Only these choices are stored, never your text.

## Permissions

- `storage`: holds the text you picked with the right-click menu for a moment, in memory only, until the popup opens. It also keeps your settings: languages, strict mode, the rules you turned off, and the sites where the badge is off.
- `contextMenus`: adds **Check with Tellbuster** to the right-click menu.
- `scripting`: lets Tellbuster add its badge script to pages, but only after you allow site access below. Chrome shows no warning for it.

Installing asks for nothing more. Your text never leaves your device either way.

### Only if you turn on check as you type

- **Read and change all your data on all websites** (Chrome asks when you tick **Check as I type**, not when you install): this is needed to read what you type in text boxes on any site so the badge can count the tells. Your text is checked inside the extension, on your device, and is never sent anywhere or saved. Tellbuster never changes your text. The only thing it adds to a page is its own badge. You can check this in `content.js`, and the tests fail if that file ever gains a network call. If you say no, or take the access back later in Chrome's extension menu, the badge stops and the popup and right-click menu keep working.

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
4. To try the badge, open the settings and tick **Check as I type**.

## Other browsers

- **Edge:** works as it is. Open `edge://extensions`, turn on **Developer mode**, click **Load unpacked** and pick this folder.
- **Brave, Opera, Vivaldi and Arc:** they run Chrome extensions. Install from the Chrome Web Store, or load this folder the same way as in Chrome.
- **Firefox (140 or newer):** Firefox needs a slightly different manifest, so load the Firefox zip instead of this folder. In the repo folder, run `node scripts/zip-firefox.js`. In Firefox, open `about:debugging#/runtime/this-firefox`, click **Load Temporary Add-on...** and pick `tellbuster-firefox.zip`. Firefox forgets it when you close the browser. In Firefox, settings are saved with Firefox Sync instead of Chrome sync.
- **Safari:** not supported yet. See [PUBLISHING.md](../../docs/PUBLISHING.md) (Part 6).

## Copied files

These files are copies. Do not edit them here. Edit the original, then run `node scripts/sync-extension.js` from the repo root.

| File here | Original |
|---|---|
| `app.js` | `docs/app.js` |
| `style.css` | `docs/style.css` |
| `vendor/tellbuster.js` | `packages/core/src/index.js` |
| `vendor/en.json` | `rules/en.json` |
| `vendor/en-strict.json` | `rules/en-strict.json` |
