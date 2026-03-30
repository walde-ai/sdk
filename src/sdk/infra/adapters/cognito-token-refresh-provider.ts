import { CognitoIdentityProviderClient, InitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider';
import { TokenRefreshProvider } from '@/sdk/domain/ports/out/token-refresh-provider';
import { Credentials } from '@/sdk/domain/entities/credentials';
import { WaldeUnexpectedError, WaldeAuthenticationError } from '@/sdk/domain/errors';

/**
 * Cognito implementation of TokenRefreshProvider
 */
export class CognitoTokenRefreshProvider implements TokenRefreshProvider {
  private readonly client: CognitoIdentityProviderClient;

  constructor(
    private readonly clientId: string,
    private readonly region: string = 'eu-central-1'
  ) {
    this.client = new CognitoIdentityProviderClient({ region: this.region });
  }

  /**
   * Refresh access and ID tokens using refresh token
   */
  public async refreshTokens(refreshToken: string): Promise<Credentials> {
    try {
      const command = new InitiateAuthCommand({
        AuthFlow: 'REFRESH_TOKEN_AUTH',
        ClientId: this.clientId,
        AuthParameters: {
          REFRESH_TOKEN: refreshToken
        }
      });

      const response = await this.client.send(command);

      if (!response.AuthenticationResult) {
        throw new WaldeUnexpectedError('No authentication result received from Cognito', new Error('Missing AuthenticationResult'));
      }

      const { AccessToken, IdToken, RefreshToken } = response.AuthenticationResult;

      if (!AccessToken || !IdToken) {
        throw new WaldeUnexpectedError('Missing tokens in refresh response', new Error('Missing AccessToken or IdToken'));
      }

      return new Credentials(
        AccessToken,
        RefreshToken || refreshToken,
        IdToken
      );

    } catch (error: any) {
      if (error.name === 'NotAuthorizedException') {
        throw new WaldeAuthenticationError('Refresh token has expired');
      }
      throw new WaldeUnexpectedError('Failed to refresh tokens', error);
    }
  }
}
