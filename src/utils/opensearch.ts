import { Model } from "../model/Model";
import { Op } from "../model/operators";
import { DataValues, FuzzyWhere, RegexWhere, WhereType } from "../types/model";
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

export function convertWhereToQuery<M extends Model = Model>(
  where: WhereType
): Query<M> {
  let must: Query[] = [];
  let range: Query<M>["range"] = {};

  for (const key in where) {
    const whereValue = where[
      key as keyof DataValues
    ] as WhereType[keyof DataValues];

    if (typeof whereValue === "object") {
      if ((whereValue as any).type) {
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
                [key]: { query: fuzzyWhere.value, fuzziness: "AUTO" },
              },
            });
            break;
          case "regex":
            const regexWhere = whereValue as RegexWhere & { value: string };
            must.push({
              regexp: {
                [`${key}.keyword`]: {
                  value: regexWhere.value,
                  case_insensitive: regexWhere.caseInsensitive,
                  flags: regexWhere.flags,
                  max_determinized_states: regexWhere.maxDeterminizedStates,
                  rewrite: regexWhere.rewrite,
                },
              },
            });
            break;
          default:
        }
      } else {
        if (whereValue[Op.regexp]) {
          const regexWhere = whereValue as RegexWhere & { [Op.regexp]: string };
          must.push({
            regexp: {
              [`${key}.keyword`]: {
                value: regexWhere[Op.regexp],
                case_insensitive: regexWhere.caseInsensitive,
                flags: regexWhere.flags,
                max_determinized_states: regexWhere.maxDeterminizedStates,
                rewrite: regexWhere.rewrite,
              },
            },
          });
        } else {
          range[key as keyof DataValues<M>] = {
            gt: whereValue[Op.gt],
            gte: whereValue[Op.gte],
            lt: whereValue[Op.lt],
            lte: whereValue[Op.lte],
            format: whereValue["format"], // TODO fix type for 'whereValue'
          };
        }
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

  if (Object.keys(range).length) {
    must.push({ range });
  }

  const query = {
    bool: {
      must,
    },
  };

  return query;
}
