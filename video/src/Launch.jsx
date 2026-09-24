import { useLayoutEffect, useRef, useState } from 'react';
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import './fonts.js';
import { C, SANS, SERIF } from './theme.js';
import { beforeFindings, beforeMarks, afterFindings } from './data.js';
import {
  AFTER, BEFORE, CAPTIONS, CARD_CLOSE, CARD_OPEN, CARD_PHRASE, END_LINE, END_START, END_TITLE, END_URL,
  REWRITE_START, REWRITE_TYPE_END, REWRITE_TYPE_START, TYPE_END, TYPE_START
} from './script.js';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' };
const SEV_COLOR = { high: C.high, medium: C.medium, low: C.low };
const SEV_LABEL = { high: 'HIGH', medium: 'MEDIUM', low: 'LOW' };

// How many characters are typed at a frame, and the frame a given character appears.
const typed = (frame, text, start, end) => Math.floor(interpolate(frame, [start, end], [0, text.length], clamp));
const frameAt = (index, text, start, end) => start + (index / text.length) * (end - start);

export const Logo = ({ size }) => (
  <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
    <rect x="2" y="4" width="28" height="20" rx="6" fill="none" stroke={C.accent} strokeWidth="2.5" />
    <path d="M10 24l-2 5 7-5" fill="none" stroke={C.accent} strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M8 14.5h16" stroke={C.high} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 3" />
  </svg>
);

// One underlined phrase. The line draws from left to right once the phrase is typed.
function Mark({ finding, progress, children, markRef }) {
  const color = SEV_COLOR[finding.severity];
  const line =
    finding.severity === 'low'
      ? `repeating-linear-gradient(90deg, ${color} 0 4px, transparent 4px 8px)`
      : `linear-gradient(${color}, ${color})`;
  return (
    <span
      ref={markRef}
      style={{
        backgroundImage: line,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'left bottom',
        backgroundSize: `${progress * 100}% 0.1em`,
        paddingBottom: '0.06em'
      }}
    >
      {children}
    </span>
  );
}

// The text with its underlines. Untyped text is kept in place but invisible, so lines never jump.
function Paragraph({ text, marks, shown, frame, start, end, fade, markRef, caret }) {
  const parts = [];
  let pos = 0;
  const piece = (from, to) => {
    const visible = text.slice(from, Math.max(from, Math.min(to, shown)));
    const hidden = text.slice(Math.max(from, Math.min(to, shown)), to);
    return (
      <>
        {visible}
        {caret && shown > from && shown <= to && caret}
        {hidden && <span style={{ color: 'transparent' }}>{hidden}</span>}
      </>
    );
  };
  for (const f of marks) {
    if (f.start > pos) parts.push(<span key={`t${pos}`}>{piece(pos, f.start)}</span>);
    const doneAt = frameAt(f.end, text, start, end);
    const progress = interpolate(frame, [doneAt + 2, doneAt + 12], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) }) * fade;
    parts.push(
      <Mark key={`m${f.start}`} finding={f} progress={progress} markRef={f.match === CARD_PHRASE ? markRef : undefined}>
        {piece(f.start, f.end)}
      </Mark>
    );
    pos = f.end;
  }
  if (pos < text.length) parts.push(<span key={`t${pos}`}>{piece(pos, text.length)}</span>);
  return parts;
}

function Caption({ frame, size }) {
  return CAPTIONS.map((c) => {
    const opacity = interpolate(frame, [c.from, c.from + 10, c.to - 10, c.to], [0, 1, 1, 0], clamp);
    const y = interpolate(frame, [c.from, c.from + 12], [16, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
    if (opacity === 0) return null;
    return (
      <div
        key={c.from}
        style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end',
          opacity, transform: `translateY(${y}px)`,
          fontFamily: SERIF, fontWeight: 600, fontSize: size, lineHeight: 1.15, letterSpacing: '-0.01em', color: C.text
        }}
      >
        {c.text}
      </div>
    );
  });
}

// The explain card, like the one that opens on a highlight in the web demo.
function ExplainCard({ finding, scale, fontSize }) {
  return (
    <div
      style={{
        width: '100%', background: C.surface, border: `1px solid ${C.border}`, borderRadius: fontSize,
        boxShadow: '0 24px 48px rgba(22, 24, 27, 0.16)', padding: `${fontSize * 1.1}px ${fontSize * 1.4}px`,
        fontFamily: SANS, fontSize, lineHeight: 1.5, color: C.text,
        transform: `scale(${scale})`, transformOrigin: 'top left', opacity: Math.min(1, scale * 1.2)
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16, marginBottom: fontSize * 0.5 }}>
        <span style={{ fontWeight: 700, fontSize: fontSize * 1.15 }}>{finding.name}</span>
        <span style={{ fontWeight: 700, fontSize: fontSize * 0.75, letterSpacing: '0.06em', color: finding.severity === 'medium' ? C.mediumText : SEV_COLOR[finding.severity] }}>
          {SEV_LABEL[finding.severity]}
        </span>
      </div>
      <div style={{ color: C.body, marginBottom: fontSize * 0.6 }}>{finding.why}</div>
      <div><strong>Try this:</strong> {finding.fix}</div>
    </div>
  );
}

