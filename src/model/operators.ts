export interface OpTypes {
  readonly gt: unique symbol;
  readonly lt: unique symbol;
  readonly gte: unique symbol;
  readonly lte: unique symbol;
}
export const Op: OpTypes = {
  gt: Symbol.for("gt"),
  lt: Symbol.for("lt"),
  gte: Symbol.for("gte"),
  lte: Symbol.for("lte"),
} as OpTypes;
