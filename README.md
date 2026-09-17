# Federico’s Ciabatta

An illustrated browser game set in an Italian deli. Prepare ciabatta sandwiches, manage ingredients, and serve customers before their patience runs out.

**[Play the game](https://federicos-ciabatta.netlify.app)**

## Features

- A shared Supabase top-ten leaderboard with optional nickname submission.
- Seven illustrated customers with distinct personalities.
- Progressively larger recipes and up to two simultaneous orders.
- Shared ingredient inventory and timed refills.
- A complimentary kombucha bonus for fast, accurate service.
- Background music and procedural sound effects with a single audio toggle.
- Responsive desktop and mobile layouts with a Hebrew, right-to-left interface.

## Run locally

Serve the game with Python 3:

```sh
python3 -m http.server 4188 --bind 127.0.0.1 --directory dist
```

Open [localhost:4188](http://localhost:4188) in your browser. No package installation or build step is required. Use an HTTP server rather than opening the HTML file directly, as the game uses JavaScript modules.

## Run tests

With Node.js installed:

```sh
node --test tests/*.test.mjs
```

The engine tests cover recipes, inventory, scoring, refill timing, customer rotation, and simultaneous orders.

## Project structure

| Path | Purpose |
| --- | --- |
| `dist/index.html` | Scene markup and game interface |
| `dist/style.css` | Layout, responsive styling, and animation |
| `dist/game.js` | Browser interactions and rendering |
| `dist/engine.mjs` | Game state and rules |
| `dist/customers.mjs` | Customer definitions and dialogue |
| `dist/sound.mjs` | Procedural sound effects |
| `dist/assets/` | Runtime illustrations and background music |
| `tests/` | Game engine tests |
| `netlify.toml` | Static hosting configuration |

`dist/` contains the hand-authored source. It is not generated build output.

## Leaderboard

At the end of a round, players can submit a nickname. The score and completed-order count come directly from the game state. Results are stored in Supabase and shared across devices. See [database setup and security notes](supabase/README.md) for migrations, access rules, and validation limits.

## Deployment

Publish `dist/` as a static site. The included Netlify configuration sets this as the publish directory; no build command is needed.

## Contributing

Bug reports and improvement proposals are welcome through GitHub Issues and pull requests. Include steps to reproduce bugs and relevant screenshots for visual changes. Check affected desktop and mobile flows, and run the engine tests when changing gameplay logic.

## Rights

This repository is public, but no general reuse license has been granted for its code, illustrations, or music. Original reference photographs and private working materials are not included.
