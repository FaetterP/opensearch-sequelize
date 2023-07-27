import { Model, Sequelize, Table } from "../../src";
import axios, { AxiosError } from "axios";
import MockAdapter from "axios-mock-adapter";

const BASE_URL = "baseurl";
const USERNAME = "username";
const PASSWORD = "password";
const TABLE_NAME = "testTableName";

new Sequelize({
  host: BASE_URL,
  username: USERNAME,
  password: PASSWORD,
});

@Table({ tableName: TABLE_NAME })
class TestModel extends Model {
  stringValue!: string;
  numberValue!: number;
}

describe(".create | auth", () => {
  test("correct auth", async () => {
    const index = "index";
    const id = "id";
    const version = "version";

    const mock = new MockAdapter(axios);
    mock.onAny().reply((config) => {
      const auth = config.auth;

      if (auth?.username !== USERNAME || auth?.password !== PASSWORD)
        return [401, "Unauthorized"];

      return [
        200,
        {
          _index: index,
          _id: id,
          _version: version,
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

    const result = await TestModel.create({ stringValue: "", numberValue: 0 });
    expect(result).toEqual({ id, index, version });
  });

  test("incorrect auth", async () => {
    const index = "index";
    const id = "id";
    const version = "version";

    const mock = new MockAdapter(axios);
    mock.onAny().reply((config) => {
      const auth = config.auth;

      if (
        auth?.username !== "correct username" ||
        auth?.password !== "correct password"
      )
        return [401, "Unauthorized"];

      return [
        200,
        {
          _index: index,
          _id: id,
          _version: version,
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
    ).rejects.toThrow("Unauthorized");
  });
});

describe(".create | success", () => {
  test("success response", async () => {
    const index = "index";
    const id = "id";
    const version = "version";

    const mock = new MockAdapter(axios);
    mock
      .onPost(`${BASE_URL}/${TABLE_NAME}/_doc`)
      .reply(200, {
        _index: index,
        _id: id,
        _version: version,
        result: "created",
        _shards: {
          total: 2,
          successful: 2,
          failed: 0,
        },
        _seq_no: 23,
        _primary_term: 7,
      })
      .onAny()
      .reply(404, "invalid url");

    const result = await TestModel.create({ stringValue: "", numberValue: 0 });

    expect(result).toEqual({ id, index, version });
  });

  test("success response with fixed id", async () => {
    const index = "index";
    const id = "fixed_id";
    const version = "version";

    const mock = new MockAdapter(axios);
    mock
      .onPost(`${BASE_URL}/${TABLE_NAME}/_doc/${id}`)
      .reply(200, {
        _index: index,
        _id: id,
        _version: version,
        result: "created",
        _shards: {
          total: 2,
          successful: 2,
          failed: 0,
        },
        _seq_no: 23,
        _primary_term: 7,
      })
      .onAny()
      .reply(404, "invalid url");

    const result = await TestModel.create({
      _id: id,
      stringValue: "",
      numberValue: 0,
    });

    expect(result).toEqual({ id, index, version });
  });
});
