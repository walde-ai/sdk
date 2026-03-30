import * as fs from 'fs';
import * as path from 'path';
import { CredentialsProvider } from '@/sdk/domain/ports/out/credentials-provider';
import { Credentials } from '@/sdk/domain/entities/credentials';

/**
 * File-based repository for user credentials
 */
export class CredentialsFileRepo implements CredentialsProvider {
  constructor(private readonly filePath: string) {}

  /**
   * Retrieve user credentials from JSON file
   */
  public async retrieve(): Promise<Credentials> {
    try {
      const fileContent = fs.readFileSync(this.filePath, 'utf-8');
      const data = JSON.parse(fileContent);
      
      return new Credentials(
        data.accessToken,
        data.refreshToken,
        data.idToken
      );
    } catch (error: any) {
      return new Credentials('', '', '');
    }
  }

  /**
   * Save user credentials to JSON file
   */
  public async save(credentials: Credentials): Promise<void> {
    const data = {
      accessToken: credentials.accessToken,
      refreshToken: credentials.refreshToken,
      idToken: credentials.idToken
    };

    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
  }
}
