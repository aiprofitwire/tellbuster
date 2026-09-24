# Publishing Tellbuster

Step by step, in this order: the web demo first (the other two link to it), then npm, then the Chrome Web Store. Each part stands on its own, so you can stop after any of them.

## What you need

- A computer with **Node.js** installed (version 22 or newer). Get the "LTS" version from [nodejs.org](https://nodejs.org). To check, open a terminal (on a Mac: **Terminal**, on Windows: **PowerShell**) and type `node -v`. It should print a number like `v22.x.x`.
- This repo on your computer, up to date with `main`. If you have never done this: click **Code > Download ZIP** on the repo page, unzip it, and open a terminal in that folder. (If you use git: `git pull` on `main`.)
- About one hour in total, plus waiting time for the Chrome review.

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

**One thing to know first:** the package holds the engine only, not the rule files. A developer who installs it has to get `rules/en.json` from this repo. That works, but it is less handy. If you want the rules inside the package, ask for that change before you publish (it is a small change). Once a version is published, it cannot be changed, only replaced by a newer version.

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

   Check the list under **Tarball Contents**. It must show exactly 3 files: `README.md`, `package.json` and `src/index.js`. The name must be `tellbuster` and the version `0.1.0`.
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

## Later releases

For each new version:

1. Raise the version number of each piece that changed:
   - `packages/core/package.json` (`"version"`), if the engine changed.
   - `packages/extension/manifest.json` (`"version"`), if the extension changed. The store refuses a zip whose version is not higher than the last one.
2. Run `node --test`. It must say `fail 0`.
3. For npm: repeat Part 2 from step 4.
4. For Chrome: run `node scripts/zip-extension.js`, then in the dashboard open Tellbuster, go to **Package**, click **Upload new package**, and submit for review.
