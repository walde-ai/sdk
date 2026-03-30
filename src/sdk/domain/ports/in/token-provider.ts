/**
 * Interface for providing authentication tokens
 */
export interface TokenProvider {
  /**
   * Get the access token for API authentication
   */
  getAccessToken(): Promise<string>;
}
