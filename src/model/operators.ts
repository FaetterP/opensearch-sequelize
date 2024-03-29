export interface OpTypes {
  readonly exists: unique symbol;

  readonly gt: unique symbol;
  readonly lt: unique symbol;
  readonly gte: unique symbol;
  readonly lte: unique symbol;

  readonly regexp: unique symbol;
  // readonly notRegexp: unique symbol;
  readonly wildcard: unique symbol;
}
export const Op: OpTypes = {
  exists: Symbol.for("exists"),

  gt: Symbol.for("gt"),
  lt: Symbol.for("lt"),
  gte: Symbol.for("gte"),
  lte: Symbol.for("lte"),

  regexp: Symbol.for("regexp"),
  // notRegexp: Symbol.for("notRegexp")
  wildcard: Symbol.for("wildcard"),
} as OpTypes;
