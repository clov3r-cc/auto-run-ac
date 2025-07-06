// Shared type definitions

// Note: https://effect.website/docs/code-style/branded-types/#generalizing-branded-types
const BrandType: unique symbol = Symbol.for('auto-run-ac/BrandType');

export interface Brand<in out K extends string | symbol> {
  readonly [BrandType]: Readonly<Record<K, K>>;
}
