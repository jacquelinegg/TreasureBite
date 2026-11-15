import '@fontsource/press-start-2p';
import { telemetry } from '@devvit/analytics/client/reddit';
import type { BoardResponse, InitResponse, ResultRequest, ResultResponse, ShareResponse } from '../shared/api';

type JourneyBridge = {
  appReady: () => void;
  progress: (progress: number, action: string, actionDetails?: string) => void;
  interaction: (action: string, actionDetails?: string) => void;
  end: (complete: boolean, win: boolean, score: number) => void;
};

type Bridge = {
  state: Record<string, unknown> | null;
  user: string | null;
  save: (s: unknown) => void;
  report: (r: ResultRequest) => Promise<ResultResponse | null>;
  board: (tz: string) => Promise<BoardResponse | null>;
  share: (tz: string, maxLives: number) => Promise<ShareResponse | null>;
  journey: JourneyBridge;
};
declare global { interface Window { __PTH?: Bridge } }

const LS_KEY = 'pth1';
let serverSave = false;
let pending: unknown = null;
let timer: number | undefined;

function flush(): void {
  if (pending == null || !serverSave) return;
  const body = JSON.stringify({ state: pending });
  pending = null;
  fetch('/api/state', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {});
}

function save(state: unknown): void {
  try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch { /* sandboxed */ }
  pending = state;
  window.clearTimeout(timer);
  timer = window.setTimeout(flush, 500);
}

const inflight: Promise<unknown>[] = [];

async function api<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const r = await fetch(path, init);
    return r.ok ? ((await r.json()) as T) : null;
  } catch {
    return null;
  }
}

function report(r: ResultRequest): Promise<ResultResponse | null> {
  const p = api<ResultResponse>('/api/result', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(r) });
  inflight.push(p);
  return p;
}

async function board(tz: string): Promise<BoardResponse | null> {
  await Promise.allSettled(inflight); // make sure today's result is stored first
  return api<BoardResponse>(`/api/leaderboard?tz=${encodeURIComponent(tz)}`);
}

const share = (tz: string, maxLives: number): Promise<ShareResponse | null> =>
  api<ShareResponse>('/api/share', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tz, maxLives }) });

function trackJourney(event: () => Promise<unknown>): void {
  void event().catch((error: unknown) => console.warn('Journey event failed.', error));
}

const journey: JourneyBridge = {
  appReady: () => trackJourney(() => telemetry.appReady()),
  progress: (progress, action, actionDetails) => {
    if (!telemetry.getActiveJourneyId()) return;
    trackJourney(() => telemetry.progress({ progress, action, actionDetails }));
  },
  interaction: (action, actionDetails) => {
    if (!telemetry.getActiveJourneyId()) return;
    trackJourney(() => telemetry.interaction({ action, actionDetails }));
  },
  end: (complete, win, score) => {
    if (!telemetry.getActiveJourneyId()) return;
    trackJourney(() => telemetry.endJourney({ complete, game: { win, score } }));
  },
};

async function start(): Promise<void> {
  let state: Record<string, unknown> | null = null;
  let user: string | null = null;
  try {
    const r = await fetch('/api/init');
    if (r.ok) {
      const j = (await r.json()) as InitResponse;
      serverSave = j.loggedIn;
      user = j.username;
      state = j.state;
    }
  } catch { /* offline / standalone preview */ }
  if (!state) {
    try { const raw = localStorage.getItem(LS_KEY); if (raw) state = JSON.parse(raw); } catch { /* ignore */ }
  }
  window.__PTH = { state, user, save, report, board, share, journey };
  const s = document.createElement('script');
  s.src = './game-core.js';
  document.body.append(s);
}

document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });
window.addEventListener('pagehide', flush);
void start();
