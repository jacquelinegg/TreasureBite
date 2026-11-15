/** Saved game state is an opaque JSON object owned by the game code. */
export type GameState = Record<string, unknown>;

export type InitResponse = {
  loggedIn: boolean;
  username: string | null;
  postId: string | null;
  state: GameState | null;
};

export type SaveStateRequest = { state: GameState };
export type SaveStateResponse = { ok: boolean };

export type ResultRequest = { day: string; res: 'win' | 'lose'; wrong: number; tz?: string };
export type ResultResponse = { counted: boolean; streak: number; rank: number | null; solvers: number };

export type BoardRow = { rank: number; name: string; wrong: number };
export type BoardResponse = {
  day: string;
  top: BoardRow[];
  me: BoardRow | null;
  solvers: number;
  streak: number;
  canShare: boolean;
};
export type ShareRequest = { tz?: string; maxLives: number };
export type ShareResponse = { ok: boolean; already?: boolean; message?: string };
