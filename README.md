# Leonida Trophy Guide — GTA VI (PS5)

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/gaplek15/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/gaplek15/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI — 1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden, 0 online. Every trophy has a real guide in the author's own words, a 5-stage roadmap leads to the platinum, and the checklist remembers what you have earned.

## What it is

- Official name, description and grade for every trophy, plus a guide written in the author's own words, with steps and 2–3 named sources beside every guide.
- A 5-stage roadmap to the platinum, with the one missable trophy (Positive Mental Attitude) flagged and explained in full.
- A tracker that saves your progress in localStorage, with export/import JSON, kind and grade filters, search, and a spoiler mode that hides unrevealed story trophies.
- Fully offline and original: no network requests at runtime, no Rockstar logo, artwork or game screenshots.

## How to run

```sh
cd app
python3 -m http.server 8080
```

Then open http://localhost:8080 in a browser.

Preview links:

- `/?demo=1` — checklist with 12 trophies already earned
- `/?view=roadmap` — jump straight to the roadmap
- `/?kind=story` — story trophies only (also `collectibles`, `activities`, `missable`, `online`)
- `/?q=meditate` — search, e.g. the missable trophy
- `/?open=28` — open the guide for trophy 28
- `/?spoilers=on` — hide story spoilers for unearned trophies
- Combine them, e.g. `/?demo=1&q=meditate&open=28`

## Files

- `app/index.html` — the single page
- `app/style.css` — dark Vice City palette, system fonts only, no images
- `app/app.js` — tracker logic (checklist, filters, search, spoiler mode, export/import, roadmap)
- `app/data/trophies.json` — all 55 trophies
- `app/data/roadmap.json` — the 5-stage roadmap
- `main.ts` — the hand-in program (copies `app/` and `screenshots/` and writes `dossier.json`)
- `screenshots/` — four captures of the running app

## Sources

- PowerPyx — GTA 6 Trophy Guide & Roadmap: https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/
- Planet GTA 6 — GTA 6 Trophies (list cross-checked with Exophase and PSNProfiles): https://www.planetgta6.com/en/gta-6-trophies/
- Sixshore — GTA 6 Trophy and Achievement List: https://sixshore.com/gta-6/guides/trophies-and-achievements/
- Output Lag — GTA 6 Trophy List: https://outputlag.com/guides/gta-6-trophy-list/
