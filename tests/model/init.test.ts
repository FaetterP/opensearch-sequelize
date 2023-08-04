import { Model, Sequelize, Table } from "../../src";
import axios from "axios";
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

describe(".init | auth", () => {
  test("success | correct auth", async () => {
    const mock = new MockAdapter(axios);
    mock
      .onPut(`${BASE_URL}/${TABLE_NAME}`)
      .reply((config) => {
        const auth = config.auth;

        if (auth?.username !== USERNAME || auth?.password !== PASSWORD)
          return [401, "Unauthorized"];

        return [
          200,
          {
            acknowledged: true,
            shards_acknowledged: true,
            index: TABLE_NAME,
          },
        ];
      })
      .onAny()
      .reply(404, "invalid url");

    const result = await TestModel.init();
    expect(result).toEqual({ index: TABLE_NAME });
  });

  test("error | incorrect auth", async () => {
    const mock = new MockAdapter(axios);
    mock
      .onPut(`${BASE_URL}/${TABLE_NAME}`)
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
            acknowledged: true,
            shards_acknowledged: true,
            index: TABLE_NAME,
          },
        ];
      })
      .onAny()
      .reply(404, "invalid url");

    await expect(TestModel.init()).rejects.toThrow("Unauthorized");
  });
});

describe(".init | success", () => {
  test("success | empty response", async () => {
    const mock = new MockAdapter(axios);
    mock
      .onPut(`${BASE_URL}/${TABLE_NAME}`)
      .reply(200, {
        acknowledged: true,
        shards_acknowledged: true,
        index: TABLE_NAME,
      })
      .onAny()
      .reply(404, "invalid url");

    const result = await TestModel.init({});

    expect(result).toEqual({
      index: TABLE_NAME,
    });
  });

  test("error | not create existed index", async () => {
    const indexId = "hcQE_TLjQAWHwcoQ_nQ0ww";
    const mock = new MockAdapter(axios);
    mock
      .onPut(`${BASE_URL}/${TABLE_NAME}`)
      .reply(400, {
        error: {
          root_cause: [
            {
              type: "resource_already_exists_exception",
              reason: `index [${TABLE_NAME}/${indexId}] already exists`,
              index: TABLE_NAME,
              index_uuid: indexId,
            },
          ],
          type: "resource_already_exists_exception",
          reason: `index [${TABLE_NAME}/${indexId}] already exists`,
          index: TABLE_NAME,
          index_uuid: indexId,
        },
        status: 400,
      })
      .onAny()
      .reply(404, "invalid url");

    await expect(TestModel.init()).rejects.toThrow(
      `index [${TABLE_NAME}/${indexId}] already exists`
    );
  });
});
