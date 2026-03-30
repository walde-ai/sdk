import { TokenProvider } from '../../domain/ports/in/token-provider';
import { CredentialsProvider } from '@/sdk/domain/ports/out/credentials-provider';
import { WaldeAuthenticationError, WaldeConfigurationError, WaldeSystemError } from '@/sdk/domain/errors';
import { RefreshCredentials } from '@/sdk/domain/interactors/refresh-credentials';
import { CognitoTokenRefreshProvider } from './cognito-token-refresh-provider';
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
  private readonly tokenRefreshProvider?: TokenRefreshProvider;
  private readonly refreshInteractor?: RefreshCredentials;

  constructor(
    private readonly credentialsProvider: CredentialsProvider,
    clientId?: string,
    region?: string
  ) {
    // Initialize refresh dependencies once if clientId is provided
    if (clientId) {
      this.tokenRefreshProvider = new CognitoTokenRefreshProvider(
        clientId,
        region || 'us-east-1'
      );
      this.refreshInteractor = new RefreshCredentials(
        this.credentialsProvider,
        this.tokenRefreshProvider
      );
    }
  }

  /**
   * Get the access token from stored credentials
   * Automatically refreshes token if expired or expiring within 5 minutes
   * 
   * Note: Despite the method name, this returns the idToken for Cognito authentication.
   * AWS Cognito uses the idToken (not accessToken) for API Gateway authorization.
   */
  public async getAccessToken(): Promise<string> {
    try {
      const credentials = await this.credentialsProvider.retrieve();
      const timeToExpiry = credentials.timeToExpirationMs();

      // Auto-refresh if token is expired or about to expire (≤5 minutes left)
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

        const refreshedCredentials = await this.refreshInteractor.execute();
        return refreshedCredentials.idToken;
      }

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
}
