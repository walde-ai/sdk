import { TokenProvider } from '../../domain/ports/in/token-provider';
import { CredentialsProvider } from '@/sdk/domain/ports/out/credentials-provider';
import { Credentials } from '@/sdk/domain/entities';
import { WaldeAuthenticationError, WaldeConfigurationError, WaldeSystemError } from '@/sdk/domain/errors';
import { RefreshCredentials } from '@/sdk/domain/interactors/refresh-credentials';
import { TokenRefreshProvider } from '@/sdk/domain/ports/out/token-refresh-provider';

/**
 * Threshold in milliseconds (5 minutes) for auto-refresh
 */
const AUTO_REFRESH_THRESHOLD_MS = 5 * 60 * 1000;

/**
 * Default implementation of TokenProvider using CredentialsProvider
 * with automatic token refresh on expiry
 */
export class DefaultTokenProvider implements TokenProvider {
  private readonly refreshInteractor?: RefreshCredentials;

  constructor(
    private readonly credentialsProvider: CredentialsProvider,
    tokenRefreshProvider?: TokenRefreshProvider
  ) {
    if (tokenRefreshProvider) {
      this.refreshInteractor = new RefreshCredentials(
        this.credentialsProvider,
        tokenRefreshProvider
      );
    }
  }

  private async getRefreshedCredentials(): Promise<Credentials> {
    const credentials = await this.credentialsProvider.retrieve();
    const timeToExpiry = credentials.timeToExpirationMs();

    if (timeToExpiry <= AUTO_REFRESH_THRESHOLD_MS) {
      if (!credentials.refreshToken) {
        throw new WaldeAuthenticationError(
          'Token is expired or expiring soon, but no refresh token is available. Please log in again.'
        );
      }

      if (!this.refreshInteractor) {
        throw new WaldeConfigurationError(
          'Cognito client ID not configured for auto-refresh. Cannot refresh expired token.'
        );
      }

      return await this.refreshInteractor.execute();
    }

    return credentials;
  }

  /**
   * Get the id token for REST API authentication
   * Automatically refreshes token if expired or expiring within 5 minutes
   */
  public async getIdToken(): Promise<string> {
    try {
      const credentials = await this.getRefreshedCredentials();
      return credentials.idToken;
    } catch (error) {
      if (error instanceof WaldeAuthenticationError || error instanceof WaldeConfigurationError) {
        throw error;
      }
      if (error instanceof WaldeSystemError) {
        throw new WaldeAuthenticationError(
          `Token refresh failed: ${error.message}`
        );
      }
      throw new WaldeAuthenticationError('Credentials file not found');
    }
  }

  /**
   * Get the access token for WebSocket authentication
   * Automatically refreshes token if expired or expiring within 5 minutes
   */
  public async getAccessToken(): Promise<string> {
    try {
      const credentials = await this.getRefreshedCredentials();
      return credentials.accessToken;
    } catch (error) {
      if (error instanceof WaldeAuthenticationError || error instanceof WaldeConfigurationError) {
        throw error;
      }
      if (error instanceof WaldeSystemError) {
        throw new WaldeAuthenticationError(
          `Token refresh failed: ${error.message}`
        );
      }
      throw new WaldeAuthenticationError('Credentials file not found');
    }
  }
}
