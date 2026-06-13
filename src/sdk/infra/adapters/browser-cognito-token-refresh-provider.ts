import { TokenRefreshProvider } from '@/sdk/domain/ports/out/token-refresh-provider';
import { Credentials } from '@/sdk/domain/entities';
import { WaldeAuthenticationError, WaldeUnexpectedError } from '@/sdk/domain/errors';

/**
 * Browser-compatible implementation of TokenRefreshProvider using amazon-cognito-identity-js.
 * Uses CognitoUser.refreshSession() instead of the AWS SDK v3 Cognito client,
 * which is not browser-compatible.
 *
 * amazon-cognito-identity-js is loaded lazily (dynamic import) so that merely
 * importing the browser entry point of the SDK does not pull in Node-only
 * transitive dependencies such as isomorphic-unfetch.
 */
export class BrowserCognitoTokenRefreshProvider implements TokenRefreshProvider {
  constructor(
    private readonly clientId: string,
    private readonly userPoolId: string,
    private readonly region: string = 'eu-central-1'
  ) {}

  public async refreshTokens(refreshToken: string): Promise<Credentials> {
    const { CognitoUserPool, CognitoUser, CognitoRefreshToken } =
      await import('amazon-cognito-identity-js');

    return new Promise((resolve, reject) => {
      const userPool = new CognitoUserPool({
        UserPoolId: this.userPoolId,
        ClientId: this.clientId,
      });

      const cognitoUser = new CognitoUser({
        Username: 'unknown',
        Pool: userPool,
      });

      const token = new CognitoRefreshToken({ RefreshToken: refreshToken });

      cognitoUser.refreshSession(token, (err, session) => {
        if (err) {
          if (err.name === 'NotAuthorizedException') {
            reject(new WaldeAuthenticationError('Refresh token has expired'));
          } else {
            reject(new WaldeUnexpectedError('Failed to refresh tokens', err));
          }
          return;
        }

        if (!session) {
          reject(new WaldeUnexpectedError('No session received from Cognito refresh', new Error('Missing session')));
          return;
        }

        const newAccessToken = session.getAccessToken().getJwtToken();
        const newIdToken = session.getIdToken().getJwtToken();
        const newRefreshToken = session.getRefreshToken()?.getToken() ?? refreshToken;

        resolve(new Credentials(newAccessToken, newRefreshToken, newIdToken));
      });
    });
  }
}
