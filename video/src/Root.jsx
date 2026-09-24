import { Composition } from 'remotion';
import { Launch } from './Launch.jsx';
import { DURATION, FPS } from './script.js';

export const Root = () => (
  <>
    <Composition id="Square" component={Launch} durationInFrames={DURATION} fps={FPS} width={1080} height={1080} />
    <Composition id="Tall" component={Launch} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} />
  </>
);
