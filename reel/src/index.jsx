import React from 'react';
import { registerRoot, Composition } from 'remotion';
import '@fontsource/anton';
import '@fontsource/bebas-neue';
import '@fontsource/outfit/500.css';
import '@fontsource/outfit/600.css';
import { Reel, TOTAL } from './Reel';

const Root = () => (
  <Composition id="NightReel" component={Reel} durationInFrames={TOTAL} fps={30} width={1080} height={1920} />
);

registerRoot(Root);
