# Leonida Trophy Guide — GTA VI (PS5)

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/gaplek15/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/gaplek15/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI — 1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden, 0 online.

## What it is

- Every trophy with its official name, description and grade, plus a guide written in the author's own words — with steps and 2–3 named sources beside every guide.
- A 5-stage roadmap to the platinum (about 200 hours, difficulty 4/10, one playthrough), with the game's one missable trophy — Positive Mental Attitude — flagged in red wherever it appears.
- A tracker: tick trophies off in a checklist saved in localStorage, export or import your progress as JSON, filter by kind and grade, search by trophy, mission or place, and hide story spoilers.
- Fully offline and original: local data files only, no external scripts, images or fonts, and no Rockstar logo, artwork or game screenshots.

## How to run

```sh
cd app
python3 -m http.server 8080
```

Then open http://localhost:8080 in a browser.

Preview links:

- `/?view=roadmap` — jump straight to the roadmap
- `/?kind=story` — show story trophies only
- `/?open=28` — open the guide for trophy 28
- `/?q=meditate` — search for meditation spots
- `/?spoilers=on` — hide story spoilers
- `/?demo=1` — preview with 12 trophies already earned

## Files

- `app/index.html` — the single page
- `app/style.css` — dark Vice City palette, system fonts only
- `app/app.js` — the tracker logic (checklist, filters, roadmap, export/import)
- `app/data/trophies.json` — all 55 trophies with guides, steps and sources
- `app/data/roadmap.json` — the 5-stage roadmap to the platinum
- `main.ts` — the hand-in program (copies `app/` and `screenshots/` and writes `dossier.json`)
- `screenshots/` — 4 captures of the running app

## Sources

- PowerPyx — GTA 6 Trophy Guide & Roadmap: https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/
- Planet GTA 6 — GTA 6 Trophies: https://www.planetgta6.com/en/gta-6-trophies/
- Sixshore — GTA 6 Trophy and Achievement List: https://sixshore.com/gta-6/guides/trophies-and-achievements/
- Output Lag — GTA 6 Trophy List: https://outputlag.com/guides/gta-6-trophy-list/
