// Uploads reel/out/reel.mp4 to the public Supabase bucket, publishes it as an Instagram Reel, cleans up.
//   node scripts/post.mjs            -> dry run: prints the caption, uploads/publishes nothing
//   POST=true node scripts/post.mjs  -> really posts (needs IG_TOKEN, IG_USER_ID, SUPABASE_SERVICE_KEY)
import fs from 'node:fs';

const SB = 'https://pufirhdmhbesdmyxefmc.supabase.co';
const BUCKET = 'hoopx-posts';
const G = 'https://graph.facebook.com/v23.0';
const read = (f) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null);

const props = read('reel/props.json');
if (!props) { console.log('no props.json, nothing to post'); process.exit(0); }
const { night, story } = props;

export function buildCaption(night, story) {
  const lines = [];
  if (story?.caption) lines.push(story.caption);
  else if (story?.hook) lines.push(`${story.hook.line1} ${story.hook.line2}`.trim());
  else lines.push(`NBA scores and top performers, ${night.dateLabel}`);
  lines.push('');
  lines.push('Every final score and top scorer from last night. Full highlights on the NBA\'s official YouTube channel.');
  lines.push('');
  lines.push('Unofficial fan account, not affiliated with the NBA or any team. More on hoopxnba.com');
  lines.push('');
  lines.push('#NBA #basketball #nbahighlights #hoops #nbaedits');
  return lines.join('\n').slice(0, 2100);
}

const caption = buildCaption(night, story);
console.log('--- caption ---\n' + caption + '\n---------------');
if (process.env.POST !== 'true') { console.log('DRY RUN: not posting.'); process.exit(0); }

const { IG_TOKEN, IG_USER_ID, SUPABASE_SERVICE_KEY } = process.env;
if (!IG_TOKEN || !IG_USER_ID || !SUPABASE_SERVICE_KEY) throw new Error('missing secrets');

const form = (o) => new URLSearchParams({ ...o, access_token: IG_TOKEN });
let name = '';
if (process.env.STORY_ONLY !== 'true') {
name = `reel-${night.etDate}-${Date.now()}.mp4`;
const up = await fetch(`${SB}/storage/v1/object/${BUCKET}/${name}`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`, apikey: SUPABASE_SERVICE_KEY, 'Content-Type': 'video/mp4' },
  body: fs.readFileSync('reel/out/reel.mp4'),
});
if (!up.ok) throw new Error(`upload failed ${up.status} ${await up.text()}`);
const videoUrl = `${SB}/storage/v1/object/public/${BUCKET}/${name}`;
console.log('uploaded', videoUrl);

let coverUrl = null;
if (fs.existsSync('reel/out/cover.jpg')) {
  const cname = `cover-${night.etDate}-${Date.now()}.jpg`;
  const cu = await fetch(`${SB}/storage/v1/object/${BUCKET}/${cname}`, { method: 'POST', headers: { Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`, apikey: SUPABASE_SERVICE_KEY, 'Content-Type': 'image/jpeg' }, body: fs.readFileSync('reel/out/cover.jpg') });
  if (cu.ok) coverUrl = `${SB}/storage/v1/object/public/${BUCKET}/${cname}`;
  console.log('cover', coverUrl || 'upload failed, using default');
}
const create = await fetch(`${G}/${IG_USER_ID}/media`, { method: 'POST', body: form({ media_type: 'REELS', video_url: videoUrl, caption, share_to_feed: 'true', ...(coverUrl ? { cover_url: coverUrl } : {}) }) }).then((r) => r.json());
if (!create.id) throw new Error('container failed: ' + JSON.stringify(create));

let status = '';
for (let i = 0; i < 40; i += 1) {
  await new Promise((r) => setTimeout(r, 6000));
  const s = await fetch(`${G}/${create.id}?fields=status_code,status&access_token=${IG_TOKEN}`).then((r) => r.json());
  status = s.status_code;
  console.log('status', status);
  if (status === 'FINISHED') break;
  if (status === 'ERROR' || status === 'EXPIRED') throw new Error('processing failed: ' + JSON.stringify(s));
}
if (status !== 'FINISHED') throw new Error('timed out waiting for processing');

const pub = await fetch(`${G}/${IG_USER_ID}/media_publish`, { method: 'POST', body: form({ creation_id: create.id }) }).then((r) => r.json());
if (!pub.id) throw new Error('publish failed: ' + JSON.stringify(pub));
console.log('PUBLISHED', pub.id);

}

// Also share to Stories: video (card + Reel cut) if available, else the still card. Never fails the run.
async function postStory(kind) {
  const isVid = kind === 'video';
  const file = isVid ? 'reel/out/story.mp4' : 'reel/out/storycard.jpg';
  const sname = `story-${night.etDate}-${Date.now()}.${isVid ? 'mp4' : 'jpg'}`;
  const sup = await fetch(`${SB}/storage/v1/object/${BUCKET}/${sname}`, { method: 'POST', headers: { Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`, apikey: SUPABASE_SERVICE_KEY, 'Content-Type': isVid ? 'video/mp4' : 'image/jpeg' }, body: fs.readFileSync(file) });
  if (!sup.ok) throw new Error('story upload failed');
  const url = `${SB}/storage/v1/object/public/${BUCKET}/${sname}`;
  const st = await fetch(`${G}/${IG_USER_ID}/media`, { method: 'POST', body: form({ media_type: 'STORIES', ...(isVid ? { video_url: url } : { image_url: url }) }) }).then((r) => r.json());
  if (!st.id) throw new Error(JSON.stringify(st));
  let ok = false;
  for (let i = 0; i < 40 && !ok; i += 1) {
    await new Promise((r) => setTimeout(r, 5000));
    const x = await fetch(`${G}/${st.id}?fields=status_code&access_token=${IG_TOKEN}`).then((r) => r.json());
    if (x.status_code === 'FINISHED') ok = true;
    if (x.status_code === 'ERROR' || x.status_code === 'EXPIRED') throw new Error('story processing failed');
  }
  if (!ok) throw new Error('story timed out');
  const sp = await fetch(`${G}/${IG_USER_ID}/media_publish`, { method: 'POST', body: form({ creation_id: st.id }) }).then((r) => r.json());
  if (!sp.id) throw new Error(JSON.stringify(sp));
  console.log('STORY', kind, sp.id);
}
try {
  if (fs.existsSync('reel/out/story.mp4')) {
    try { await postStory('video'); } catch (e) { console.log('video story failed, trying card:', e.message); await postStory('image'); }
  } else await postStory('image');
} catch (e) { console.log('story skipped:', e.message); }

// Clean up: delete files older than 3 days from the bucket.
try {
  const list = await fetch(`${SB}/storage/v1/object/list/${BUCKET}`, { method: 'POST', headers: { Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`, apikey: SUPABASE_SERVICE_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ limit: 200 }) }).then((r) => r.json());
  const old = (list || []).filter((o) => o.name !== name && Date.now() - Date.parse(o.created_at) > 3 * 86400000).map((o) => o.name);
  if (old.length) await fetch(`${SB}/storage/v1/object/${BUCKET}`, { method: 'DELETE', headers: { Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`, apikey: SUPABASE_SERVICE_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ prefixes: old }) });
  console.log('cleaned', old.length);
} catch (e) { console.log('cleanup skipped', e.message); }
