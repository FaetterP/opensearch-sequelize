import { Sequelize } from "../sequelize/Sequelize";
import { InitOptions, ModelStatic } from "../types/model";
import {
  BaseOpensearchError,
  DropResponse,
  FindByFkError,
  FindByPkResponse,
  InitResponse,
} from "../types/responses";
import { getModelName } from "../utils/metadata";
import axios, { AxiosError } from "axios";
import { convertHit } from "../utils/opensearch";
import { extractMessage } from "../utils/errors";
import { InitRequest } from "../types/requests";

export class Model {
  public static setSequelize(sequelize: Sequelize) {
    if (Model.sequelize) throw new Error("sequelize already exists");

    Model.sequelize = sequelize;
    Model.host = sequelize.options.host;
    Model.auth = {
      username: sequelize.options.username,
      password: sequelize.options.password,
    };
  }

  private static sequelize?: Sequelize;
  private static host = "";
  private static auth = {
    username: "",
    password: "",
  };

  public _index!: string;
  public _id!: string;
  public _version!: number;
  public _score?: number;

  /**
   * Create index with static or dynamic options.
   *
   * Read more: https://opensearch.org/docs/latest/api-reference/index-apis/create-index/
   */
  public static async init<M extends Model>(
    this: ModelStatic<M>,
    options?: InitOptions
  ) {
    try {
      const settingsIndex = options?.settings?.index;
      const body: InitRequest = {
        settings: {
          index: {
            number_of_shards: settingsIndex?.numberOfShards,
            number_of_routing_shards: settingsIndex?.numberOfRoutingShards,
            shard: {
              check_on_startup: settingsIndex?.shard?.checkOnStartup,
            },
            codec: settingsIndex?.codec,
            routing_partition_size: settingsIndex?.routingPartitionSize,
            soft_deletes: {
              retention_lease: {
                period: settingsIndex?.softDeletes?.retentionLease?.period,
              },
            },
            load_fixed_bitset_filters_eagerly:
              settingsIndex?.loadFixedBitsetFiltersEagerly,
            hidden: settingsIndex?.hidden,
            number_of_replicas: settingsIndex?.numberOfReplicas,
            auto_expand_replicas: settingsIndex?.autoExpandReplicas,
            search: { idle: { after: settingsIndex?.search?.idle?.after } },
            refresh_interval: settingsIndex?.refreshInterval,
            max_result_window: settingsIndex?.maxResultWindow,
            max_inner_result_window: settingsIndex?.maxInnerResultWindow,
            max_rescore_window: settingsIndex?.maxRescoreWindow,
            max_docvalue_fields_search: settingsIndex?.maxDocvalueFieldsSearch,
            max_script_fields: settingsIndex?.maxScriptFields,
            max_ngram_diff: settingsIndex?.maxNgramDiff,
            max_shingle_diff: settingsIndex?.maxShingleDiff,
            max_refresh_listeners: settingsIndex?.maxRefreshListeners,
            analyze: { max_token_count: settingsIndex?.analyze?.maxTokenCount },
            highlight: {
              max_analyzed_offset: settingsIndex?.highlight?.maxAnalyzedOffset,
            },
            max_terms_count: settingsIndex?.maxTermsCount,
            max_regex_length: settingsIndex?.maxRegexLength,
            default_field: settingsIndex?.defaultField,
            routing: {
              allocation: {
                enable: settingsIndex?.routing?.allocation?.enable,
              },
              rebalance: { enable: settingsIndex?.routing?.rebalance?.enable },
            },
            gc_deletes: settingsIndex?.gcDeletes,
            default_pipeline: settingsIndex?.defaultField,
            final_pipeline: settingsIndex?.finalPipeline,
          },
        },
        mappings: options?.mappings,
        aliases: options?.aliases,
      };

      const indexName = getModelName(this);
      const response = await axios.put<InitResponse>(
        `${Model.host}/${indexName}`,
        body,
        { auth: Model.auth }
      );

      return { index: response.data.index };
    } catch (error) {
      if (!(error instanceof AxiosError)) throw error;

      const data = error.response?.data as BaseOpensearchError;
      const message = extractMessage(data);
      throw new Error(message);
    }
  }

  /**
   * Drop the index represented by this Model.
   */
  public static async drop<M extends Model>(this: ModelStatic<M>) {
    try {
      const indexName = getModelName(this);
      const ret = await axios.delete<DropResponse>(
        `${Model.host}/${indexName}`,
        { auth: Model.auth }
      );
    } catch (error) {
      if (!(error instanceof AxiosError)) throw error;

      const data = error.response?.data as BaseOpensearchError;
      const message = extractMessage(data);
      throw new Error(message);
    }
  }

  /**
   * Search for a single instance by its _id.
   * @param id Id of the document.
   * @returns Found document.
   */
  public static async findByPk<M extends Model>(
    this: ModelStatic<M>,
    id: string
  ): Promise<M | undefined> {
    try {
      if (!Model.sequelize) throw new Error("Sequelize not found");

      const indexName = getModelName(this);
      const response = await axios.get<FindByPkResponse<M>>(
        `${Model.host}/${indexName}/_doc/${id}`,
        { auth: Model.auth }
      );

      return convertHit<M>(response.data);
    } catch (error) {
      if (!(error instanceof AxiosError)) throw error;

      const data = error.response?.data as FindByFkError;
      if ((error.status === 404, data.found === false)) {
        return undefined;
      }

      throw new Error(error.message);
    }
  }
}
