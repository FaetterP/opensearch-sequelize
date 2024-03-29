import { Sequelize } from "../sequelize/Sequelize";
import {
  CreatedObject,
  FindAllOptions,
  InitOptions,
  ModelStatic,
  UpdateObject,
} from "../types/model";
import {
  BaseOpensearchError,
  CreateResponse,
  DestroyByPkError404,
  DeleteByPkResponse,
  DropResponse,
  FindAllResponse,
  FindByPkError,
  FindByPkResponse,
  InitResponse,
  UpdateResponse,
  DeleteByQueryResponse,
} from "../types/responses";
import { getModelName } from "../utils/metadata";
import axios, { AxiosError } from "axios";
import { convertHit, convertWhereToQuery } from "../utils/opensearch";
import { extractMessage } from "../utils/errors";
import {
  FindAllRequest,
  InitRequest,
  Query,
  UpdateRequest,
} from "../types/requests";

export class Model {
  public static setSequelize(sequelize: Sequelize) {
    if (Model.sequelize) throw new Error("Sequelize already exists");

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
   * Read more: https://opensearch.org/docs/latest/im-plugin/index-settings/
   */
  public static async init<M extends Model>(
    this: ModelStatic<M>,
    options?: InitOptions
  ) {
    try {
      if (!Model.sequelize) throw new Error("Sequelize not found");

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
            default_pipeline: settingsIndex?.defaultPipeline,
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
      if (error.status === 401 || error.response?.status === 401)
        throw new Error("Unauthorized");

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
      if (!Model.sequelize) throw new Error("Sequelize not found");

      const indexName = getModelName(this);

      await axios.delete<DropResponse>(`${Model.host}/${indexName}`, {
        auth: Model.auth,
      });
    } catch (error) {
      if (!(error instanceof AxiosError)) throw error;
      if (error.status === 401 || error.response?.status === 401)
        throw new Error("Unauthorized");

      const data = error.response?.data as BaseOpensearchError;
      const message = extractMessage(data);
      throw new Error(message);
    }
  }

  /**
   * Save the values as new document.
   *
   * OpenSearch automatically creates an index when you add a document to an index that doesn’t already exist.
   * It also automatically generates an _id if you don’t specify an _id in the request.
   *
   * You can override document using the same id. This will increase its version by 1.
   */
  public static async create<M extends Model>(
    this: ModelStatic<M>,
    values: CreatedObject<M>
  ): Promise<{ index: string; id: string; version: number }> {
    try {
      if (!Model.sequelize) throw new Error("Sequelize not found");

      const { _id, ...data } = values;
      const id = _id ? `/${_id}` : "";

      const indexName = getModelName(this);
      const response = await axios.post<CreateResponse>(
        `${Model.host}/${indexName}/_doc${id}`,
        data,
        { auth: Model.auth }
      );

      return {
        index: response.data._index,
        id: response.data._id,
        version: response.data._version,
      };
    } catch (error) {
      if (!(error instanceof AxiosError)) throw error;
      if (error.status === 401 || error.response?.status === 401)
        throw new Error("Unauthorized");

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
      if (error.status === 401 || error.response?.status === 401)
        throw new Error("Unauthorized");

      const notFoundIdData = error.response?.data as FindByPkError;
      if ((error.status === 404, notFoundIdData.found === false)) {
        return undefined;
      }

      const baseErrorData = error.response?.data as BaseOpensearchError;
      const message = extractMessage(baseErrorData);
      throw new Error(message);
    }
  }

  public static async findAll<M extends Model>(
    this: ModelStatic<M>,
    options?: FindAllOptions<M>
  ): Promise<M[]> {
    try {
      if (!Model.sequelize) throw new Error("Sequelize not found");

      let query: Query | undefined = undefined;
      if (options?.where) {
        query = convertWhereToQuery(options?.where);
      }

      const data: FindAllRequest = {
        from: options?.offset,
        size: options?.limit,
        query,
      };

      const indexName = getModelName(this);
      const response = await axios.get<FindAllResponse>(
        `${Model.host}/${indexName}/_search`,
        { auth: Model.auth, data }
      );

      return response.data.hits.hits.map((hit) => convertHit(hit));
    } catch (error) {
      if (!(error instanceof AxiosError)) throw error;
      if (error.status === 401 || error.response?.status === 401)
        throw new Error("Unauthorized");

      const message = extractMessage(error.response?.data);
      throw new Error(message);
    }
  }

  /**
   * Update document fields with new values.
   *
   * This method overwrites only those fields that were passed to values.
   * If you pass an object with new fields, Opensearch will merge the old object with the new one by overwriting the old values and adding new ones.
   * ```
   * { field1: "value1", field2: 123 } + { field2: 456, field3: "new value" } =
   * = { field1: "value1", field2: 456, field3: "new value" }
   * ```
   * To **replace** an object with a new one, use the **create** method.
   *
   * @param values New document values. Id is required. It used to determine which document to change.
   */
  public static async update<M extends Model>(
    this: ModelStatic<M>,
    values: UpdateObject<M>
  ): Promise<{ index: string; id: string; result: "updated" }> {
    try {
      if (!Model.sequelize) throw new Error("Sequelize not found");

      const { _id, ...data } = values;
      const body: UpdateRequest = {
        doc: data,
      };

      const indexName = getModelName(this);
      const response = await axios.post<UpdateResponse>(
        `${Model.host}/${indexName}/_update/${_id}`,
        body,
        { auth: Model.auth }
      );

      return {
        index: response.data._index,
        id: response.data._id,
        result: response.data.result,
      };
    } catch (error) {
      if (!(error instanceof AxiosError)) throw error;
      if (error.status === 401 || error.response?.status === 401)
        throw new Error("Unauthorized");

      const message = extractMessage(error.response?.data);
      throw new Error(message);
    }
  }

  /**
   * Delete document from index by its id.
   */
  public static async destroyByPk<M extends Model>(
    this: ModelStatic<M>,
    id: string
  ): Promise<{ index: string; id: string; result: "deleted" | "not_found" }> {
    try {
      if (!Model.sequelize) throw new Error("Sequelize not found");

      const indexName = getModelName(this);
      const response = await axios.delete<DeleteByPkResponse>(
        `${Model.host}/${indexName}/_doc/${id}`,
        { auth: Model.auth }
      );

      return {
        index: response.data._index,
        id: response.data._id,
        result: response.data.result,
      };
    } catch (error) {
      if (!(error instanceof AxiosError)) throw error;
      if (error.status === 401 || error.response?.status === 401)
        throw new Error("Unauthorized");

      if (error.status === 404) {
        const error404 = error.response?.data as DestroyByPkError404;
        return {
          index: error404._index,
          id: error404._id,
          result: error404.result,
        };
      }

      const message = extractMessage(error.response?.data);
      throw new Error(message);
    }
  }

  /**
   * Delete all documents from index.
   *
   * @returns count of deleted documents.
   */
  public static async truncate<M extends Model>(
    this: ModelStatic<M>
  ): Promise<{ count: number }> {
    try {
      if (!Model.sequelize) throw new Error("Sequelize not found");

      const indexName = getModelName(this);
      const response = await axios.post<DeleteByQueryResponse>(
        `${Model.host}/${indexName}/_delete_by_query`,
        {
          query: {
            match_all: {},
          },
        },
        { auth: Model.auth }
      );

      return {
        count: response.data.deleted,
      };
    } catch (error) {
      if (!(error instanceof AxiosError)) throw error;
      if (error.status === 401 || error.response?.status === 401)
        throw new Error("Unauthorized");

      const message = extractMessage(error.response?.data);
      throw new Error(message);
    }
  }

  /**
   * Raw POST request. Use this if the other methods don't provide the necessary functionality.
   *
   * `TestModel.queryPost("_doc/1", {...values})` is POST request to host/index/`_doc/1` with body {...values}.
   *
   * @returns raw response *data*.
   */
  public static async queryPost(url: string, body: any) {
    if (!Model.sequelize) throw new Error("Sequelize not found");

    const indexName = getModelName(this);
    const response = await axios.post(
      `${Model.host}/${indexName}/${url}`,
      body,
      { auth: Model.auth }
    );

    return response.data;
  }

  /**
   * Raw PUT request. Use this if the other methods don't provide the necessary functionality.
   *
   * `TestModel.queryPut("_doc/1", {...values})` is PUT request to host/index/`_doc/1` with body {...values}.
   *
   * @returns raw response *data*.
   */
  public static async queryPut(url: string, body: any) {
    if (!Model.sequelize) throw new Error("Sequelize not found");

    const indexName = getModelName(this);
    const response = await axios.put(
      `${Model.host}/${indexName}/${url}`,
      body,
      { auth: Model.auth }
    );

    return response.data;
  }

  /**
   * Raw GET request. Use this if the other methods don't provide the necessary functionality.
   *
   * `TestModel.queryGet("_doc/1", {...values})` is GET request to host/index/`_doc/1` with body {...values}.
   *
   * @returns raw response *data*.
   */
  public static async queryGet(url: string, data: any) {
    if (!Model.sequelize) throw new Error("Sequelize not found");

    const indexName = getModelName(this);
    const response = await axios.get(`${Model.host}/${indexName}/${url}`, {
      auth: Model.auth,
      data,
    });

    return response.data;
  }

  /**
   * Raw DELETE request. Use this if the other methods don't provide the necessary functionality.
   *
   * `TestModel.queryDelete("_doc/1", {...values})` is DELETE request to host/index/`_doc/1` with body {...values}.
   *
   * @returns raw response *data*.
   */
  public static async queryDelete(url: string, data: any) {
    if (!Model.sequelize) throw new Error("Sequelize not found");

    const indexName = getModelName(this);
    const response = await axios.delete(`${Model.host}/${indexName}/${url}`, {
      auth: Model.auth,
      data,
    });

    return response.data;
  }
}
