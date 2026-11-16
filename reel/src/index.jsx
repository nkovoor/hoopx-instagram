import React from 'react';
import { registerRoot, Composition } from 'remotion';
import '@fontsource/anton';
import '@fontsource/bebas-neue';
import '@fontsource/outfit/500.css';
import '@fontsource/outfit/600.css';
import { Reel, totalFrames } from './Reel';
import { night as sample } from './data';

const Root = () => (
  <Composition
    id="NightReel"
    component={Reel}
    fps={30}
    width={1080}
    height={1920}
    durationInFrames={totalFrames(sample)}
    defaultProps={{ night: sample }}
    calculateMetadata={({ props }) => ({ durationInFrames: totalFrames(props.night) })}
  />
);

registerRoot(Root);
