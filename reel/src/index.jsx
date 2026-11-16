import React from 'react';
import { registerRoot, Composition } from 'remotion';
import '@fontsource/anton';
import '@fontsource/bebas-neue';
import '@fontsource/outfit/500.css';
import '@fontsource/outfit/600.css';
import { Reel, totalFrames } from './Reel';
import { StoryReel, storyFrames } from './Story';
import { night as sampleNight } from './data';

const sampleStory = {
  sample: true,
  hook: { line1: 'SAMPLE', line2: 'STORY LAYOUT', tag: 'NOT REAL DATA' },
  player: { team: sampleNight.games[0].home.abbr },
  beats: [{ kind: 'text', title: 'SETUP', lines: ['SAMPLE LINE ONE', 'SAMPLE LINE TWO'] }],
};

const Root = () => (
  <>
    {/* Main: the story-first Reel (needs data/night.json + data/story.json) */}
    <Composition
      id="StoryReel"
      component={StoryReel}
      fps={30}
      width={1080}
      height={1920}
      durationInFrames={storyFrames(sampleNight, sampleStory)}
      defaultProps={{ night: sampleNight, story: sampleStory }}
      calculateMetadata={({ props }) => ({ durationInFrames: storyFrames(props.night, props.story) })}
    />
    {/* Fallback for a quiet night with no story: "Night in Numbers" */}
    <Composition
      id="NightReel"
      component={Reel}
      fps={30}
      width={1080}
      height={1920}
      durationInFrames={totalFrames(sampleNight)}
      defaultProps={{ night: sampleNight }}
      calculateMetadata={({ props }) => ({ durationInFrames: totalFrames(props.night) })}
    />
  </>
);

registerRoot(Root);
