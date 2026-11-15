# TreasureBite

TreasureBite is a daily pixel-art exploration game built with Devvit Web. Explore a procedurally arranged map, dig up letters, avoid traps, and guess the hidden word. A new daily challenge gives players a reason to return, while a collection, streaks, and a leaderboard track longer-term progress.

## Features

- **Daily word hunt:** Move around the map and dig beside objects to reveal letters, collect coins, or uncover traps.
- **Word guesses and hints:** Guess the word at any time. Hints cost in-game coins and mark a hidden letter on the map.
- **Collection and special mission:** Keep discovered pixel-art treasures in the album. Finding all 49 regular treasures unlocks the special 50th mission.
- **Progression:** Earn coins and experience, unlock cosmetics, and complete daily map challenges.
- **Daily leaderboard and streaks:** The first win for a player's local game day counts toward the leaderboard and streak.
- **Community sharing:** After solving the daily challenge, a player can choose to share a spoiler-free result comment on the game post.
- **Responsive interface:** Supports portrait and landscape layouts, including mobile play.
- **Devvit Journeys:** Tracks app readiness, journey start, selected gameplay milestones and interactions, and journey completion.

## Requirements

- Node.js supported by the installed Devvit toolchain (the server build targets Node.js 22).
- npm.
- A Reddit account with access to a subreddit where you can install and playtest the app.
- Devvit CLI access. The project includes the CLI as a development dependency.

## Local setup and playtesting

1. Clone the repository and install dependencies:

   ```sh
   npm install
   ```

2. Authenticate with Devvit:

   ```sh
   npx devvit login
   ```

3. Check types and build the client and server bundles:

   ```sh
   npm run type-check
   npm run build
   ```

4. Start a Devvit playtest:

   ```sh
   npm run dev
   ```

   Follow the CLI prompts to select a subreddit. The configured development subreddit in `devvit.json` is `treasurebite_dev`; update it if you use a different test community.

5. In the test subreddit, install the app if needed and create a game post using the moderator menu item **New TreasureBite post**. The app also creates an initial post when installed.

To upload a new app version to Devvit, run:

```sh
npm run upload
```

Uploading makes the app available for playtesting; it does not publish the app to the public app directory.

## How the game works

Players start from a compact post view and select **Play** to open the full game. On the map, move or drag to explore. Stand next to an object to dig it up:

- Letter finds reveal clues for the hidden word.
- Coins award in-game currency.
- Traps and incorrect guesses cost lives.
- A correct guess completes the challenge; running out of lives ends it.

Daily progress is based on the player's device time zone. Invalid or unavailable time zones fall back to UTC on the server. The shared daily post uses `Europe/Sofia` for its date and title. The `daily-post` scheduler is configured with the cron expression `5 22 * * *` in `devvit.json`.

The leaderboard orders daily winners by fewer wrong guesses and then by completion time. Only the first win per player per game day is counted. A player can opt in to posting a spoiler-free result comment; posting is performed on that explicit action.

## Devvit Journeys

The app uses `@devvit/analytics` with the Journeys permission enabled in `devvit.json`. The telemetry router is mounted at `/api/telemetry`.

The current client instrumentation records:

| Event | Trigger |
| --- | --- |
| `App.Ready` | The interactive game has rendered. |
| `Journey.Start` | The player explicitly selects **Play**. |
| `Journey.Progress` | The first map dig and the first letter found. |
| `Journey.Interaction` | A hint is used or a word guess is submitted (only whether it was correct is included). |
| `Journey.End` | The game ends in a win or loss, or the player leaves the page. |

Custom event fields use fixed labels and do not include the guessed word or other user-entered text. Platform telemetry may be denied or dropped until Reddit has reviewed and allowlisted the app's journey map. Uploading the app alone does not guarantee that events will appear in analytics.

## Data and services

- Redis stores the signed-in player's game state, daily leaderboard scores, streak records, and daily post/share markers.
- The client keeps a local copy of game state for standalone/offline preview; signed-in state is synchronized with the server.
- Devvit supplies Reddit account, post, and subreddit context to server endpoints.
- The server exposes game APIs under `/api/` and Devvit lifecycle/menu/scheduler handlers under `/internal/`.

## Project layout

```text
src/
  client/
    splash.html, splash.ts       Compact post entry and Play action
    game.html, boot.ts           Game entry, client bridge, and state loading
    public/game-core.js          Game mechanics, rendering, and UI
    vite.config.ts               Client build configuration
  server/
    index.ts                     Express APIs, Redis access, and telemetry router
    daily.ts                     Daily dates, time zones, scores, and streaks
    post.ts                      Game post creation
    vite.config.ts               Server build configuration
  shared/api.ts                  Client/server API types
devvit.json                      Devvit app, permissions, menu, and scheduler
```

## npm scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start a Devvit playtest. |
| `npm run build` | Build the client and server bundles into `dist/`. |
| `npm run type-check` | Type-check client and server TypeScript projects. |
| `npm run upload` | Build and upload the app to Devvit. |

## License

This project is distributed under the MIT License. See [LICENSE](./LICENSE).
