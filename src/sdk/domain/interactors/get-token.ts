import { CredentialsProvider } from '@/sdk/domain/ports/out/credentials-provider';
import { WaldeAuthenticationError } from '@/sdk/domain/errors';

/**
 * Interactor for retrieving access token
 */
export class GetToken {
  constructor(private readonly credentialsProvider: CredentialsProvider) {}

  /**
   * Execute token retrieval
   */
  public async execute(): Promise<string> {
    const credentials = await this.credentialsProvider.retrieve();
    
    if (!credentials.isComplete()) {
      throw new WaldeAuthenticationError('No valid credentials available');
    }

    return credentials.accessToken;
  }
}
