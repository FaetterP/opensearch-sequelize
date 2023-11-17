import { Model } from "../model/Model";
import { DeepPartial } from "../utils/DeepPartial";
import { Op } from "../model/operators";

export type IndexOptions = {
  tableName?: string;
};

export type ModelStatic<M extends Model> = NonConstructor<typeof Model> & {
  new (): M;
};

type NonConstructorKeys<T> = {
  [P in keyof T]: T[P] extends new () => any ? never : P;
}[keyof T];
type NonConstructor<T> = Pick<T, NonConstructorKeys<T>>;

export type InitOptions = DeepPartial<{
  settings: IndexSettings;
  mappings: {
    properties: {
      [key: string]: {
        type: unknown /* TODO */;
      };
    };
  };
  aliases: {
    [key: string]: unknown /* TODO */;
  };
}>;

export type IndexSettings = StaticIndexSettings & DynamicIndexSettings;

export type StaticIndexSettings = {
  index: {
    numberOfShards: number;
    numberOfRoutingShards: number;
    shard: {
      checkOnStartup: boolean | "checksum";
    };
    codec: "default" | "best_compression";
    routingPartitionSize: number;
    softDeletes: { retentionLease: { period: string } };
    loadFixedBitsetFiltersEagerly: boolean;
    hidden: boolean;
  };
};

export type DynamicIndexSettings = {
  index: {
    numberOfReplicas: number;
    autoExpandReplicas: unknown /* TODO */;
    search: { idle: { after: string } };
    refreshInterval: string;
    maxResultWindow: number;
    maxInnerResultWindow: number;
    maxRescoreWindow: number;
    maxDocvalueFieldsSearch: number;
    maxScriptFields: number;
    maxNgramDiff: number;
    maxShingleDiff: number;
    maxRefreshListeners: number;
    analyze: { maxTokenCount: number };
    highlight: { maxAnalyzedOffset: number };
    maxTermsCount: number;
    maxRegexLength: number;
    defaultField: string | string[];
    routing: {
      allocation: { enable: "all" | "primaries" | "new_primaries" | "none" };
      rebalance: { enable: "all" | "primaries" | "replicas" | "none" };
    };
    gcDeletes: string;
    defaultPipeline: string | "_none";
    finalPipeline: string | "_none";
  };
};

export type FindAllOptions<M extends Model> = {
  limit?: number;
  offset?: number;
  where?: WhereType<M>;
};

export type WhereType<M extends Model = Model> = {
  [key in keyof DataValues<M>]?: DataValues<M>[key] | WhereItem;
};

export type WhereItem =
  | ExactWhere
  | FuzzyWhere
  | RangeWhere
  | RegexWhere
  | WildcardWhere;

export type ExactWhere = {
  type: "exact";
  value: string;
};

export type FuzzyWhere = {
  type: "fuzzy";
  value: string;
};

export type RangeWhere = {
  [Op.gt]?: number | string;
  [Op.gte]?: number | string;
  [Op.lt]?: number | string;
  [Op.lte]?: number | string;
  format?: string;
  relation?: "INTERSECTS" | "CONTAINS" | "WITHIN";
  boost?: number;
  timezone?: string;
};

export type RegexWhere = (
  | {
      type: "regex";
      value: string;
    }
  | {
      [Op.regexp]: string;
    }
) & {
  caseInsensitive?: boolean;
  flags?: string;
  maxDeterminizedStates?: number;
  rewrite?:
    | "constant_score"
    | "scoring_boolean"
    | "constant_score_boolean"
    | "top_terms_N"
    | "top_terms_boost_N"
    | "top_terms_blended_freqs_N";
};

export type WildcardWhere = (
  | {
      type: "wildcard";
      value: string;
    }
  | {
      [Op.wildcard]: string;
    }
) & {
  caseInsensitive?: boolean;
  boost?: number;
  rewrite?:
    | "constant_score"
    | "scoring_boolean"
    | "constant_score_boolean"
    | "top_terms_N"
    | "top_terms_boost_N"
    | "top_terms_blended_freqs_N";
};

// | {
//     type: "fuzzy";
//     value: DataValues<M>[key];
//     fuzziness: "auto" | number;
//     fuzzy_transpositions: boolean;
//     fuzzy_max_expansions: number;
//   }
// | { type: "regex" | "wildcard"; value: string };

export type DataValues<M extends Model = Model> = Omit<
  M,
  "_index" | "_id" | "_version" | "_score"
>;

export type CreatedObject<M extends Model> = DataValues<M> & { _id?: string };

export type UpdateObject<M extends Model> = Partial<CreatedObject<M>> & {
  _id: string;
};

export type AnalyzerType =
  | "standard"
  | "simple"
  | "whitespace"
  | "stop"
  | "keyword"
  | "pattern"
  | "language"
  | "fingerprint";
