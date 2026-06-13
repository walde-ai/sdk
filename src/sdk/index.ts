// Factories
export { WaldeAdminFactory } from './infra/factories/walde-admin-factory';
export { WaldeAdminConfigFactory } from './infra/factories/walde-admin-config-factory';
export { MakeWaldeAdmin } from './make-walde-admin';
export { MakeWalde } from './make-walde';

// WebSocket sessions
export { WSClientSession } from './infra/sessions/ws-client-session';
export { WaldeWSSession } from './infra/sessions/walde-ws-session';
export type { IWaldeWSSession } from './domain/ports/in/walde-ws-session';
export { WaldeAdmin } from './infra/futures/walde-admin-future';

// Domain entities
export {
  Content,
  ContentFormat,
  ContentPart,
  ContentState,
  ContentVersion,
  Credentials,
  DnsEntry,
  File,
  Format,
  FrontendContent,
  KeyValuePart,
  Manifest,
  ManifestContent,
  MarkdownPart,
  Site,
  SiteState,
  CustomDomainStatus,
  StringPart,
  UiUploadCredentials,
  WaldeAdminConfig,
  WorkspaceConfig,
  ProjectWorkspaceConfig,
  MinimalProjectWorkspaceConfig,
} from './domain/entities';
export type {
  FormatPart,
  CustomDomain,
  DnsEntryRequirement,
  DnsEntryRole,
  WaldeAdminConfigData,
  PartialWaldeAdminConfigData,
  WorkspaceUiConfig,
  WorkspaceContentConfig,
} from './domain/entities';

// Cloud API entities
export { WaldeApi } from './domain/entities/api';
export type { WaldeApiRegistry } from './domain/entities/api';
export type { CloudApiDeployResult } from './domain/entities/cloud-api-deploy-result';

// Cloud API futures
export { SiteCloudFuture } from './infra/futures/site-cloud-future';
export { SiteCloudApiFuture } from './infra/futures/site-cloud-api-future';
export { SiteCloudApiFileFuture } from './infra/futures/site-cloud-api-file-future';
export { SiteCloudApiDirectoryFuture } from './infra/futures/site-cloud-api-directory-future';
export { SiteCloudApiPushFuture } from './infra/futures/site-cloud-api-push-future';

// Brief domain types
export { Brief } from './domain/entities/brief';
export type { BriefEnvelope, BriefState, SectionKey, BriefComment } from './domain/entities/brief';

// Background task types
export type { BackgroundTaskAgent } from '@walde.ai/ws-protocol';

// Interfaces
export type { CredentialsProvider } from './domain/ports/out/credentials-provider';
export type { TokenProvider } from './domain/ports/in/token-provider';
export type { WorkspaceConfigRepo } from './domain/ports/out/workspace-config-repo';
export type { CertificateAssociationsResult } from './domain/ports/out/site-repository';
export type { S3ClientFactory } from './domain/ports/out/s3-client-factory';

// Infrastructure
export { FileWorkspaceConfigRepo } from './infra/adapters/repositories/file-workspace-config-repo';
export { AdminHttpClient } from './infra/adapters/admin-http-client';
export { DefaultTokenProvider } from './infra/adapters/default-token-provider';
export { ApiClient } from './infra/adapters/api-client';
export { AwsS3ClientFactory } from './infra/adapters/aws-s3-client-factory';

// Development/Testing
export { S3MockClient } from './dev/s3-mock-client';
export { S3MockClientFactory } from './dev/s3-mock-client-factory';
export { MockCredentialsProvider } from './dev/mock-credentials-provider';

// Error types
export { WaldeError } from './domain/errors/walde-error';
export { WaldeUserError } from './domain/errors/walde-user-error';
export { WaldeSystemError } from './domain/errors/walde-system-error';
export { WaldeValidationError } from './domain/errors/walde-validation-error';
export { WaldeAuthenticationError } from './domain/errors/walde-authentication-error';
export { WaldeConfigurationError } from './domain/errors/walde-configuration-error';
export { WaldeUsageError } from './domain/errors/walde-usage-error';
export { WaldeNetworkError } from './domain/errors/walde-network-error';
export { WaldeLocalError } from './domain/errors/walde-local-error';
export { WaldeUnexpectedError } from './domain/errors/walde-unexpected-error';
