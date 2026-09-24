# Approved landing page design

These files are the approved design for the new landing page (`docs/index.html`), made in a design tool and signed off by the maintainer. They are reference files, not working pages: build the real page to match them.

- `desktop.html`: the full desktop page (1440px wide), including the Before / After demo in the hero.
- `phone.html`: the top of the page on a phone (390px wide). Left-aligned, like desktop.
- `social-card.html`: the 1200x630 link preview image (use it as the `og:image` and `twitter:image`).

What to keep exactly: the fonts (Fraunces for headings, Hanken Grotesk for body), the colors, the spacing, the copy, and the section order. Replace `[RULE COUNT]` with the real number of default rules at build time. Fonts must be self-hosted in `docs/` (no Google Fonts link), to keep the no-network promise.
