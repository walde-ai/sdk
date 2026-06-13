/**
 * Interface for providing authentication tokens
 */
export interface TokenProvider {
  /**
   * Get the id token for REST API authentication (Cognito idToken)
   */
  getIdToken(): Promise<string>;

  /**
   * Get the access token for WebSocket authentication (Cognito accessToken)
   */
  getAccessToken(): Promise<string>;
}
