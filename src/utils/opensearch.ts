import { Model } from "../model/Model";
import { Op } from "../model/operators";
import {
  DataValues,
  FuzzyWhere,
  RangeWhere,
  RegexWhere,
  WhereItem,
  WhereType,
  WildcardWhere,
} from "../types/model";
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
    const whereValue = where[key as keyof DataValues] as WhereItem;

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
              fuzzy: {
                [key]: {
                  value: fuzzyWhere.value,
                  fuzziness: fuzzyWhere.fuzziness,
                  max_expansions: fuzzyWhere.maxExpansions,
                  prefix_length: fuzzyWhere.prefixLength,
                  rewrite: fuzzyWhere.rewrite,
                  transpositions: fuzzyWhere.transpositions,
                },
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
          case "wildcard":
            const wildcardWhere = whereValue as WildcardWhere & {
              value: string;
            };
            must.push({
              wildcard: {
                [`${key}.keyword`]: {
                  value: wildcardWhere.value,
                  case_insensitive: wildcardWhere.caseInsensitive,
                  boost: wildcardWhere.boost,
                  rewrite: wildcardWhere.rewrite,
                },
              },
            });
            break;
          default:
        }
      } else {
        if ((whereValue as { [Op.regexp]: string })[Op.regexp]) {
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
        } else if ((whereValue as { [Op.wildcard]: string })[Op.wildcard]) {
          const wildcardWhere = whereValue as WildcardWhere & {
            [Op.wildcard]: string;
          };
          must.push({
            wildcard: {
              [`${key}.keyword`]: {
                value: wildcardWhere[Op.wildcard],
                case_insensitive: wildcardWhere.caseInsensitive,
                boost: wildcardWhere.boost,
                rewrite: wildcardWhere.rewrite,
              },
            },
          });
        } else {
          const rangeWhere = whereValue as RangeWhere;
          range[key as keyof DataValues<M>] = {
            gt: rangeWhere[Op.gt],
            gte: rangeWhere[Op.gte],
            lt: rangeWhere[Op.lt],
            lte: rangeWhere[Op.lte],
            format: rangeWhere.format,
            relation: rangeWhere.relation,
            boost: rangeWhere.boost,
            time_zone: rangeWhere.timezone,
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
