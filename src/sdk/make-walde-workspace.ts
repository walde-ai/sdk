import { FileSystemScaffoldingRepo } from './infra/adapters/filesystem/file-system-scaffolding-repo';
import { WaldeWorkspaceFuture } from './infra/futures/walde-workspace-future';

/**
 * Creates a WaldeWorkspaceFuture wired with a FileSystemScaffoldingRepo.
 *
 * Requires no credentials — scaffolding is a local, unauthenticated operation.
 * Exported from src/node.ts only; not available in browser contexts because
 * FileSystemScaffoldingRepo depends on Node.js built-ins.
 */
export function MakeWaldeWorkspace(): WaldeWorkspaceFuture {
  const scaffoldingRepo = new FileSystemScaffoldingRepo();
  return new WaldeWorkspaceFuture(scaffoldingRepo);
}
