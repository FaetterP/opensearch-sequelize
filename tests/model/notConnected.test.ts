import { Model, Sequelize, Table } from "../../src";
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
    mock.onAny().reply(404, "invalid url");

    await expect(
      TestModel.create({ stringValue: "", numberValue: 0 })
    ).rejects.toThrow("Sequelize not found");
  });

  test(".drop", async () => {
    const mock = new MockAdapter(axios);
    mock.onAny().reply(404, "invalid url");

    await expect(TestModel.drop()).rejects.toThrow("Sequelize not found");
  });

  test(".findByPk", async () => {
    const mock = new MockAdapter(axios);
    mock.onAny().reply(404, "invalid url");

    await expect(TestModel.findByPk("")).rejects.toThrow("Sequelize not found");
  });

  test(".init", async () => {
    const mock = new MockAdapter(axios);
    mock.onAny().reply(404, "invalid url");

    await expect(TestModel.init()).rejects.toThrow("Sequelize not found");
  });

  test(".queryGet", async () => {
    const mock = new MockAdapter(axios);
    mock.onAny().reply(404, "invalid url");

    await expect(TestModel.queryGet("", {})).rejects.toThrow(
      "Sequelize not found"
    );
  });

  test(".queryPut", async () => {
    const mock = new MockAdapter(axios);
    mock.onAny().reply(404, "invalid url");

    await expect(TestModel.queryPut("", {})).rejects.toThrow(
      "Sequelize not found"
    );
  });

  test(".queryPost", async () => {
    const mock = new MockAdapter(axios);
    mock.onAny().reply(404, "invalid url");

    await expect(TestModel.queryPost("", {})).rejects.toThrow(
      "Sequelize not found"
    );
  });

  test(".queryDelete", async () => {
    const mock = new MockAdapter(axios);
    mock.onAny().reply(404, "invalid url");

    await expect(TestModel.queryDelete("", {})).rejects.toThrow(
      "Sequelize not found"
    );
  });

  test(".truncate", async () => {
    const mock = new MockAdapter(axios);
    mock.onAny().reply(404, "invalid url");

    await expect(TestModel.truncate()).rejects.toThrow("Sequelize not found");
  });
});
