import { DeepPartial } from "../utils/DeepPartial";

export type InitRequest = DeepPartial<{
  settings: IndexSettingsRequest;
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

export type IndexSettingsRequest = StaticIndexSettingsRequest &
  DynamicIndexSettingsRequest;

export type StaticIndexSettingsRequest = {
  index: {
    number_of_shards: number;
    number_of_routing_shards: number;
    shard: {
      check_on_startup: boolean | "checksum";
    };
    codec: "default" | "best_compression";
    routing_partition_size: number;
    soft_deletes: { retention_lease: { period: string } };
    load_fixed_bitset_filters_eagerly: boolean;
    hidden: boolean;
  };
};

export type DynamicIndexSettingsRequest = {
  index: {
    number_of_replicas: number;
    auto_expand_replicas: unknown /* TODO */;
    search: { idle: { after: string } };
    refresh_interval: string;
    max_result_window: number;
    max_inner_result_window: number;
    max_rescore_window: number;
    max_docvalue_fields_search: number;
    max_script_fields: number;
    max_ngram_diff: number;
    max_shingle_diff: number;
    max_refresh_listeners: number;
    analyze: { max_token_count: number };
    highlight: { max_analyzed_offset: number };
    max_terms_count: number;
    max_regex_length: number;
    default_field: string /* TODO */;
    routing: {
      allocation: { enable: unknown };
      rebalance: { enable: "all" | "primaries" | "replicas" | "none" };
    };
    gc_deletes: string;
    default_pipeline: unknown /* TODO */;
    final_pipeline: unknown /* TODO */;
  };
};

export type FindAllRequest = {
  from?: number;
  size?: number;
};
