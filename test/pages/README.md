# Test pages for the extension

Small pages that copy how some sites build their post boxes, so the check-as-you-type badge can be tried without logging in anywhere.

- `x-style.html`: like the X home composer. It never fires an "input" event. Add `?swallow` or `?strip` to the address for harder cases.
- `linkedin-style.html`: like the LinkedIn post box, inside a modal dialog with a transform.
- `gmail-style.html`: like the Gmail compose box, plus a plain text box.

The extension only runs on web addresses, not on files, so serve them first. From the repo root:

```
node scripts/serve-test-pages.js
```

Then, in Chrome with the extension loaded, open its settings and tick **Check as I type** (Chrome asks for site access once). Open `http://localhost:8080/x-style.html` (or another page). Type `Let's delve into this game-changer.` and the badge should show **3 tells**.
