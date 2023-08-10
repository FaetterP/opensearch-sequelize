import { Model } from "../model/Model";
import { DataValues, FuzzyWhere, WhereType } from "../types/model";
import { Query } from "../types/requests";
import { Hit } from "../types/responses";

export function convertHit<M extends Model>(data: Hit): M {
  return {
    _index: data._index,
    _id: data._id,
    _version: data._version,
    _score: data._score,
    ...data._source,
  } as M;
}

export function convertWhereToQuery(where: WhereType): Query {
  let must: Query[] = [];

  for (const key in where) {
    const whereValue = where[
      key as keyof DataValues
    ] as (typeof where)[keyof DataValues];

    if (typeof whereValue === "object") {
      switch ((whereValue as any).type) {
        case "exact":
          must.push({
            match: {
              [`${key}.keyword`]: whereValue,
            },
          });
          break;
        case "fuzzy":
          const fuzzyWhere = whereValue as FuzzyWhere;
          must.push({
            match: {
              [`${key}`]: { query: fuzzyWhere.value, fuzziness: "AUTO" },
            },
          });
          break;
        default:
      }
    } else if (typeof whereValue === "number") {
      must.push({
        match: {
          [key]: whereValue,
        },
      });
    } else {
      must.push({
        match: {
          [`${key}.keyword`]: whereValue,
        },
      });
    }
  }

  const query = {
    bool: {
      must,
    },
  };

  return query;
}
