# Daily story task (runs ~13:30 IST, after the 13:00 IST fetch commits data/night.json)

Goal: find the ONE story that makes last night's Reel worth watching, and write data/story.json.

1. Read data/night.json (etDate, games, tags, flags). Every number must come from it or from a saved source.
2. Search the web (AP, ESPN, NBA.com recaps) for last night's NBA games. Look in priority order for:
   all-time milestone or record (passes a legend, franchise/NBA record) > rookie breakout > game-winner > big comeback >
   50-point or triple-double night > upset > streak. If nothing notable, write NO story.json (Night in Numbers is used).
3. Write data/story.json:
   { "etDate": "YYYY-MM-DD" (must equal night.json etDate),
     "type": "milestone|record|legend|comeback|game-winner|rookie|upset|streak",
     "player": { "name": "Full Name", "team": "ABBR" },
     "hook": { "line1": "SHORT BIG LINE", "line2": "SECOND LINE", "tag": "optional red tag" },
     "caption": "1-2 sentence Instagram caption",
     "storyLine": "SHORT HYPE TEXT FOR THE INSTAGRAM STORY, max ~5 words, e.g. YAXEL POPPED OFF / ABSOLUTE BANGER LAST NIGHT / SGA PASSES KOBE",
     "beats": [ { "kind": "text|stat|quarters|moment|ladder|payoff", ... } ],   // 3-4 beats
     "sources": [ { "claim": "...", "url": "..." } ] }
4. Rules: every factual claim needs a source URL in "sources" or it is removed. No logos, no game photos.
   Beat fields follow scratch examples in reel/src/Story.jsx (text: {text}; stat: {value,label}; quarters: {};
   moment: {clock,score,text,shot?}; ladder: {rows}; payoff: {text}).
5. Commit and push data/story.json to main. Week 1: also send the plan to the owner for approval before posting.


NAME RULES: always use players' FULL names (e.g. LUKA DONČIĆ, never just DONČIĆ) in hook.line1, captions and storyLine. Moment beats should include shot {x,y} so the animated ball shot plays from the right spot.


CAPTIONS (required): EVERY beat gets a "caption": one plain sentence (max ~110 chars) that narrates what happened, like subtitles
for a silent video. Read in order, the captions must tell the whole story: setup -> turn -> result -> why it matters.
Use full player names and full team names. The big on-screen text stays short (the beat's text/value/label); the caption carries the explanation.
Beat order that works best: text (setup) -> stat -> stat (consecutive stats are merged into one scene) -> moment/quarters (the turn) -> payoff.
Optional "style": 0 broadcast (red), 1 prestige (black+gold), 2 neon (cyan). If omitted it rotates by date automatically.
