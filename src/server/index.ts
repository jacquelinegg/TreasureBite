import express from 'express';
import { createTelemetryRouter } from '@devvit/analytics/server/reddit';
import { context, createServer, getServerPort, reddit, redis } from '@devvit/web/server';
import type { BoardResponse, BoardRow, InitResponse, ResultRequest, ResultResponse, SaveStateRequest, SaveStateResponse, ShareRequest, ShareResponse } from '../shared/api';
import { createGamePost } from './post';
import { bumpStreak, gameDay, liveStreak, prettyDay, scoreFor, secondsIntoDay, validTz, wrongFromScore, type StreakRec } from './daily';

const MAX_STATE_BYTES = 200_000;
const MAX_LIVES = 11;
const stateKey = (userId: string) => `pth:state:${userId}`;
const boardKey = (day: string) => `pth:board:${day}`;
const streakKey = (userId: string) => `pth:streak:${userId}`;
const sharedKey = (day: string, userId: string) => `pth:shared:${day}:${userId}`;
const TWO_WEEKS = 14 * 24 * 3600;

async function readStreak(userId: string): Promise<StreakRec | null> {
  const raw = await redis.get(streakKey(userId));
  if (!raw) return null;
  try { return JSON.parse(raw) as StreakRec; } catch { return null; }
}

const app = express();
app.use(express.json({ limit: '256kb' }));
const router = express.Router();

// ---- client API -------------------------------------------------------

router.get('/api/init', async (_req, res) => {
  const empty: InitResponse = { loggedIn: false, username: null, postId: context.postId ?? null, state: null };
  try {
    const { userId } = context;
    if (!userId) return res.json(empty);
    const [username, raw] = await Promise.all([reddit.getCurrentUsername(), redis.get(stateKey(userId))]);
    let state = null;
    if (raw) {
      try { state = JSON.parse(raw); } catch { state = null; }
    }
    const body: InitResponse = { loggedIn: true, username: username ?? null, postId: context.postId ?? null, state };
    res.json(body);
  } catch (err) {
    console.error('init failed', err);
    res.status(500).json(empty);
  }
});

router.post('/api/state', async (req, res) => {
  try {
    const { userId } = context;
    if (!userId) return res.status(401).json({ ok: false } satisfies SaveStateResponse);
    const { state } = (req.body ?? {}) as Partial<SaveStateRequest>;
    if (!state || typeof state !== 'object' || Array.isArray(state)) {
      return res.status(400).json({ ok: false } satisfies SaveStateResponse);
    }
    const json = JSON.stringify(state);
    if (json.length > MAX_STATE_BYTES) return res.status(413).json({ ok: false } satisfies SaveStateResponse);
    await redis.set(stateKey(userId), json);
    res.json({ ok: true } satisfies SaveStateResponse);
  } catch (err) {
    console.error('save failed', err);
    res.status(500).json({ ok: false } satisfies SaveStateResponse);
  }
});


// ---- daily result, leaderboard, sharing --------------------------------

router.post('/api/result', async (req, res) => {
  const none: ResultResponse = { counted: false, streak: 0, rank: null, solvers: 0 };
  try {
    const { userId } = context;
    const username = await reddit.getCurrentUsername();
    const { day, res: result, wrong, tz: rawTz } = (req.body ?? {}) as Partial<ResultRequest>;
    const tz = validTz(rawTz);
    const today = gameDay(tz);
    if (!userId || !username || day !== today || (result !== 'win' && result !== 'lose')) return res.json(none);
    const w = Math.max(0, Math.min(MAX_LIVES, Math.floor(Number(wrong) || 0)));
    const key = boardKey(today);
    const rec = await readStreak(userId);

    if (result === 'lose') {
      return res.json({ ...none, streak: liveStreak(rec, today), solvers: await redis.zCard(key) });
    }
    // Only the first win of the day counts.
    const existing = await redis.zScore(key, username);
    let counted = false;
    let next = rec;
    if (existing === undefined) {
      await redis.zAdd(key, { member: username, score: scoreFor(w, secondsIntoDay(tz)) });
      await redis.expire(key, TWO_WEEKS);
      next = bumpStreak(rec, today);
      await redis.set(streakKey(userId), JSON.stringify(next));
      counted = true;
    }
    const [solvers, asc] = await Promise.all([redis.zCard(key), redis.zRank(key, username)]);
    const out: ResultResponse = { counted, streak: liveStreak(next, today), rank: asc === undefined ? null : solvers - asc, solvers };
    res.json(out);
  } catch (err) {
    console.error('result failed', err);
    res.status(500).json(none);
  }
});

