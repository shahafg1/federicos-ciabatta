# Leaderboard database

Apply the SQL files in `migrations/` in filename order to a dedicated Supabase project. Configure the project URL and **publishable** key in `dist/leaderboard.mjs`. Never add a secret/service-role key to the browser or repository.

The game calls three database functions through Supabase's REST API:

- `start_game`: records a UUID run token and server start time; limits starts to 10 per minute per daily hashed forwarded address.
- `submit_score`: validates the name, score bounds, completed orders and elapsed time, then saves one result per run. Retries return the existing result ID.
- `get_leaderboard`: returns only the ten highest results, sorted by score and then submission time and ID.

Both tables have RLS enabled and no direct access for browser roles. The narrowly scoped functions use fixed empty search paths and explicit grants. Run tokens and rate-limit hashes are not returned by the leaderboard.

Scores come from the game state, not an editable input. These checks discourage obvious invalid submissions; they are not authoritative server-side gameplay verification. A determined client can still submit a plausible fabricated result. Rate limiting is best-effort and depends on the gateway's forwarded address. Players do not need an account.

Player names and scores are public. The interface recommends nicknames. Score dates and completed-order counts are also stored. Abandoned runs and daily address hashes remain in `game_runs`; administrators can periodically delete runs older than 24 hours that are not referenced by a score. Never delete runs referenced by valid scores.

Deployment is manual: publish the static `dist/` folder to Netlify. Database migrations are applied separately; pushing to GitHub does not apply them.
