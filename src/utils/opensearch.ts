import { Model } from "../model/Model";
import { Hit } from "../types/model";

export function convertHit<M extends Model>(data: Hit): M {
  return {
    _index: data._index,
    _id: data._id,
    _version: data._version,
    _score: data._score,
    ...data._source,
  } as M;
}
