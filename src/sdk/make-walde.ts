import { WaldeFactory } from './infra/factories/walde-factory';
import { WaldeFuture } from './infra/futures/walde-future';

/**
 * Configuration for Walde frontend SDK
 */
export interface WaldeConfig {
  url?: string;
}

/**
 * Create a Walde instance for frontend operations
 */
export function MakeWalde(config?: WaldeConfig): WaldeFuture {
  return WaldeFactory.create(config);
}
