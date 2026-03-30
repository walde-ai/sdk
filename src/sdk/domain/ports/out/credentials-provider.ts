import { Credentials } from '@/sdk/domain/entities/credentials';

/**
 * Provider interface for user credentials
 */
export interface CredentialsProvider {
  /**
   * Retrieve user credentials
   */
  retrieve(): Promise<Credentials>;

  /**
   * Save user credentials
   */
  save(credentials: Credentials): Promise<void>;
}
