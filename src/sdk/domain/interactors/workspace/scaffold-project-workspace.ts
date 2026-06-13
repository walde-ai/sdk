import * as path from 'path';

import { IScaffoldingRepo } from '@/sdk/domain/ports/out/scaffolding-repo';
import { EnsureApiRegistry } from '@/sdk/domain/interactors/workspace/ensure-api-registry';
import { Result, ok, err } from '@/std';

const CLOUD_TSCONFIG_CONTENT = JSON.stringify(
  {
    compilerOptions: {
      target: 'ES2020',
      module: 'CommonJS',
      lib: ['ES2020'],
      strict: true,
      noEmitOnError: true,
      outDir: 'dist',
    },
    include: ['./src/**/*.ts'],
  },
  null,
  2
);

const CLOUD_PACKAGE_JSON_CONTENT = JSON.stringify(
  {
    name: 'cloud',
    version: '0.1.0',
    private: true,
    dependencies: {
      '@walde.ai/sdk': '0.0.5',
    },
    devDependencies: {
      tsx: '^4.20.3',
      typescript: '^5.0.0',
    },
  },
  null,
  2
);

function buildUiTsConfigContent(): string {
  return JSON.stringify(
    {
      compilerOptions: {
        target: 'ES2020',
        useDefineForClassFields: true,
        module: 'ESNext',
        lib: ['ES2020', 'DOM', 'DOM.Iterable'],
        skipLibCheck: true,
        moduleResolution: 'bundler',
        allowImportingTsExtensions: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        jsx: 'preserve',
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noFallthroughCasesInSwitch: true,
        typeRoots: ['./types', './node_modules/@types'],
        types: ['walde-cloud-api'],
      },
      include: ['./src/**/*.ts', './src/**/*.tsx', './src/**/*.vue'],
      references: [{ path: './tsconfig.node.json' }],
    },
    null,
    2
  );
}

function buildUiPackageJsonContent(): string {
  return JSON.stringify(
    {
      name: 'walde-project',
      version: '0.1.0',
      private: true,
      scripts: {
        dev: 'vite',
        build: 'vue-tsc && vite build',
      },
      dependencies: {
        vue: '3.5.34',
        '@walde.ai/sdk': '0.0.5',
      },
      devDependencies: {
        vite: '8.0.12',
        '@vitejs/plugin-vue': '6.0.6',
        typescript: '6.0.3',
        'vue-tsc': '^3.1.5',
      },
    },
    null,
    2
  );
}

function buildUiIndexHtmlContent(): string {
  return [
    '<!DOCTYPE html>',
    '<html lang="en">',
    '<head>',
    '  <meta charset="UTF-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
    '  <title>Walde Project</title>',
    '</head>',
    '<body>',
    '  <div id="app"></div>',
    '  <script type="module" src="/src/main.ts"></script>',
    '</body>',
    '</html>',
    '',
  ].join('\n');
}

function buildUiViteConfigContent(): string {
  return [
    "import { defineConfig } from 'vite';",
    "import vue from '@vitejs/plugin-vue';",
    '',
    'export default defineConfig({',
    '  plugins: [vue()],',
    '  server: {',
    '    proxy: {',
    "      '^/_walde/api': {",
    "        target: 'http://localhost:3001',",
    '        changeOrigin: true,',
    '      },',
    '    },',
    '  },',
    '});',
    '',
  ].join('\n');
}

function buildUiMainTsContent(): string {
  return [
    "import { createApp } from 'vue';",
    "import App from './App.vue';",
    '',
    'const app = createApp(App);',
    "app.mount('#app');",
    '',
  ].join('\n');
}

function buildUiAppVueContent(): string {
  return [
    '<template>',
    '  <div id="app"></div>',
    '</template>',
    '',
  ].join('\n');
}

function buildUiEnvDtsContent(): string {
  return [
    '/// <reference types="vite/client" />',
    '',
  ].join('\n');
}

function buildGitignoreContent(): string {
  return [
    'node_modules/',
    'dist/',
    '',
  ].join('\n');
}

export interface ScaffoldProjectWorkspaceParams {
  targetPath: string;
}

/**
 * Creates the full `dev/` directory tree under the project root and calls
 * EnsureApiRegistry to initialise both registry files.
 *
 * Invoked by InitWorkspace after writing walde.json so that `walde init`
 * produces a ready-to-use project scaffold in one step.
 */
export class ScaffoldProjectWorkspace {
  private readonly ensureApiRegistry: EnsureApiRegistry;

  constructor(private readonly scaffoldingRepo: IScaffoldingRepo) {
    this.ensureApiRegistry = new EnsureApiRegistry(scaffoldingRepo);
  }

  async execute(params: ScaffoldProjectWorkspaceParams): Promise<Result<void, string>> {
    try {
      const dirs = [
        'dev/cloud/src/apis',
        'dev/cloud/src/contracts',
        'dev/cloud/src/domain',
        'dev/cloud/src/infra',
        'dev/ui/src',
        'dev/ui/types',
        'content/content',
        'content/assets',
      ];

      for (const dir of dirs) {
        await this.scaffoldingRepo.createDirectory(path.join(params.targetPath, dir));
      }

      await this.scaffoldingRepo.writeFile(
        path.join(params.targetPath, 'dev/cloud/tsconfig.json'),
        CLOUD_TSCONFIG_CONTENT
      );

      await this.scaffoldingRepo.writeFile(
        path.join(params.targetPath, 'dev/ui/tsconfig.json'),
        buildUiTsConfigContent()
      );

      await this.scaffoldingRepo.writeFile(
        path.join(params.targetPath, 'dev/ui/package.json'),
        buildUiPackageJsonContent()
      );

      await this.scaffoldingRepo.writeFile(
        path.join(params.targetPath, 'dev/ui/index.html'),
        buildUiIndexHtmlContent()
      );

      await this.scaffoldingRepo.writeFile(
        path.join(params.targetPath, 'dev/ui/vite.config.ts'),
        buildUiViteConfigContent()
      );

      await this.scaffoldingRepo.writeFile(
        path.join(params.targetPath, 'dev/ui/src/main.ts'),
        buildUiMainTsContent()
      );

      await this.scaffoldingRepo.writeFile(
        path.join(params.targetPath, 'dev/ui/src/App.vue'),
        buildUiAppVueContent()
      );

      await this.scaffoldingRepo.writeFile(
        path.join(params.targetPath, 'dev/ui/src/env.d.ts'),
        buildUiEnvDtsContent()
      );

      await this.scaffoldingRepo.writeFile(
        path.join(params.targetPath, 'dev/cloud/package.json'),
        CLOUD_PACKAGE_JSON_CONTENT
      );

      await this.scaffoldingRepo.writeFile(
        path.join(params.targetPath, '.gitignore'),
        buildGitignoreContent()
      );

      const registryResult = await this.ensureApiRegistry.execute({ targetPath: params.targetPath });
      if (registryResult.isErr()) {
        return err(registryResult.unwrapErr());
      }

      return ok(undefined);
    } catch (error) {
      return err(error instanceof Error ? error.message : 'Failed to scaffold project workspace');
    }
  }
}
