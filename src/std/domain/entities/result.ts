/**
 * Represents the result of an operation that can either succeed with a value or fail with an error.
 * Provides type-safe error handling without exceptions.
 */
export type Result<T, E> = Ok<T> | Err<E>;

/**
 * Represents a successful result containing a value.
 */
export class Ok<T> {
  /**
   * Creates a successful result with the given value.
   * @param value The success value
   */
  constructor(public readonly value: T) {}
  
  /**
   * Type guard to check if this result is successful.
   * @returns true, as this is always an Ok variant
   */
  isOk(): this is Ok<T> {
    return true;
  }
  
  /**
   * Type guard to check if this result is an error.
   * @returns false, as this is always an Ok variant
   */
  isErr(): this is Err<never> {
    return false;
  }

  /**
   * Returns the contained value.
   * @returns The success value
   */
  unwrap(): T {
    return this.value;
  }

  /**
   * Returns the contained value.
   * @param message Unused for Ok variant
   * @returns The success value
   */
  expect(message: string): T {
    return this.value;
  }
}

/**
 * Represents a failed result containing an error.
 */
export class Err<E> {
  /**
   * Creates a failed result with the given error.
   * @param error The error value
   */
  constructor(public readonly error: E) {}
  
  /**
   * Type guard to check if this result is successful.
   * @returns false, as this is always an Err variant
   */
  isOk(): this is Ok<never> {
    return false;
  }
  
  /**
   * Type guard to check if this result is an error.
   * @returns true, as this is always an Err variant
   */
  isErr(): this is Err<E> {
    return true;
  }

  /**
   * Throws an error with the contained error value.
   * @throws Error with the contained error
   */
  unwrap(): never {
    return this.expect(`Called unwrap on an Err value: ${this.error}`);
  }

  /**
   * Returns the contained error value.
   * @returns The error value
   */
  unwrapErr(): E {
    return this.error;
  }

  /**
   * Throws an error with the provided message.
   * @param message Custom error message to throw
   * @throws Error with the provided message
   */
  expect(message: string): never {
    throw new Error(message);
  }
}

/**
 * Creates a successful result containing the given value.
 * @param value The success value
 * @returns Ok instance containing the value
 */
export const ok = <T>(value: T): Ok<T> => new Ok(value);

/**
 * Creates a failed result containing the given error.
 * @param error The error value
 * @returns Err instance containing the error
 */
export const err = <E>(error: E): Err<E> => new Err(error);
