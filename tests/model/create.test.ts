import { Model, Sequelize, Table } from "../../src";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

const BASE_URL = "baseurl";
const USERNAME = "username";
const PASSWORD = "password";
const TABLE_NAME = "testTableName";
const TABLE_NAME_NONEXISTENT = "testTableNameNonexistent";
const TABLE_NAME_EMPTY = "testTableNameEmpty";

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

@Table({ tableName: TABLE_NAME_NONEXISTENT })
class TestModelNonexistent extends Model {
  stringValue!: string;
  numberValue!: number;
}

@Table({ tableName: TABLE_NAME_EMPTY })
class TestModelEmpty extends Model {}

describe(".create | auth", () => {
  test("correct auth", async () => {
    const index = "index";
    const id = "id";
    const version = "version";

    const mock = new MockAdapter(axios);
    mock
      .onPost(`${BASE_URL}/${TABLE_NAME}/_doc`)
      .reply((config) => {
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
      })
      .onAny()
      .reply(404, "invalid url");

    const result = await TestModel.create({ stringValue: "", numberValue: 0 });
    expect(result).toEqual({ id, index, version });
  });

  test("incorrect auth", async () => {
    const index = "index";
    const id = "id";
    const version = "version";

    const mock = new MockAdapter(axios);
    mock
      .onPost(`${BASE_URL}/${TABLE_NAME}/_doc`)
      .reply((config) => {
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
      })
      .onAny()
      .reply(404, "invalid url");

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

  test("success response (nonexistent index)", async () => {
    const index = "index";
    const id = "id";
    const version = "version";

    const mock = new MockAdapter(axios);
    mock
      .onPost(`${BASE_URL}/${TABLE_NAME_NONEXISTENT}/_doc`)
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

    const result = await TestModelNonexistent.create({
      stringValue: "",
      numberValue: 0,
    });

    expect(result).toEqual({ id, index, version });
  });

  test("success response with fixed id (nonexistent index)", async () => {
    const index = "index";
    const id = "fixed_id";
    const version = "version";

    const mock = new MockAdapter(axios);
    mock
      .onPost(`${BASE_URL}/${TABLE_NAME_NONEXISTENT}/_doc/${id}`)
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

    const result = await TestModelNonexistent.create({
      _id: id,
      stringValue: "",
      numberValue: 0,
    });

    expect(result).toEqual({ id, index, version });
  });

  test("success response (empty model)", async () => {
    const index = "index";
    const id = "id";
    const version = "version";

    const mock = new MockAdapter(axios);
    mock
      .onPost(`${BASE_URL}/${TABLE_NAME_EMPTY}/_doc`)
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

    const result = await TestModelEmpty.create({});

    expect(result).toEqual({ id, index, version });
  });

  test("success response with fixed id (empty model)", async () => {
    const index = "index";
    const id = "fixed_id";
    const version = "version";

    const mock = new MockAdapter(axios);
    mock
      .onPost(`${BASE_URL}/${TABLE_NAME_EMPTY}/_doc/${id}`)
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

    const result = await TestModelEmpty.create({
      _id: id,
    });

    expect(result).toEqual({ id, index, version });
  });
});
