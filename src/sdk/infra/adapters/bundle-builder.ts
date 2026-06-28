import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import { createRequire } from 'module';
import os from 'os';
import path from 'path';

import { WaldeConfigurationError, WaldeSystemError } from '@/sdk/domain/errors';
import { BundleBuilderInput, CloudApiBundle, IBundleBuilder } from '@/sdk/domain/ports/out/bundle-builder';

function kebabToPascal(name: string): string {
  return name
    .split('-')
    .map(part => part.length > 0 ? part[0].toUpperCase() + part.slice(1) : '')
    .join('');
}

function hashHex(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function bundleHash(bundle: Uint8Array): string {
  return `sha256:${createHash('sha256').update(bundle).digest('hex')}`;
}

function escapePathForImport(filePath: string): string {
  return filePath.split(path.sep).join(path.posix.sep);
}

function resolveSdkNodeModulePath(fromFilePath: string): string {
  try {
    return createRequire(fromFilePath).resolve('@walde.ai/sdk/node');
  } catch {
    throw new WaldeConfigurationError(
      `Cannot resolve @walde.ai/sdk/node from ${fromFilePath}. ` +
      'Run the cloud package dependency install (e.g. `npm install` in dev/cloud) before pushing cloud APIs.',
      { filePath: fromFilePath }
    );
  }
}

export class BundleBuilder implements IBundleBuilder {
  async build(input: BundleBuilderInput): Promise<CloudApiBundle[]> {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'walde-cloud-api-'));
    try {
      const bundles: CloudApiBundle[] = [];
      for (const filePath of input.filePaths) {
        const parsed = path.parse(filePath);
        if (parsed.ext !== '.ts') {
          throw new WaldeSystemError('Cloud API file must be a .ts file', undefined, { filePath });
        }
        const name = parsed.name;
        const className = kebabToPascal(name);
        const lambdaName = `${input.siteId}-${hashHex(name).slice(0, 8)}`;

        const entryPath = path.join(tmpDir, `${name}.entry.ts`);
        const outPath = path.join(tmpDir, `${name}.bundle.js`);
        const importPath = escapePathForImport(path.relative(path.dirname(entryPath), filePath));
        const sdkNodeModulePath = escapePathForImport(resolveSdkNodeModulePath(filePath));
        const entrySource = [
          `import { ${className} } from '${importPath.startsWith('.') ? importPath : `./${importPath}`}';`,
          `import { WaldeApiHandler } from '${sdkNodeModulePath}';`,
          `const _api = new ${className}();`,
          `const _handler = new WaldeApiHandler(_api);`,
          'export const handler = async (event: unknown) => _handler.handle(event);',
          '',
        ].join('\n');
        await fs.writeFile(entryPath, entrySource, 'utf8');

        const { build } = await import('esbuild');
        await build({
          entryPoints: [entryPath],
          absWorkingDir: path.dirname(filePath),
          bundle: true,
          platform: 'node',
          format: 'cjs',
          target: 'node22',
          outfile: outPath,
          external: ['esbuild'],
        });

        const bundle = await fs.readFile(outPath);
        bundles.push({
          name,
          lambdaName,
          hash: bundleHash(bundle),
          bundle,
        });
      }
      return bundles;
      } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  }
}
