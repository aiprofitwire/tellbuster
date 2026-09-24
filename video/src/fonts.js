// Loads the landing page fonts from docs/fonts (the public folder, see remotion.config.js).
import { continueRender, delayRender, staticFile } from 'remotion';

const fonts = [
  ['Fraunces', 'fraunces.woff2'],
  ['Hanken Grotesk', 'hanken-grotesk.woff2']
];

const handle = delayRender('Loading fonts');
Promise.all(
  fonts.map(([family, file]) => {
    const face = new FontFace(family, `url(${staticFile(file)}) format("woff2")`, { weight: '100 900' });
    document.fonts.add(face);
    return face.load();
  })
).then(() => continueRender(handle));
