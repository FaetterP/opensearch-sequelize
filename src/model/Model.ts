import { Sequelize } from "../sequelize/Sequelize";
import { ModelStatic } from "../types/model";
import { FindByPkResponse } from "../types/responses";
import { getModelName } from "../utils/metadata";
import axios from "axios";

export class Model {
  public static sequelize?: Sequelize;

  public _index!: string;
  public _id!: string;
  public _version!: number;
  public _score?: number;

  public static async findByPk<M extends Model>(
    this: ModelStatic<M>,
    id: string
  ): Promise<M | undefined> {
    try {
      if (!Model.sequelize) throw new Error("Sequelize not found");

      const indexName = getModelName(this);
      const { username, password } = Model.sequelize.options;
      const response = await axios.get<FindByPkResponse<M>>(
        `${Model.sequelize.options.host}/${indexName}/_doc/${id}`,
        {
          auth: {
            username,
            password,
          },
        }
      );

      if (!response.data.found) return;

      const { _id, _index, _version, _source } = response.data;
      return {
        ..._source,
        _id,
        _index,
        _version,
      };
    } catch (error) {
      console.log(error);
    }
  }
}
