# Leonida Trophy Guide — GTA VI (PS5)

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/gaplek15/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/gaplek15/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI — 1 platinum, 2 gold, 6 silver, 46 bronze, 28 of them hidden until earned, 0 online.

## What it is

- **Every trophy, with its official name, description and grade** as PlayStation publishes them, and a guide in the author's own words for each one: what to do, where and how, and when it can be missed.
- **Sources beside every guide** — each trophy cites where its facts come from (PowerPyx's trophy guide and roadmap, and the official list as cross-checked by Planet GTA 6 with Exophase and PSNProfiles). No guide text is copied from another guide.
- **A roadmap to the platinum in five stages** — story, the 100% Completion Checklist, Strangers & Freaks and side questlines, money and collections, then odd jobs — with the one potentially missable trophy (Positive Mental Attitude, the Chapter 1 meditation) flagged in red.
- **A tracker**: tick trophies off, progress is saved in localStorage, export your progress to a file and import it back. Filters by kind (story, missable, collectibles, activities, online), by grade, and by search text, plus a spoiler setting that hides the names and descriptions of story trophies until you earn them.
- **Offline and original**: static files only, no network at runtime, no Rockstar logo, artwork or game screenshots. The look is its own — a dark Vice City palette.

## How to run

Any static server with `app/` at its root:

```sh
cd app
python3 -m http.server 8080
```

Then open http://localhost:8080 in desktop Chrome. Or serve the whole repository the same way and open `app/index.html`.

Useful preview links:

- `?view=roadmap` — open on the roadmap
- `?kind=collectibles` — open filtered to a kind
- `?open=28` — open with one trophy's guide expanded
- `?q=meditate` — open with the search box pre-filled (deep link to a trophy)
- `?spoilers=on` — spoiler mode on
- `?demo=1` — load a sample 12-trophy progress (only when nothing is saved yet)

## Files

- `app/index.html`, `app/style.css`, `app/app.js` — the guide and tracker
- `app/data/trophies.json` — the 55 trophies: official name, description, grade, hidden flag, kind, missable flag, tracked count, roadmap stage, guide, steps, sources
- `app/data/roadmap.json` — the five roadmap stages
- `main.ts` — hands the entry in: copies `app/` and `screenshots/` to `/output` and writes `dossier.json`
- `screenshots/` — 4 screenshots of the app (the first by name is the cover)

## Sources

- PowerPyx — GTA 6 Trophy Guide & Roadmap: https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/
- Planet GTA 6 — GTA 6 Trophies (official list cross-checked with Exophase and PSNProfiles): https://www.planetgta6.com/en/gta-6-trophies/
- Sixshore — GTA 6 Trophy and Achievement List: https://sixshore.com/gta-6/guides/trophies-and-achievements/
- Output Lag — GTA 6 Trophy List: https://outputlag.com/guides/gta-6-trophy-list/