router.get('/api/leaderboard', async (req, res) => {
  const day = gameDay(validTz(req.query.tz));
  const empty: BoardResponse = { day, top: [], me: null, solvers: 0, streak: 0, canShare: false };
  try {
    const { userId } = context;
    const username = await reddit.getCurrentUsername();
    const key = boardKey(day);
    const [rows, solvers, rec] = await Promise.all([
      redis.zRange(key, 0, 4, { by: 'rank', reverse: true }),
      redis.zCard(key),
      userId ? readStreak(userId) : Promise.resolve(null),
    ]);
    const top: BoardRow[] = rows.map((r, i) => ({ rank: i + 1, name: r.member, wrong: wrongFromScore(r.score) }));
    let me: BoardRow | null = null;
    if (username) {
      const [score, asc] = await Promise.all([redis.zScore(key, username), redis.zRank(key, username)]);
      if (score !== undefined && asc !== undefined) me = { rank: solvers - asc, name: username, wrong: wrongFromScore(score) };
    }
    const shared = userId ? await redis.get(sharedKey(day, userId)) : null;
    res.json({ day, top, me, solvers, streak: liveStreak(rec, day), canShare: !!me && !shared && !!context.postId } satisfies BoardResponse);
  } catch (err) {
    console.error('leaderboard failed', err);
    res.status(500).json(empty);
  }
});

// The player presses "Share" themselves; the comment never contains the answer.
router.post('/api/share', async (req, res) => {
  try {
    const { userId, postId, subredditName } = context;
    const username = await reddit.getCurrentUsername();
    const { tz: rawTz, maxLives: rawMaxLives } = (req.body ?? {}) as Partial<ShareRequest>;
    const day = gameDay(validTz(rawTz));
    if (!userId || !username || !postId) return res.status(400).json({ ok: false } satisfies ShareResponse);
    const score = await redis.zScore(boardKey(day), username);
    if (score === undefined) return res.status(403).json({ ok: false, message: 'Solve today first.' } satisfies ShareResponse);
    if (await redis.get(sharedKey(day, userId))) return res.json({ ok: true, already: true } satisfies ShareResponse);

    const maxLives = Math.max(6, Math.min(MAX_LIVES, Math.floor(Number(rawMaxLives) || 6)));
    const lives = maxLives - Math.min(maxLives, wrongFromScore(score));
    const streak = liveStreak(await readStreak(userId), day);
    const text = `Dug up today's treasure with ${lives} of ${maxLives} lives left. Streak: ${streak} ${streak === 1 ? 'day' : 'days'}. Can you beat it?`;
    await reddit.submitComment({ id: postId as `t3_${string}`, text, runAs: 'USER' });
    await redis.set(sharedKey(day, userId), '1');
    await redis.expire(sharedKey(day, userId), TWO_WEEKS);

    // Best effort: needs flair permission in the subreddit.
    try {
      await reddit.setUserFlair({ subredditName, username, text: `Treasure hunter \u00b7 ${streak}d streak` });
    } catch (e) {
      console.warn('flair skipped', e);
    }
    res.json({ ok: true } satisfies ShareResponse);
  } catch (err) {
    console.error('share failed', err);
    res.status(500).json({ ok: false, message: 'Could not post the comment.' } satisfies ShareResponse);
  }
});

// ---- internal (menu / triggers) ---------------------------------------

router.post('/internal/on-app-install', async (_req, res) => {
  try {
    const post = await createGamePost();
    res.json({ status: 'success', message: `Created post ${post.id}` });
  } catch (err) {
    console.error('install post failed', err);
    res.status(400).json({ status: 'error', message: 'Failed to create post' });
  }
});

router.post('/internal/menu/post-create', async (_req, res) => {
  try {
    const post = await createGamePost();
    res.json({ navigateTo: `https://reddit.com/r/${context.subredditName}/comments/${post.id}` });
  } catch (err) {
    console.error('menu post failed', err);
    res.status(400).json({ showToast: 'Failed to create post' });
  }
});

router.post('/internal/scheduler/daily-post', async (_req, res) => {
  try {
    const day = gameDay();
    const k = `pth:dailypost:${day}`;
    if (await redis.get(k)) return res.json({ status: 'success', message: 'Already posted today' });
    const post = await createGamePost(`Pixel Treasure Hunt \u00b7 ${prettyDay()}`);
    await redis.set(k, post.id);
    await redis.expire(k, 3 * 24 * 3600);
    res.json({ status: 'success', message: `Created ${post.id}` });
  } catch (err) {
    console.error('daily post failed', err);
    res.status(500).json({ status: 'error' });
  }
});

app.use(createTelemetryRouter());
app.use(router);

const server = createServer(app);
server.on('error', (err) => console.error(`server error: ${err.stack}`));
server.listen(getServerPort());
