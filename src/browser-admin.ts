// Browser admin entry point
export { BrowserWebSocketClientFactory } from './sdk/infra/adapters/browser-web-socket-client-factory';
export type { IWebSocketClientFactory } from './sdk/domain/ports/in/web-socket-client-factory';
export type { IWebSocketClient } from './sdk/domain/ports/in/web-socket-client';

export { MakeWaldeAdmin } from './sdk/make-walde-admin-browser';
export type { WaldeAdminBrowserConfigInput } from './sdk/make-walde-admin-browser';
export { WaldeAdminBrowser as WaldeAdmin } from './sdk/infra/futures/walde-admin-browser';
export type { WaldeAdminConfigData } from './sdk/domain/entities/walde-admin-config';
