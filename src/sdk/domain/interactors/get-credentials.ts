import { CredentialsProvider } from '@/sdk/domain/ports/out/credentials-provider';
import { Credentials } from '@/sdk/domain/entities/credentials';

/**
 * Interactor for retrieving credentials
 */
export class GetCredentials {
  constructor(private readonly credentialsProvider: CredentialsProvider) {}

  /**
   * Execute credential retrieval
   */
  public async execute(): Promise<Credentials> {
    return await this.credentialsProvider.retrieve();
  }
}
