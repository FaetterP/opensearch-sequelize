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

describe(".findByPk | auth", () => {
  test("correct auth", async () => {
    const id = "id";
    const version = 4;
    const stringValue = "stringValue";
    const numberValue = 789;

    const mock = new MockAdapter(axios);
    mock
      .onGet(`${BASE_URL}/${TABLE_NAME}/_doc/${id}`)
      .reply((config) => {
        const auth = config.auth;

        if (auth?.username !== USERNAME || auth?.password !== PASSWORD)
          return [401, "Unauthorized"];

        return [
          200,
          {
            _index: TABLE_NAME,
            _id: id,
            _version: version,
            _seq_no: 17,
            _primary_term: 3,
            found: true,
            _source: {
              stringValue,
              numberValue,
            },
          },
        ];
      })
      .onAny()
      .reply(404, "invalid url");

    const result = await TestModel.findByPk(id);
    expect(result).toEqual({
      _id: id,
      _index: TABLE_NAME,
      _version: version,
      _score: undefined,
      stringValue,
      numberValue,
    });
  });

  test("incorrect auth", async () => {
    const id = "id";
    const version = 4;
    const stringValue = "stringValue";
    const numberValue = 789;

    const mock = new MockAdapter(axios);
    mock
      .onGet(`${BASE_URL}/${TABLE_NAME}/_doc/${id}`)
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
            _index: TABLE_NAME,
            _id: id,
            _version: version,
            _seq_no: 17,
            _primary_term: 3,
            found: true,
            _source: {
              stringValue,
              numberValue,
            },
          },
        ];
      })
      .onAny()
      .reply(404, "invalid url");

    await expect(TestModel.findByPk(id)).rejects.toThrow("Unauthorized");
  });
});

describe(".findByPk | success", () => {
  test("success response", async () => {
    const id = "id";
    const version = 4;
    const stringValue = "stringValue";
    const numberValue = 789;

    const mock = new MockAdapter(axios);
    mock
      .onGet(`${BASE_URL}/${TABLE_NAME}/_doc/${id}`)
      .reply(200, {
        _index: TABLE_NAME,
        _id: id,
        _version: version,
        _seq_no: 17,
        _primary_term: 3,
        found: true,
        _source: {
          stringValue,
          numberValue,
        },
      })
      .onAny()
      .reply(404, "invalid url");

    const result = await TestModel.findByPk(id);

    expect(result).toEqual({
      _id: id,
      _version: version,
      _index: TABLE_NAME,
      _score: undefined,
      stringValue,
      numberValue,
    });
  });

  test("nonexistent id", async () => {
    const id = "nonexistent_id";

    const mock = new MockAdapter(axios);
    mock
      .onGet(`${BASE_URL}/${TABLE_NAME}/_doc/${id}`)
      .reply(404, {
        _index: TABLE_NAME,
        _id: id,
        found: false,
      })
      .onAny()
      .reply(404, "invalid url");

    await expect(TestModel.findByPk(id)).resolves.toBe(undefined);
  });

  test("success response (nonexistent index)", async () => {
    const id = "id";

    const mock = new MockAdapter(axios);
    mock
      .onGet(`${BASE_URL}/${TABLE_NAME_NONEXISTENT}/_doc/${id}`)
      .reply(404, {
        error: {
          root_cause: [
            {
              type: "index_not_found_exception",
              reason: `no such index [${TABLE_NAME_NONEXISTENT}]`,
              index: TABLE_NAME_NONEXISTENT,
              "resource.id": TABLE_NAME_NONEXISTENT,
              "resource.type": "index_expression",
              index_uuid: "_na_",
            },
          ],
          type: "index_not_found_exception",
          reason: `no such index [${TABLE_NAME_NONEXISTENT}]`,
          index: TABLE_NAME_NONEXISTENT,
          "resource.id": TABLE_NAME_NONEXISTENT,
          "resource.type": "index_expression",
          index_uuid: "_na_",
        },
        status: 404,
      })
      .onAny()
      .reply(404, "invalid url");

    await expect(TestModelNonexistent.findByPk(id)).rejects.toThrow(
      `no such index [${TABLE_NAME_NONEXISTENT}]`
    );
  });

  test("success response (empty model)", async () => {
    const id = "id";
    const version = 4;

    const mock = new MockAdapter(axios);
    mock
      .onGet(`${BASE_URL}/${TABLE_NAME_EMPTY}/_doc/${id}`)
      .reply(200, {
        _index: TABLE_NAME_EMPTY,
        _id: id,
        _version: version,
        _seq_no: 17,
        _primary_term: 3,
        found: true,
        _source: {},
      })
      .onAny()
      .reply(404, "invalid url");

    const result = await TestModelEmpty.findByPk(id);

    expect(result).toEqual({
      _id: id,
      _index: TABLE_NAME_EMPTY,
      _version: version,
      _score: undefined,
    });
  });
});
