import '@fontsource/press-start-2p';
import { telemetry } from '@devvit/analytics/client/reddit';
import { requestExpandedMode } from '@devvit/web/client';
import type { InitResponse } from '../shared/api';

const $ = (id: string) => document.getElementById(id) as HTMLElement;

const INTRO_KEY = 'pth_intro_count';
let introCount = 0;
try {
  const storedCount = Number(localStorage.getItem(INTRO_KEY));
  if (Number.isFinite(storedCount)) introCount = Math.max(0, Math.floor(storedCount));
} catch { /* local storage may be unavailable in the embedded browser */ }

if (introCount >= 3) {
  $('how').hidden = true;
  $('description').hidden = true;
}

$('date').textContent = new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());
$('play').addEventListener('click', (e) => {
  if (introCount < 3) {
    introCount += 1;
    try { localStorage.setItem(INTRO_KEY, String(introCount)); } catch { /* local storage may be unavailable in the embedded browser */ }
  }
  void telemetry.startJourney().catch((error: unknown) => console.warn('Journey start failed.', error));
  requestExpandedMode(e, 'game');
});

fetch('/api/init')
  .then((r) => (r.ok ? (r.json() as Promise<InitResponse>) : null))
  .then((j) => {
    if (!j?.username) return;
    const coins = Number((j.state as { coins?: number } | null)?.coins);
    $('hi').textContent = `u/${j.username}` + (Number.isFinite(coins) ? ` \u00b7 ${coins} coins` : '');
  })
  .catch(() => {});
