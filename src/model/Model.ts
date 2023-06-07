import { Sequelize } from "../sequelize/Sequelize";
import { ModelStatic } from "../types/model";
import {
  BaseOpensearchError,
  FindByFkError,
  FindByPkResponse,
  InitResponse,
} from "../types/responses";
import { getModelName } from "../utils/metadata";
import axios, { AxiosError } from "axios";
import { convertHit } from "../utils/opensearch";
import { extractMessage } from "../utils/errors";

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

  public static async init<M extends Model>(this: ModelStatic<M>) {
    try {
      const indexName = getModelName(this);
      const ret = await axios.put<InitResponse>(
        `${Model.host}/${indexName}`,
        undefined,
        { auth: Model.auth }
      );

      return { index: ret.data.index };
    } catch (error) {
      if (!(error instanceof AxiosError)) throw error;

      const data = error.response?.data as BaseOpensearchError;
      const message = extractMessage(data);
      throw new Error(message);
    }
  }

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
