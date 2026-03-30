import { CredentialsProvider } from '@/sdk/domain/ports/out/credentials-provider';
import { TokenRefreshProvider } from '@/sdk/domain/ports/out/token-refresh-provider';
import { Credentials } from '@/sdk/domain/entities/credentials';
import { WaldeAuthenticationError } from '@/sdk/domain/errors';

/**
 * Interactor for refreshing authentication credentials
 */
export class RefreshCredentials {
  constructor(
    private readonly credentialsProvider: CredentialsProvider,
    private readonly tokenRefreshProvider: TokenRefreshProvider
  ) {}

  /**
   * Refresh the stored credentials using refresh token
   */
  public async execute(): Promise<Credentials> {
    const currentCredentials = await this.credentialsProvider.retrieve();
    
    if (!currentCredentials.refreshToken) {
      throw new WaldeAuthenticationError('No refresh token available');
    }

    const refreshedCredentials = await this.tokenRefreshProvider.refreshTokens(
      currentCredentials.refreshToken
    );

    await this.credentialsProvider.save(refreshedCredentials);
    return refreshedCredentials;
  }
}
