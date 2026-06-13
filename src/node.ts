// Node.js exports (includes admin functionality)
export { MakeWalde } from './sdk/make-walde';
export { MakeWaldeAdmin } from './sdk/make-walde-admin';
export { MakeWaldeWorkspace } from './sdk/make-walde-workspace';
export { WaldeDevServer } from './sdk/infra/dev/walde-dev-server';
export type { WaldeConfig } from './sdk/make-walde';
export type { WaldeAdminConfig } from './sdk/make-walde-admin';

// WebSocket node adapter
export { NodeWebSocketClientFactory } from './sdk/infra/adapters/node-web-socket-client-factory';
export type { IWebSocketClientFactory } from './sdk/domain/ports/in/web-socket-client-factory';
export type { IWebSocketClient } from './sdk/domain/ports/in/web-socket-client';

// Re-export everything from SDK for Node.js
export * from './sdk';

// Node-only Cloud API Handlers
export { WaldeApiHandler } from './sdk/infra/lambda/walde-api-handler';
export type { LambdaProxyResult } from './sdk/infra/lambda/walde-api-handler';

// Re-export STD utilities
export * from './std';
