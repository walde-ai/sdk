import { Credentials } from '@/sdk/domain/entities/credentials';

/**
 * Provider interface for token refresh operations
 */
export interface TokenRefreshProvider {
  /**
   * Refresh authentication tokens using refresh token
   */
  refreshTokens(refreshToken: string): Promise<Credentials>;
}
