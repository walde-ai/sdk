import * as http from 'http';
import * as path from 'path';
import * as fs from 'fs/promises';
import { pathToFileURL } from 'url';

import { WaldeApi } from '@/sdk/domain/entities/api';

const API_PORT = 3001;
const API_ROUTE_PREFIX = '/_walde/api/';

interface WaldeDevServerResponse {
  payload: unknown;
  metadata: Record<string, unknown>;
}

type WaldeApiConstructor = new () => WaldeApi<unknown, unknown>;

export interface WaldeDevServerParams {
  apisDirectory: string;
}

export class WaldeDevServer {
  private readonly routes: Map<string, WaldeApiConstructor>;

  constructor(private readonly params: WaldeDevServerParams) {
    this.routes = new Map<string, WaldeApiConstructor>();
  }

  async start(): Promise<void> {
    await this.loadRoutes();

    const server = http.createServer(async (request, response) => {
      await this.handleRequest(request, response);
    });

    await new Promise<void>((resolve, reject) => {
      server.once('error', reject);
      server.listen(API_PORT, () => {
        resolve();
      });
    });
  }

  private async loadRoutes(): Promise<void> {
    const entries = await fs.readdir(this.params.apisDirectory, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isFile()) {
        continue;
      }
      if (!entry.name.endsWith('.ts')) {
        continue;
      }
      if (entry.name === 'index.ts') {
        continue;
      }

      const routeName = entry.name.replace(/\.ts$/, '');
      const filePath = path.join(this.params.apisDirectory, entry.name);
      const moduleUrl = pathToFileURL(filePath).href;
      const loadedModule = await import(moduleUrl);
      const maybeConstructor = this.pickApiConstructor(loadedModule);

      if (maybeConstructor) {
        this.routes.set(routeName, maybeConstructor);
      }
    }
  }

  private pickApiConstructor(module: Record<string, unknown>): WaldeApiConstructor | undefined {
    for (const exportedValue of Object.values(module)) {
      if (typeof exportedValue !== 'function') {
        continue;
      }

      const prototype = (exportedValue as { prototype?: unknown }).prototype;
      if (!prototype) {
        continue;
      }

      if (Object.prototype.isPrototypeOf.call(WaldeApi.prototype, prototype)) {
        return exportedValue as WaldeApiConstructor;
      }
    }

    return undefined;
  }

  private async handleRequest(request: http.IncomingMessage, response: http.ServerResponse): Promise<void> {
    const requestPath = request.url ?? '/';
    const routeMatch = requestPath.match(/^\/_walde\/api\/([a-z0-9-]+)$/);
    const method = request.method ?? 'GET';

    if (!routeMatch) {
      this.writeJsonResponse(response, 404, {
        payload: {},
        metadata: { error: 'Not found' },
      });
      this.logRequest(requestPath, 404);
      return;
    }

    const routeKey = routeMatch[1];
    const handlerConstructor = this.routes.get(routeKey);

    if (!handlerConstructor) {
      this.writeJsonResponse(response, 404, {
        payload: {},
        metadata: { error: 'Not found' },
      });
      this.logRequest(requestPath, 404);
      return;
    }

    let input: unknown | undefined;

    if (method === 'GET') {
      input = undefined;
    } else if (method === 'POST') {
      try {
        input = await this.readJsonBody(request);
      } catch {
        this.writeJsonResponse(response, 400, {
          payload: {},
          metadata: { error: 'Invalid JSON body' },
        });
        this.logRequest(requestPath, 400);
        return;
      }
    } else {
      this.writeJsonResponse(response, 404, {
        payload: {},
        metadata: { error: 'Not found' },
      });
      this.logRequest(requestPath, 404);
      return;
    }

    try {
      const handler = new handlerConstructor();
      const output = await handler.handler(input as never);

      this.writeJsonResponse(response, 200, {
        payload: output,
        metadata: {},
      });
      this.logRequest(requestPath, 200);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error';
      this.writeJsonResponse(response, 500, {
        payload: {},
        metadata: { error: message },
      });
      this.logRequest(requestPath, 500);
    }
  }

  private async readJsonBody(request: http.IncomingMessage): Promise<unknown | undefined> {
    const chunks: Uint8Array[] = [];

    await new Promise<void>((resolve, reject) => {
      request.on('data', (chunk: Uint8Array) => {
        chunks.push(chunk);
      });
      request.once('end', () => {
        resolve();
      });
      request.once('error', (error) => {
        reject(error);
      });
    });

    if (chunks.length === 0) {
      return undefined;
    }

    const raw = Buffer.concat(chunks).toString('utf8');
    if (raw.trim().length === 0) {
      return undefined;
    }

    return JSON.parse(raw);
  }

  private writeJsonResponse(
    response: http.ServerResponse,
    statusCode: number,
    body: WaldeDevServerResponse
  ): void {
    response.statusCode = statusCode;
    response.setHeader('Content-Type', 'application/json');
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.end(JSON.stringify(body));
  }

  private logRequest(pathname: string, statusCode: number): void {
    console.log(`${pathname} -> ${statusCode}`);
  }
}
