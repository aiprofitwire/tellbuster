# Launch video

A 36 second video of Tellbuster at work: a sample post gets underlined as it is typed, a card explains one phrase, the post is rewritten plainly, then the end card. Captions only, no voiceover.

This folder is separate from the rest of the repo. Nothing in `packages/` or `docs/` depends on it, and its packages are never part of the extension or the npm package.

**License note:** the video is made with [Remotion](https://www.remotion.dev/), which is not MIT licensed: it is free for individuals and companies of up to 3 people, and bigger companies need a paid license.

## What it makes

| File | Size | For |
|---|---|---|
| `out/tellbuster-1080x1080.mp4` | 1080 x 1080 | LinkedIn, X |
| `out/tellbuster-1080x1920.mp4` | 1080 x 1920 | YouTube Shorts, Reels, TikTok |
| `../docs/media/demo.gif` | 540 x 540, 10 frames a second | The README (committed, under 3 MB) |

The `out/` folder is in `.gitignore`: the MP4 files are never committed.

## Make the files yourself

You need [Node.js](https://nodejs.org/) 20 or newer. In a terminal, from the repo folder:

```
cd video
npm install
npm run render
```

It takes a few minutes. The first time, Remotion downloads its own copy of Chrome to draw the frames. The MP4 files land in `video/out/`.

To preview and tweak the video in your browser, run `npm run studio` instead.

## How it works

- `src/script.js` holds every caption and both sample texts. A test (`test/video.test.js`) runs them through Tellbuster: the captions must have no tells.
- `src/data.js` checks the sample with the real engine and the real English rules, so every underline and the card text are what Tellbuster actually says.
- `src/Launch.jsx` draws the scenes. Colors come from `docs/landing.css` and the fonts from `docs/fonts/`.
