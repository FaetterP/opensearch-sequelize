import { Model } from "../model/Model";
import { DeepPartial } from "../utils/DeepPartial";

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
    defaultField: string /* TODO */;
    routing: {
      allocation: { enable: unknown } /* TODO */;
      rebalance: { enable: "all" | "primaries" | "replicas" | "none" };
    };
    gcDeletes: string;
    defaultPipeline: unknown /* TODO */;
    finalPipeline: unknown /* TODO */;
  };
};

export type FindAllOptions = {
  limit?: number;
  offset?: number;
};

export type CreatedObject<M extends Model> = Omit<
  M,
  "_index" | "_id" | "_version" | "_score"
> & { _id?: string };
