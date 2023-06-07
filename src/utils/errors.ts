import { BaseOpensearchError, Cause } from "../types/responses";

export function extractMessage(error: BaseOpensearchError) {
  return error.error.root_cause[0].reason;
}
