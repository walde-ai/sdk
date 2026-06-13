// Browser consumer exports (no admin / no Cognito dependencies)
export { MakeWalde } from './sdk/make-walde';
export type { WaldeConfig } from './sdk/make-walde';
export type { WaldeFuture } from './sdk/infra/futures/walde-future';

// Cloud API types — exported from browser.ts because WaldeApi and WaldeApiRegistry
// have no Node.js dependencies; users extend WaldeApi in cloud code but the class
// itself is safe for any compilation context.
export { WaldeApi } from './sdk/domain/entities/api';
export type { WaldeApiRegistry } from './sdk/domain/entities/api';

// WebSocket browser adapter
export { BrowserWebSocketClientFactory } from './sdk/infra/adapters/browser-web-socket-client-factory';
export type { IWebSocketClientFactory } from './sdk/domain/ports/in/web-socket-client-factory';
export type { IWebSocketClient } from './sdk/domain/ports/in/web-socket-client';

// Shared types & entities (no heavy dependencies)
export { Credentials, SiteState } from './sdk/domain/entities';
export type { CredentialsProvider } from './sdk/domain/ports/out/credentials-provider';

// Error types
export { WaldeError } from './sdk/domain/errors/walde-error';
export { WaldeAuthenticationError } from './sdk/domain/errors/walde-authentication-error';
export { WaldeConfigurationError } from './sdk/domain/errors/walde-configuration-error';
export { WaldeUsageError } from './sdk/domain/errors/walde-usage-error';

// Re-export STD utilities
export * from './std';

// Re-export domain types needed for frontend
export type { Content, FrontendContent, ContentPart, MarkdownPart, KeyValuePart, StringPart, Manifest, ManifestContent } from './sdk/domain/entities';
export type { FormatPart } from './sdk/domain/entities';

// Brief domain types
export { Brief } from './sdk/domain/entities/brief';
export type { BriefEnvelope, BriefState, SectionKey, BriefComment } from './sdk/domain/entities/brief';

// WebSocket session types for hub chat
export type { ChatStreamData, ChatStreamEndData, BackgroundTaskAgent } from '@walde.ai/ws-protocol';
export type { IWaldeWSSession } from './sdk/domain/ports/in/walde-ws-session';
