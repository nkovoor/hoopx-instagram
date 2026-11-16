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
     "beats": [ { "kind": "text|stat|quarters|moment|ladder|payoff", ... } ],   // 3-4 beats
     "sources": [ { "claim": "...", "url": "..." } ] }
4. Rules: every factual claim needs a source URL in "sources" or it is removed. No logos, no game photos.
   Beat fields follow scratch examples in reel/src/Story.jsx (text: {text}; stat: {value,label}; quarters: {};
   moment: {clock,score,text,shot?}; ladder: {rows}; payoff: {text}).
5. Commit and push data/story.json to main. Week 1: also send the plan to the owner for approval before posting.
