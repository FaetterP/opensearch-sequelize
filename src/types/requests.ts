import { Model } from "../model/Model";
import { DeepPartial } from "../utils/DeepPartial";
import { DataValues } from "./model";

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
    codec: "default" | "best_compression" | "zstd" | "zstd_no_dict";
    "codec.compression_level": number;
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
    default_field: string | string[];
    routing: {
      allocation: { enable: "all" | "primaries" | "new_primaries" | "none" };
      rebalance: { enable: "all" | "primaries" | "replicas" | "none" };
    };
    gc_deletes: string;
    default_pipeline: string | "_none";
    final_pipeline: string | "_none";
  };
};

export type FindAllRequest = {
  from?: number;
  size?: number;
  query?: {
    bool?: {
      must?: Query | Query[];
      must_not?: Query | Query[];
      should?: Query | Query[];
      filter?: any;
    };
    match?: Record<string, string | number | boolean>;
  };
};

export type Query<M extends Model = Model> = {
  match?: {
    [key in keyof DataValues<M>]:
      | DataValues<M>[key]
      | {
          query: "wind";
          allow_leading_wildcard?: boolean;
          analyze_wildcard?: boolean;

          fuzziness?: "AUTO" | number;
          fuzzy_transpositions?: boolean;
          fuzzy_max_expansions?: number;

          boost?: number;
          enable_position_increments?: boolean;
          fields?: string[];
          flags?: string;
          lenient?: boolean;
          low_freq_operator?: "and" | "or";
          max_determinized_states?: number;
          max_expansions?: number;
          minimum_should_match?: number;
          operator?: "and" | "or";
          phrase_slop?: number;
          prefix_length?: number;
          quote_field_suffix?: string;
          rewrite?:
            | "constant_score"
            | "scoring_boolean"
            | "constant_score_boolean"
            | "top_terms_N"
            | "top_terms_boost_N"
            | "top_terms_blended_freqs_N";
          slop?: number;
          tie_breaker?: number;
          time_zone?: string;
          type?:
            | "best_fields"
            | "most_fields"
            | "cross_fields"
            | "phrase"
            | "phrase_prefix";
          zero_terms_query?: "none" | "all";
        };
  };

  match_all?: { [key: string]: never };

  bool?: {
    must?: Query | Query[];
    must_not?: Query | Query[];
    should?: Query | Query[];
    filter?: Query;
  };

  range?: {
    [key in keyof DataValues<M>]?: {
      gt?: string | number;
      lt?: string | number;
      gte?: string | number;
      lte?: string | number;
      format?: string;
    };
  };
};

export type UpdateRequest =
  | {
      doc: any;
    }
  | {
      script: {
        source: string;
      };
    };
