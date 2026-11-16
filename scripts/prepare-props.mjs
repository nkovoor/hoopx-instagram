// Merges data/night.json + data/story.json into reel/props.json and decides which composition to render.
// Photos are only used when a file exists in reel/public/players/<slug>.png (you add those yourself).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');
const read = (f) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null);

const slug = (name) => name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const photoFor = (name) => {
  if (!name) return null;
  const file = `${slug(name)}.png`;
  return fs.existsSync(path.join(root, 'reel', 'public', 'players', file)) ? file : null;
};

const night = read(path.join(root, 'data', 'night.json'));
if (!night || night.status !== 'ok') {
  console.log(`composition=none`);
  process.exit(0);
}
// Refresh every game's photo against the folder (new files appear without re-fetching).
for (const g of night.games) if (g.star) g.star.photo = photoFor(g.star.name);
if (night.potn) night.potn.photo = photoFor(`${night.potn.first} ${night.potn.last}`);

const story = read(path.join(root, 'data', 'story.json'));
let composition = 'NightReel';
let props = { night };
if (story && Array.isArray(story.beats) && story.beats.length && story.hook) {
  if (story.player?.name) story.player.photo = photoFor(story.player.name);
  composition = 'StoryReel';
  props = { night, story };
}
// A story only counts if it was written for this night (never post yesterday's story).
if (props.story && story.etDate && story.etDate !== night.etDate) {
  console.log(`story is for ${story.etDate}, night is ${night.etDate}: ignoring story`);
  composition = 'NightReel';
  props = { night };
}

// Music: pick a mood pool, rotate through it by date (no repeats until the pool is used up),
// vary the start point on later cycles.
const MOOD = { milestone: 'epic', record: 'epic', legend: 'legend', comeback: 'hype', 'game-winner': 'hype', rookie: 'hype', upset: 'hype', streak: 'hype' };
const mood = 'hype'; // only energetic tracks are kept; MOOD map unused for now
const dir = path.join(root, 'reel', 'public', 'music', mood);
const pool = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.mp3')).sort() : [];
if (pool.length) {
  const day = Math.floor(Date.parse(night.etDate) / 86400000);
  const file = pool[day % pool.length];
  const cycle = Math.floor(day / pool.length);
  props.music = { file: `music/${mood}/${file}`, startSec: (cycle % 3) * 10 };
  console.log(`music=${props.music.file} start=${props.music.startSec}s`);
}
fs.writeFileSync(path.join(root, 'reel', 'props.json'), JSON.stringify(props));
console.log(`composition=${composition}`);
