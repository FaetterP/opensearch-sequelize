import "reflect-metadata";
import { IndexOptions } from "../types/model";

const KEY_MODEL_NAME = "model:name";
const KEY_MODEL_OPTIONS = "model:options";

export function setModelName(target: any, modelName: string): void {
  Reflect.defineMetadata(KEY_MODEL_NAME, modelName, target);
}

export function getModelName(target: any): string {
  return Reflect.getMetadata(KEY_MODEL_NAME, target);
}

export function setOptions(target: any, options: IndexOptions): void {
  Reflect.defineMetadata(KEY_MODEL_OPTIONS, { ...options }, target);
}

export function getOptions(target: any): string {
  return Reflect.getMetadata(KEY_MODEL_OPTIONS, target);
}
