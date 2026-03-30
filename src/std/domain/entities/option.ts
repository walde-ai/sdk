/**
 * Represents an optional value that can either contain a value or be empty.
 * Prevents null/undefined errors at compile time by constraining T to non-nullable types.
 */
export type Option<T> = Some<NonNullable<T>> | None;

/**
 * Represents an option that contains a value.
 */
export class Some<T> {
  /**
   * Creates an option containing the given value.
   * @param value The contained value (must not be null or undefined)
   */
  constructor(public readonly value: NonNullable<T>) {}
  
  /**
   * Type guard to check if this option contains a value.
   * @returns true, as this is always a Some variant
   */
  isSome(): this is Some<T> {
    return true;
  }
  
  /**
   * Type guard to check if this option is empty.
   * @returns false, as this is always a Some variant
   */
  isNone(): this is None {
    return false;
  }
}

/**
 * Represents an empty option containing no value.
 */
export class None {
  /**
   * Type guard to check if this option contains a value.
   * @returns false, as this is always a None variant
   */
  isSome(): this is Some<never> {
    return false;
  }
  
  /**
   * Type guard to check if this option is empty.
   * @returns true, as this is always a None variant
   */
  isNone(): this is None {
    return true;
  }
}

/**
 * Creates an option containing the given value.
 * @param value The value to wrap (must not be null or undefined)
 * @returns Some instance containing the value
 */
export const some = <T>(value: NonNullable<T>): Some<T> => new Some(value);

/**
 * Creates an empty option containing no value.
 * @returns None instance
 */
export const none = (): None => new None();
