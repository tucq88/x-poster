// Legacy index file - the main CLI is now in cli.ts
// This file is kept for backwards compatibility

export { XBot } from './bot';
export { TwitterClient } from './twitter-client';
export { getTwitterConfig } from './config';

// If run directly, show a message pointing to the CLI
if (require.main === module) {
  console.log('🤖 X Poster Bot');
  console.log('');
  console.log('To use the interactive CLI, run:');
  console.log('  npm run dev');
  console.log('  or');
  console.log('  npm start (after building)');
  console.log('');
  console.log('For programmatic usage, import the XBot class:');
  console.log('  import { XBot } from "./bot";');
  console.log('');
}
