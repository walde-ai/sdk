import { Result } from './result';

/**
 * Abstract base class for lazy method chaining that resolves to a Promise.
 * Enables fluent API patterns where each step contributes parameters to a final operation.
 * 
 * @template T The result type when resolved
 * @template P The parent type that provides parameters for this operation
 */
export abstract class Future<T, P> {
  /**
   * Creates a new Future with parent reference.
   * @param parent The parent object that provides parameters for this operation
   */
  constructor({ parent }: { parent: P }) {
    this.parent = parent;
  }

  /**
   * Reference to the parent object in the chain.
   */
  protected readonly parent: P;

  /**
   * Resolves the Future to a Promise by executing the operation.
   * Implementations should collect parameters from the parent chain and make API calls.
   * @returns Promise that resolves to Result containing the operation result or error
   */
  abstract resolve(): Promise<Result<T, any>>;
}
