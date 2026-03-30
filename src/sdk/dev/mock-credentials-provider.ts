import { CredentialsProvider } from '@/sdk/domain/ports/out/credentials-provider';
import { Credentials } from '@/sdk/domain/entities/credentials';

/**
 * Create a mock JWT token with specified expiry
 * @param expirySeconds Seconds from now until token expires (default: 1 hour)
 * @returns Valid JWT-formatted mock token
 */
function createMockJwt(expirySeconds: number = 3600): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    sub: 'mock-user-id',
    name: 'Mock User',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + expirySeconds
  };

  const base64UrlEncode = (obj: any): string => {
    return Buffer.from(JSON.stringify(obj))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  };

  const encodedHeader = base64UrlEncode(header);
  const encodedPayload = base64UrlEncode(payload);
  const signature = 'mock-signature';

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Mock credentials provider for testing
 * Generates valid JWT-formatted tokens with configurable expiry
 */
export class MockCredentialsProvider implements CredentialsProvider {
  constructor(
    private readonly accessToken?: string,
    private readonly refreshToken?: string,
    private readonly idToken?: string,
    private readonly tokenExpirySeconds: number = 3600
  ) {}

  /**
   * Retrieve mock credentials with valid JWT tokens
   */
  async retrieve(): Promise<Credentials> {
    return new Credentials(
      this.accessToken || createMockJwt(this.tokenExpirySeconds),
      this.refreshToken || 'mock-refresh-token',
      this.idToken || createMockJwt(this.tokenExpirySeconds)
    );
  }

  /**
   * Save credentials (no-op for mock)
   */
  async save(credentials: Credentials): Promise<void> {
    // No-op for mock implementation
  }
}
