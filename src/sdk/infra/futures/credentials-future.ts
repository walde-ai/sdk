import { Future, Result, ok, err } from '@/std';
import { WaldeAdmin } from './walde-admin-future';
import { Credentials } from '@/sdk/domain/entities/credentials';
import { GetCredentials } from '@/sdk/domain/interactors/get-credentials';
import { RefreshCredentials } from '@/sdk/domain/interactors/refresh-credentials';
import { GetToken } from '@/sdk/domain/interactors/get-token';
import { CognitoTokenRefreshProvider } from '@/sdk/infra/adapters/cognito-token-refresh-provider';
import { WaldeConfigurationError, WaldeUsageError } from '@/sdk/domain/errors';

/**
 * Threshold in milliseconds (5 minutes) for auto-refresh
 */
const AUTO_REFRESH_THRESHOLD_MS = 5 * 60 * 1000;

/**
 * Get valid credentials, automatically refreshing if needed
 * @param parent WaldeAdmin instance for config access
 * @returns Valid credentials
 */
async function getValidCredentials(parent: WaldeAdmin): Promise<Credentials> {
  const config = parent.getConfig();
  const getCredentialsInteractor = new GetCredentials(config.credentialsProvider);
  const credentials = await getCredentialsInteractor.execute();

  const timeToExpiry = credentials.timeToExpirationMs();

  // Auto-refresh if token is expired or about to expire (≤5 minutes left)
  if (timeToExpiry <= AUTO_REFRESH_THRESHOLD_MS) {
    if (!credentials.refreshToken) {
      // No refresh token available - return credentials as-is
      // This will likely result in authentication errors when used
      return credentials;
    }

    if (!config.config.clientId) {
      throw new WaldeConfigurationError('Cognito client ID not configured');
    }

    const tokenRefreshProvider = new CognitoTokenRefreshProvider(
      config.config.clientId,
      config.config.region
    );
    const refreshInteractor = new RefreshCredentials(
      config.credentialsProvider,
      tokenRefreshProvider
    );
    return await refreshInteractor.execute();
  } else {
    return credentials;
  }
}

export class CredentialsFuture extends Future<Credentials, WaldeAdmin> {
  private operation: 'get' | 'refresh' | 'getToken' | null = null;

  constructor({ parent }: { parent: WaldeAdmin }) {
    super({ parent });
  }

  get(): CredentialsFuture {
    const future = new CredentialsFuture({ parent: this.parent });
    future.operation = 'get';
    return future;
  }

  refresh(): CredentialsFuture {
    const future = new CredentialsFuture({ parent: this.parent });
    future.operation = 'refresh';
    return future;
  }

  getToken(): Future<string, WaldeAdmin> {
    return new TokenFuture({ parent: this.parent });
  }

  async resolve(): Promise<Result<Credentials, any>> {
    try {
      const config = this.parent.getConfig();
      
      if (this.operation === 'get') {
        const credentials = await getValidCredentials(this.parent);
        return ok(credentials);
      } else if (this.operation === 'refresh') {
        if (!config.config.clientId) {
          throw new WaldeConfigurationError('Cognito client ID not configured');
        }
        
        const tokenRefreshProvider = new CognitoTokenRefreshProvider(
          config.config.clientId,
          config.config.region
        );
        const interactor = new RefreshCredentials(
          config.credentialsProvider,
          tokenRefreshProvider
        );
        const credentials = await interactor.execute();
        return ok(credentials);
      } else {
        throw new WaldeUsageError('No operation specified');
      }
    } catch (error: any) {
      return err(error.message);
    }
  }
}

class TokenFuture extends Future<string, WaldeAdmin> {
  constructor({ parent }: { parent: WaldeAdmin }) {
    super({ parent });
  }

  async resolve(): Promise<Result<string, any>> {
    try {
      const credentials = await getValidCredentials(this.parent);
      
      if (!credentials.isComplete()) {
        throw new WaldeConfigurationError('No valid credentials available');
      }

      return ok(credentials.idToken);
    } catch (error: any) {
      return err(error.message);
    }
  }
}
