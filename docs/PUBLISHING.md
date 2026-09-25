# Publishing Tellbuster

Step by step, in this order: the web demo first (the others link to it), then npm, then the Chrome Web Store, then Edge and Firefox. Each part stands on its own, so you can stop after any of them.

## What you need

- A computer with **Node.js** installed (version 22 or newer). Get the "LTS" version from [nodejs.org](https://nodejs.org). To check, open a terminal (on a Mac: **Terminal**, on Windows: **PowerShell**) and type `node -v`. It should print a number like `v22.x.x`.
- This repo on your computer, up to date with `main`. If you have never done this: click **Code > Download ZIP** on the repo page, unzip it, and open a terminal in that folder. (If you use git: `git pull` on `main`.)
- About two hours in total, plus waiting time for the store reviews.

Before anything else, in a terminal in the repo folder, run:

```
node --test
```

The last lines must say `fail 0`. If not, stop and open an issue.

## Part 1: the web demo and privacy page (GitHub Pages)

The Chrome Web Store needs a privacy policy web address, and this gives you one.

1. On GitHub, open the repo and click **Settings**, then **Pages** (left menu).
2. Under **Source**, pick **Deploy from a branch**. Branch: `main`, folder: `/docs`. Click **Save**.
3. Wait about 2 minutes.
4. Open `https://aiprofitwire.github.io/tellbuster/`. The demo should load. Click **Try an example** to check it works.
5. Open `https://aiprofitwire.github.io/tellbuster/privacy.html`. The privacy policy should show.

If Pages is already on from an earlier step, just do steps 4 and 5.

## Part 2: the engine on npm

This publishes the `tellbuster` package so developers can run `npm install tellbuster`. The name was free on September 24, 2026.

The package includes the engine and all the rule files, so `npm install tellbuster` works on its own. Before publishing, run `node scripts/sync-core-rules.js` so the bundled rules match the `rules/` folder (a test also checks this).

1. Make a free account at [npmjs.com/signup](https://www.npmjs.com/signup). Confirm your email.
2. Turn on two-factor login: click your avatar > **Account** > **Two-Factor Authentication**. npm asks for it when you publish.
3. In a terminal in the repo folder, log in:

   ```
   npm login
   ```

   It opens a browser window. Log in there, then come back to the terminal.
4. Go into the package folder:

   ```
   cd packages/core
   ```

5. See what will be published, without publishing anything:

   ```
   npm pack --dry-run
   ```

   Check the list under **Tarball Contents**. It must show exactly 6 files: `README.md`, `bin/tellbuster.js`, `package.json`, `src/index.js`, `src/main.js` and `src/rules.js`. The name must be `tellbuster` and the version `0.1.0`.
6. Publish:

   ```
   npm publish
   ```

   Type the code from your authenticator app when asked. It ends with a line like `+ tellbuster@0.1.0`.
7. Check it: open [npmjs.com/package/tellbuster](https://www.npmjs.com/package/tellbuster). The page should show the package README.
8. Go back to the repo folder: `cd ../..`

If `npm publish` says the name is taken, someone registered it after September 24. Stop and open an issue: the name in `packages/core/package.json` then needs to change (for example to `@aiprofitwire/tellbuster`).

## Part 3: the extension on the Chrome Web Store

### 3a. Make the zip

In a terminal in the repo folder:

```
node scripts/zip-extension.js
```

It prints `Made tellbuster-extension.zip (version 0.1.0, 19 files).` The zip is in the repo folder. It is not committed to git (the repo ignores zip files).

### 3b. Make a developer account (once)

1. Open the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) and sign in with a Google account.
2. Accept the developer agreement and pay the one-time US$5 fee.
3. Fill in the account page. Tips:
   - The **contact email** is shown on the store listing. Use a project email, not a personal one.
   - The form asks whether you are a **trader** under EU law. Read Google's help text on that page and pick what fits you.
   - Verify the email when Google asks.

### 3c. Upload and fill in the listing

Keep [store-listing.md](store-listing.md) open. It has every piece of text to paste.

1. In the dashboard, click **New item** (or **Add new item**) and upload `tellbuster-extension.zip`.
2. **Store listing** tab: paste the long description, pick the category and language, and upload the screenshots (the list of 5 to take is in store-listing.md). Upload `packages/extension/icons/icon128.png` as the store icon if asked.
3. **Privacy** tab (may be called **Privacy practices**): paste the single purpose, each permission justification, answer **No** to remote code, tick no data types, and tick the three statements. Paste the privacy policy address: `https://aiprofitwire.github.io/tellbuster/privacy.html`
4. **Distribution** tab: **Public**, all regions, free.
5. Click **Submit for review**.

Review usually takes a few days, sometimes longer for a first extension. Google emails you when it is done. If they ask a question about site access, the answer is in the host permission justification in store-listing.md: access is optional, asked for only when the user turns on "Check as I type", and the text never leaves the device.

### 3d. After it is approved

1. Copy the store address of the extension (it looks like `https://chromewebstore.google.com/detail/tellbuster/...`).
2. Ask for it to be added to `README.md` and the web demo in place of "Coming soon".

## Part 4: the extension on Microsoft Edge Add-ons

Edge runs Chrome extensions as they are, so you upload the same zip as for Chrome. No code changes.

### 4a. Try it in Edge first (optional, 2 minutes)

1. In Edge, open `edge://extensions` and turn on **Developer mode** (bottom left).
2. Click **Load unpacked** and pick the `packages/extension` folder.
3. Click the puzzle piece icon in the toolbar, then **Tellbuster**. Click **Try an example**. Underlines and notes should show.

### 4b. Make a developer account (once)

1. Open [Microsoft Partner Center for Edge](https://partner.microsoft.com/dashboard/microsoftedge/overview) and sign in with a Microsoft account (make a free one if you have none).
2. Register as an Edge developer. It is free. Use a project email for the contact email, not a personal one.

### 4c. Upload and fill in the listing

Make the zip as in Part 3a (`node scripts/zip-extension.js`), then keep [store-listing.md](store-listing.md) open.

1. In Partner Center, click **Create new extension** and upload `tellbuster-extension.zip`.
2. **Availability**: **Public**, all markets.
3. **Properties**: category **Productivity**. Privacy policy address: `https://aiprofitwire.github.io/tellbuster/privacy.html`. When asked whether the extension collects personal information, answer **No**. Website: `https://aiprofitwire.github.io/tellbuster/`
4. **Store listings**: add English. Paste the long description from store-listing.md. For the logo, upload `packages/extension/icons/icon128.png` (Edge recommends 300 by 300 pixels but accepts 128 by 128). Add the same screenshots as for Chrome.
5. Click **Publish**. Microsoft says review can take up to 7 business days.

When it is approved, copy the Edge Add-ons address and ask for it to be added to `README.md` next to the Chrome one.

## Part 5: the extension on Firefox (addons.mozilla.org)

Firefox runs the same code with a slightly different manifest. A second script makes the Firefox zip, so nothing in the extension folder changes.

### 5a. Make the Firefox zip

In a terminal in the repo folder:

```
node scripts/zip-firefox.js
```

It prints `Made tellbuster-firefox.zip (version 0.1.0, 19 files).` It needs Firefox 140 or newer (the current version is fine).

### 5b. Try it in Firefox first (5 minutes)

1. In Firefox, type `about:debugging#/runtime/this-firefox` in the address bar and press Enter.
2. Click **Load Temporary Add-on...** and pick `tellbuster-firefox.zip` from the repo folder.
3. Click the puzzle piece icon in the toolbar, then **Tellbuster**. Click **Try an example**. Underlines and notes should show.
4. In the popup, click **Settings** at the bottom. Tick **Check as I type**. Firefox asks to let Tellbuster access your data for all websites: click **Allow**.
5. Open LinkedIn, start a post, and type `Let's delve into this game-changer.` Pause for a second. A small badge with the count should appear in the bottom right corner of the post box. Click it to see the notes.

A temporary add-on is removed when you close Firefox. That is normal: load it again the same way.

### 5c. Make a developer account (once)

1. Open the [Firefox Add-on Developer Hub](https://addons.mozilla.org/developers/) and log in with a Mozilla account (make a free one if you have none). There is no fee.
2. Accept the developer agreement when asked.

### 5d. Upload and fill in the listing

1. In the Developer Hub, click **Submit a New Add-on**.
2. Pick **On this site** (so it is listed on addons.mozilla.org), then **Continue**.
3. Upload `tellbuster-firefox.zip`. For compatibility, tick **Firefox** only. Firefox for Android has not been tried yet.
4. When asked whether you need to submit source code, answer **No**: the code in the zip is the real source, not minified or built.
5. Fill in the listing. The summary is filled in from the manifest. Paste the long description from store-listing.md. Category: **Other** or **Productivity**, whichever the form offers. License: **MIT**. Homepage: `https://aiprofitwire.github.io/tellbuster/`. Privacy policy: paste the text of `https://aiprofitwire.github.io/tellbuster/privacy.html` if the form asks for it.
6. In **Notes to reviewer**, paste this:

   ```
   All code is plain JavaScript, not minified. The automatic check shows 4 warnings about innerHTML in app.js. Every value put into innerHTML there goes through escapeHtml() first. Site access is optional and only requested when the user turns on "Check as I type" in the settings. No network calls, no data collected.
   ```

7. Click **Submit Version**. Review can take from a few hours to a few days. Mozilla emails you when it is done.

When it is approved, copy the addons.mozilla.org address and ask for it to be added to `README.md`.

**Never change the Firefox id** (`tellbuster@aiprofitwire.github.io`, set in `scripts/zip-tools.js`) after the first upload. Firefox uses it to know that a new version is the same add-on.

## Part 6 (later option): Safari

Not built yet. Safari extensions have to be wrapped in a Mac app, which needs:

- A Mac with **Xcode** (free from the Mac App Store).
- A paid **Apple Developer Program** membership (US$99 per year) to put it in the App Store.

When you want it, the steps are:

1. Make a copy of the `packages/extension` folder.
2. In Terminal, run Apple's converter on it: `xcrun safari-web-extension-converter path/to/the/copy`. It makes an Xcode project.
3. Open the project in Xcode, pick your developer team, and run it. Safari then lists Tellbuster under **Settings > Extensions**, where you turn it on.
4. Test the popup, the right-click menu and check as you type. Safari handles site access in its own way, so the settings page may need small changes.
5. Submit the app from Xcode to the App Store through App Store Connect.

## Part 7: the MCP server on npm (for AI agents)

This publishes `tellbuster-mcp`, so people can connect Tellbuster to Claude Code, Claude Desktop or Cursor. Do Part 2 first, and log in the same way.

**Before this part:** the Claude Code skill in `skills/tellbuster` runs `npx tellbuster`, and the `tellbuster` command is not in version `0.1.0` on npm. Publish a new engine version first: follow **Later releases** below (set `packages/core/package.json` to `"version": "0.2.0"`), then come back here.

1. In a terminal in the repo folder, go into the package folder:

   ```
   cd packages/mcp
   ```

2. See what will be published:

   ```
   npm pack --dry-run
   ```

   It must show exactly 4 files: `README.md`, `package.json`, `src/server.js` and `src/tool.js`. The name must be `tellbuster-mcp` and the version `0.1.0`.
3. Publish: `npm publish`. It ends with a line like `+ tellbuster-mcp@0.1.0`.
4. Check it: in any folder, run `claude mcp add tellbuster -- npx -y tellbuster-mcp`, start Claude Code and type `/mcp`. `tellbuster` should show as connected.
5. Go back to the repo folder: `cd ../..`

## Later releases

For each new version:

1. Raise the version number of each piece that changed:
   - `packages/core/package.json` (`"version"`), if the engine changed.
   - `packages/extension/manifest.json` (`"version"`), if the extension changed. The store refuses a zip whose version is not higher than the last one.
2. Run `node --test`. It must say `fail 0`.
3. For npm: repeat Part 2 from step 4.
4. For Chrome: run `node scripts/zip-extension.js`, then in the dashboard open Tellbuster, go to **Package**, click **Upload new package**, and submit for review.
5. For Edge: upload the same `tellbuster-extension.zip` in Partner Center (open Tellbuster, **Packages**, **Replace**), then **Publish**.
6. For Firefox: run `node scripts/zip-firefox.js`, then in the Developer Hub open Tellbuster, click **Upload New Version**, and submit.
