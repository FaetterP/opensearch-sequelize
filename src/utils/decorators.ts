import { Model } from "../model/Model";
import { IndexOptions } from "../types/model";
import { setModelName, setOptions } from "./metadata";

export function Table(arg: any) {
  const options: IndexOptions = { ...arg };
  return (target: any) => annotate(target, options);
}

function annotate(target: typeof Model, options: IndexOptions = {}): void {
  setModelName(target, options.tableName || target.name);
  setOptions(target, options);
}
