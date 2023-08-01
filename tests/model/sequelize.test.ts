import { Model, Table } from "../../src";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

const TABLE_NAME = "testTableName";

@Table({ tableName: TABLE_NAME })
class TestModel extends Model {
  stringValue!: string;
  numberValue!: number;
}

describe("not connected", () => {
  test(".create", async () => {
    const mock = new MockAdapter(axios);
    mock.onAny().reply((config) => {
      return [
        200,
        {
          _index: "",
          _id: "",
          _version: 1,
          result: "created",
          _shards: {
            total: 2,
            successful: 2,
            failed: 0,
          },
          _seq_no: 23,
          _primary_term: 7,
        },
      ];
    });

    await expect(
      TestModel.create({ stringValue: "", numberValue: 0 })
    ).rejects.toThrow("Sequelize not found");
  });

  test(".drop", async () => {
    const mock = new MockAdapter(axios);
    mock.onAny().reply((config) => {
      return [
        200,
        {
          acknowledged: true,
        },
      ];
    });

    await expect(TestModel.drop()).rejects.toThrow("Sequelize not found");
  });
});
