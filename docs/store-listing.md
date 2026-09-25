# Chrome Web Store listing

Everything to paste into the Chrome Web Store form, in the order the form asks for it. Each box below holds only the text to paste.

## Title

The store takes the title from the `name` in `packages/extension/manifest.json`, so it is:

```
Tellbuster
```

## Short description

115 characters (the limit is 132). The store takes this from the `description` in `manifest.json`, so it is already filled in. If you change one, change the other.

```
Underlines phrases that read as AI, explains why, and suggests a plainer way to say it. Nothing leaves your device.
```

## Long description

Plain text: the store does not show bold or links as formatting.

```
Tellbuster points out the phrases that make writing read like AI, explains why each one stands out, and suggests a plainer way to say it.

Readers now notice phrases like "Let's delve into", "In today's fast-paced world" or "It's not just X, it's Y". Tellbuster finds them before you hit send, so you can decide what to keep.

Tellbuster is a linter, not a detector. It never says your text "is AI". People use these phrases too. It shows you what readers notice.

WHAT IT DOES
- Click the Tellbuster icon, paste your writing, and see each phrase underlined with a short note: why it stands out and what to write instead.
- Select text on any page, right-click, and pick "Check with Tellbuster".
- Optional: turn on "Check as I type" in the settings. A small badge shows up in text boxes on LinkedIn, X, Gmail and most sites when it finds something. Click it to see the notes.
- English and French, plus starter rules for Spanish, German and Portuguese. More than 100 rules in all.
- Turn off any rule or group of rules, add a strict mode for filler words, and turn the badge off on sites you pick.

PRIVATE BY DESIGN
- Your text is checked on your device and never sent anywhere.
- No accounts, no analytics, no ads, no tracking.
- Installing asks for no access to any website. Site access is asked for only if you turn on "Check as I type", and you can take it back at any time.

FREE AND OPEN SOURCE
Tellbuster is MIT licensed. Every rule is plain, readable data, and anyone can suggest a new one on GitHub: https://github.com/aiprofitwire/tellbuster

Try it without installing anything: https://aiprofitwire.github.io/tellbuster/
```

## Category and language

- **Category:** Productivity (pick **Tools** if the form asks for a sub-category).
- **Language:** English.

## Links

- **Homepage URL:** `https://aiprofitwire.github.io/tellbuster/`
- **Support URL:** `https://github.com/aiprofitwire/tellbuster/issues`
- **Privacy policy URL:** `https://aiprofitwire.github.io/tellbuster/privacy.html`

## Screenshots to take

The store wants 1280x800 pixels (640x400 also works), PNG or JPEG, one to five images. Use a clean Chrome window with no other extensions showing.

1. **The popup with findings.** Click the Tellbuster icon, click **Try an example**, and capture the popup with underlines and the list of notes.
2. **A note up close.** In the popup, hover one underlined phrase so its card (name, why, fix) shows.
3. **The right-click menu.** Select a paragraph on a news page, right-click, and capture the menu with **Check with Tellbuster** showing.
4. **The badge on a site.** With **Check as I type** on, write a short post in a text box (the LinkedIn look-alike page in `test/pages/` works, see its README) and capture the badge with its panel open.
5. **The settings page.** Right-click the icon, pick **Options**, and capture the page showing languages, strict mode and the rule groups.

## Small promo tile (optional)

440x280 pixels. The Tellbuster logo and the line "Find the phrases that read as AI." on the page background color.

## Privacy practices tab

The store asks these questions. The answers are:

**Single purpose:**

```
Tellbuster checks the text you write for phrases that read as AI and explains why, with a suggested fix. All checking happens on the user's device.
```

**Permission justifications:**

`storage`:

```
Saves the user's settings (languages, strict mode, rules turned off, sites where the badge is off) and holds text picked with the right-click menu in memory until the popup opens. The user's text is never saved.
```

`contextMenus`:

```
Adds a "Check with Tellbuster" item to the right-click menu for selected text.
```

`scripting`:

```
Adds the as-you-type badge script to pages, only after the user turns on "Check as I type" and grants site access.
```

Host permission (optional, `https://*/*` and `http://*/*`):

```
Asked for only when the user turns on "Check as I type" in the settings. It lets the badge read what the user types in text boxes on any site, so it can count phrases that read as AI. The text is checked on the device and never sent or saved. The user can take this access back at any time.
```

**Remote code:** No, I am not using remote code.

**Data usage:** tick none of the data types. Then tick all three statements (not sold to third parties, not used for unrelated purposes, not used for creditworthiness or lending).
