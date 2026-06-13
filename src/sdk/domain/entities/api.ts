/**
 * Abstract base class for user-defined Walde cloud API handlers.
 *
 * Extend this class in `dev/cloud/src/apis/` to implement a backend function.
 * The concrete input and output types are carried as type parameters and used
 * for type-checking at the call site in the UI via `WaldeApiRegistry`.
 */
export abstract class WaldeApi<TInput, TOutput> {
  abstract handler(input: TInput): Promise<TOutput>;
}

/**
 * Augmentable registry interface that maps camelCase API method names to their
 * input/output type pairs.  The CLI manages the augmentation file at
 * `dev/ui/src/walde-cloud-registry.ts`; users must not edit it by hand.
 *
 * @example
 * // auto-managed by `walde api create`
 * declare module '@walde.ai/sdk' {
 *   interface WaldeApiRegistry {
 *     myApi: { input: MyApiInput; output: MyApiOutput };
 *   }
 * }
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface WaldeApiRegistry {}
