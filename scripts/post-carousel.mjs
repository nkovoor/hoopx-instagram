// Posts reel/out/slides/slide-*.jpg as an Instagram carousel. POST=true to really post.  node scripts/post-carousel.mjs "caption text"
import fs from 'node:fs';
const SB = 'https://pufirhdmhbesdmyxefmc.supabase.co', BUCKET = 'hoopx-posts', G = 'https://graph.facebook.com/v23.0';
const caption = process.argv[2] || 'HoopX';
const files = fs.readdirSync('reel/out/slides').filter((f) => f.endsWith('.jpg')).sort();
console.log(`${files.length} slides\n${caption}`);
if (process.env.POST !== 'true') { console.log('DRY RUN: not posting.'); process.exit(0); }
const { IG_TOKEN, IG_USER_ID, SUPABASE_SERVICE_KEY } = process.env;
if (!IG_TOKEN || !IG_USER_ID || !SUPABASE_SERVICE_KEY) throw new Error('missing secrets');
const H = { Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`, apikey: SUPABASE_SERVICE_KEY };
const form = (o) => new URLSearchParams({ ...o, access_token: IG_TOKEN });
const stamp = Date.now(), names = [], kids = [];
for (const f of files) {
  const name = `car-${stamp}-${f}`; names.push(name);
  const up = await fetch(`${SB}/storage/v1/object/${BUCKET}/${name}`, { method: 'POST', headers: { ...H, 'Content-Type': 'image/jpeg' }, body: fs.readFileSync(`reel/out/slides/${f}`) });
  if (!up.ok) throw new Error('upload failed ' + (await up.text()));
  const c = await fetch(`${G}/${IG_USER_ID}/media`, { method: 'POST', body: form({ image_url: `${SB}/storage/v1/object/public/${BUCKET}/${name}`, is_carousel_item: 'true' }) }).then((r) => r.json());
  if (!c.id) throw new Error('child failed ' + JSON.stringify(c));
  kids.push(c.id);
}
const parent = await fetch(`${G}/${IG_USER_ID}/media`, { method: 'POST', body: form({ media_type: 'CAROUSEL', children: kids.join(','), caption }) }).then((r) => r.json());
if (!parent.id) throw new Error('carousel failed ' + JSON.stringify(parent));
for (let i = 0; i < 30; i += 1) {
  await new Promise((r) => setTimeout(r, 4000));
  const s = await fetch(`${G}/${parent.id}?fields=status_code&access_token=${IG_TOKEN}`).then((r) => r.json());
  if (s.status_code === 'FINISHED') break;
  if (s.status_code === 'ERROR') throw new Error('processing failed');
}
const pub = await fetch(`${G}/${IG_USER_ID}/media_publish`, { method: 'POST', body: form({ creation_id: parent.id }) }).then((r) => r.json());
if (!pub.id) throw new Error('publish failed ' + JSON.stringify(pub));
console.log('PUBLISHED', pub.id);
