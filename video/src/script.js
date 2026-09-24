// Everything the video says, in one place. A test runs these lines through Tellbuster:
// the captions must have no tells, BEFORE must have tells and AFTER must have none.
// Frames are at 30 per second.

export const FPS = 30;
export const DURATION = 36 * FPS;

// The same sample the landing page uses for "Before" and "After".
export const BEFORE = "Certainly! In today's fast-paced world, it's not just about posting more, it's about posting smarter. Let's delve into how you can harness the power of storytelling. Here's the thing: consistency plays a crucial role. Let that sink in.";
export const AFTER = 'Post less, and make each post count. Tell one real story from your week, and post it on the same day each week so people know when to look for it.';

// The phrase whose card opens in the middle of the video.
export const CARD_PHRASE = "Let's delve into";

export const CAPTIONS = [
  { from: 0, to: 150, text: 'Does your writing sound like AI?' },
  { from: 150, to: 330, text: 'Tellbuster underlines the phrases readers link to AI.' },
  { from: 330, to: 570, text: 'Tap one to see why it stands out, and a plainer way to say it.' },
  { from: 570, to: 780, text: 'Then rewrite it in your own words.' },
  { from: 780, to: 900, text: 'No account. No tracking. Your text stays on your device.' }
];

export const END_TITLE = 'Tellbuster.';
export const END_LINE = 'Free, open source, nothing leaves your browser.';
export const END_URL = 'aiprofitwire.github.io/tellbuster';

// Scene timing
export const TYPE_START = 20;
export const TYPE_END = 170;
export const CARD_OPEN = 360;
export const CARD_CLOSE = 560;
export const REWRITE_START = 580;
export const REWRITE_TYPE_START = 600;
export const REWRITE_TYPE_END = 700;
export const END_START = 900;