export const Launch = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const tall = height > width;

  const pad = tall ? 72 : 64;
  const textSize = tall ? 44 : 34;
  const captionSize = tall ? 76 : 58;
  const uiSize = tall ? 28 : 24;

  // Scene 1 and 2: the sloppy paragraph types in and gets underlined.
  const rewriting = frame >= REWRITE_START;
  const oldFade = interpolate(frame, [REWRITE_START - 20, REWRITE_START], [1, 0], clamp);
  const text = frame >= REWRITE_TYPE_START ? AFTER : BEFORE;
  const shown =
    text === BEFORE ? typed(frame, BEFORE, TYPE_START, TYPE_END) : typed(frame, AFTER, REWRITE_TYPE_START, REWRITE_TYPE_END);
  const typingNow =
    (frame >= TYPE_START && frame < TYPE_END + 10) || (frame >= REWRITE_TYPE_START - 5 && frame < REWRITE_TYPE_END + 10);

  // The count follows the underlines as they appear, like the real badge.
  const count =
    text === BEFORE
      ? beforeFindings.filter((f) => frame >= frameAt(f.end, BEFORE, TYPE_START, TYPE_END) + 2).length
      : frame >= REWRITE_TYPE_END + 6 ? afterFindings.length : null;
  const summary =
    count === null || (count === 0 && text === BEFORE)
      ? 'Checking...'
      : count === 0
        ? 'No tells found. Nice work.'
        : `${count} ${count === 1 ? 'phrase' : 'phrases'} might read as AI`;
  const badge = summary === 'Checking...' ? '...' : count ? `${count} ${count === 1 ? 'tell' : 'tells'}` : 'No tells';

  // Scene 3: the card opens on "Let's delve into".
  const cardFinding = beforeFindings.find((f) => f.match === CARD_PHRASE);
  const cardIn = spring({ frame: frame - CARD_OPEN, fps, config: { damping: 18, stiffness: 160 } });
  const cardOut = interpolate(frame, [CARD_CLOSE, CARD_CLOSE + 10], [1, 0], clamp);
  const cardScale = frame < CARD_OPEN ? 0 : cardIn * cardOut;
  const tap = interpolate(frame, [CARD_OPEN - 14, CARD_OPEN + 6], [0, 1], clamp);

  // Measure where the card's phrase sits, to put the tap and the card under it.
  const markRef = useRef(null);
  const boxRef = useRef(null);
  const [anchor, setAnchor] = useState(null);
  useLayoutEffect(() => {
    if (!markRef.current || !boxRef.current) return;
    const m = markRef.current.getClientRects()[0];
    const b = boxRef.current.getBoundingClientRect();
    if (!m) return;
    // getBoundingClientRect includes the composition's preview scale; undo it.
    const k = b.width / boxRef.current.offsetWidth;
    const next = { x: (m.left - b.left) / k, y: (m.bottom - b.top) / k, w: m.width / k };
    if (!anchor || next.x !== anchor.x || next.y !== anchor.y) setAnchor(next);
  });

  // Scene 5: end card.
  const endIn = spring({ frame: frame - END_START, fps, config: { damping: 20, stiffness: 120 } });
  const demoOpacity = interpolate(frame, [END_START - 12, END_START + 4], [1, 0], clamp);

  const cardWidth = width - pad * 2;
  const popWidth = Math.min(cardWidth - 40, tall ? 820 : 640);
  const popLeft = anchor ? Math.max(20, Math.min(anchor.x, cardWidth - popWidth - 20)) : 20;

  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: SANS, color: C.text }}>
      <AbsoluteFill style={{ opacity: demoOpacity, padding: pad, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: tall ? 64 : 40 }}>
        <div style={{ position: 'relative', height: captionSize * 1.15 * (tall ? 3 : 2), flexShrink: 0 }}>
          <Caption frame={frame} size={captionSize} />
        </div>

        <div
          style={{
            position: 'relative', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 24,
            boxShadow: '0 30px 60px rgba(22, 24, 27, 0.10), 0 2px 6px rgba(22, 24, 27, 0.05)',
            opacity: interpolate(frame, [0, 14], [0, 1], clamp),
            transform: `translateY(${interpolate(frame, [0, 18], [24, 0], { ...clamp, easing: Easing.out(Easing.cubic) })}px)`
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: `${uiSize}px ${uiSize * 1.4}px`, borderBottom: `1px solid ${C.divider}`, fontSize: uiSize, fontWeight: 600 }}>
            <span style={{ width: uiSize * 1.7, height: uiSize * 1.7, borderRadius: '50%', background: C.mint }} />
            New post
          </div>

          <div ref={boxRef} style={{ position: 'relative', padding: `${uiSize * 1.3}px ${uiSize * 1.4}px ${uiSize * 1.6}px`, fontSize: textSize, lineHeight: 1.6, minHeight: textSize * 1.6 * (tall ? 7 : 6) }}>
            <div style={{ opacity: rewriting && text === BEFORE ? oldFade : 1 }}>
              <Paragraph
                text={text}
                marks={text === BEFORE ? beforeMarks : afterFindings}
                shown={shown}
                frame={frame}
                start={text === BEFORE ? TYPE_START : REWRITE_TYPE_START}
                end={text === BEFORE ? TYPE_END : REWRITE_TYPE_END}
                fade={text === BEFORE ? oldFade : 1}
                markRef={markRef}
                caret={
                  typingNow && (
                    <span style={{ display: 'inline-block', width: 3, height: textSize * 1.1, margin: '0 -1.5px', verticalAlign: 'text-bottom', background: C.accent, opacity: Math.floor(frame / 8) % 2 === 0 ? 1 : 0 }} />
                  )
                }
              />
            </div>

            {anchor && tap > 0 && tap < 1 && (
              <div
                style={{
                  position: 'absolute', left: anchor.x + anchor.w / 2 - 40, top: anchor.y - textSize * 0.9 - 40, width: 80, height: 80,
                  borderRadius: '50%', border: `4px solid ${C.accent}`, opacity: 1 - tap, transform: `scale(${0.4 + tap})`
                }}
              />
            )}
            {anchor && cardScale > 0.01 && (
              <div style={{ position: 'absolute', left: popLeft, top: anchor.y + 14, width: popWidth, zIndex: 2 }}>
                <ExplainCard finding={cardFinding} scale={cardScale} fontSize={tall ? 30 : 24} />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: `${uiSize * 0.6}px ${uiSize * 0.6}px ${uiSize * 0.6}px ${uiSize * 1.4}px`, borderTop: `1px solid ${C.divider}`, background: C.surface2, borderRadius: '0 0 24px 24px', fontSize: uiSize }}>
            <span style={{ color: C.muted, fontWeight: 500 }}>{summary}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, height: uiSize * 2.1, padding: `0 ${uiSize * 0.8}px`, borderRadius: 999, background: C.dark, color: '#fff', fontWeight: 700 }}>
              <svg width={uiSize} height={uiSize} viewBox="0 0 32 32" aria-hidden="true">
                <rect x="2" y="4" width="28" height="20" rx="6" fill="none" stroke="currentColor" strokeWidth="3" />
                <path d="M8 14.5h16" stroke={C.badgeDash} strokeWidth="3" strokeLinecap="round" strokeDasharray="3 3" />
              </svg>
              {badge}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: SERIF, fontWeight: 600, fontSize: uiSize * 1.1, position: 'absolute', left: pad, bottom: pad }}>
          <Logo size={uiSize * 1.5} />
          Tellbuster
        </div>
      </AbsoluteFill>

      {frame >= END_START - 4 && (
        <AbsoluteFill style={{ padding: pad, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: tall ? 40 : 28, opacity: Math.min(1, endIn * 1.5) }}>
          <div style={{ transform: `translateY(${(1 - endIn) * 30}px)` }}>
            <Logo size={tall ? 150 : 120} />
          </div>
          <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: tall ? 110 : 96, lineHeight: 1.05, letterSpacing: '-0.02em', transform: `translateY(${(1 - endIn) * 40}px)` }}>
            {END_TITLE}
          </div>
          <div style={{ fontSize: tall ? 52 : 44, lineHeight: 1.3, color: C.body, maxWidth: 900, transform: `translateY(${(1 - endIn) * 50}px)` }}>
            {END_LINE}
          </div>
          <div
            style={{
              marginTop: tall ? 40 : 24, fontSize: tall ? 44 : 38, fontWeight: 700, color: C.accent,
              opacity: interpolate(frame, [END_START + 20, END_START + 34], [0, 1], clamp)
            }}
          >
            {END_URL}
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
