import * as path from 'path';

import { WaldeDevServer } from '@/sdk/infra/dev/walde-dev-server';

function readApisDirFromArgs(argv: string[]): string {
  const flagIndex = argv.indexOf('--apis-dir');

  if (flagIndex === -1) {
    throw new Error('Missing required --apis-dir argument');
  }

  const value = argv[flagIndex + 1];
  if (!value) {
    throw new Error('Missing value for --apis-dir');
  }

  return path.resolve(value);
}

async function main(): Promise<void> {
  const apisDirectory = readApisDirFromArgs(process.argv.slice(2));
  const server = new WaldeDevServer({ apisDirectory });
  await server.start();
  console.log('Walde API server listening on http://localhost:3001');
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
