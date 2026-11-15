import { context, reddit } from '@devvit/web/server';

export async function createGamePost(title = 'TreasureBite: find today\u2019s word') {
  const { subredditName } = context;
  if (!subredditName) throw new Error('subredditName is required');
  return reddit.submitCustomPost({
    subredditName,
    title,
    entry: 'default',
  });
}
