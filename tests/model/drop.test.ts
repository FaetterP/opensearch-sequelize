import { Model, Sequelize, Table } from "../../src";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

const BASE_URL = "baseurl";
const USERNAME = "username";
const PASSWORD = "password";
const TABLE_NAME = "testTableName";
const TABLE_NAME_NONEXISTENT = "testTableNameNonexistent";

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

describe(".drop | auth", () => {
  test("correct auth", async () => {
    const mock = new MockAdapter(axios);
    mock
      .onDelete(`${BASE_URL}/${TABLE_NAME}`)
      .reply((config) => {
        const auth = config.auth;

        if (auth?.username !== USERNAME || auth?.password !== PASSWORD)
          return [401, "Unauthorized"];

        return [
          200,
          {
            acknowledged: true,
          },
        ];
      })
      .onAny()
      .reply(404, "invalid url");

    await expect(TestModel.drop()).resolves.toBe(undefined);
  });

  test("incorrect auth", async () => {
    const mock = new MockAdapter(axios);
    mock
      .onDelete(`${BASE_URL}/${TABLE_NAME}`)
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
          },
        ];
      })
      .onAny()
      .reply(404, "invalid url");

    await expect(TestModel.drop()).rejects.toThrow("Unauthorized");
  });
});

describe(".drop | success", () => {
  test("success response", async () => {
    const mock = new MockAdapter(axios);
    mock
      .onDelete(`${BASE_URL}/${TABLE_NAME}`)
      .reply(200, {
        acknowledged: true,
      })
      .onAny()
      .reply(404, "invalid url");

    await expect(TestModel.drop()).resolves.toBe(undefined);
  });

  test("success response (nonexistent index)", async () => {
    const mock = new MockAdapter(axios);
    mock
      .onDelete(`${BASE_URL}/${TABLE_NAME_NONEXISTENT}`)
      .reply(404, {
        error: {
          root_cause: [
            {
              type: "index_not_found_exception",
              reason: `no such index [${TABLE_NAME_NONEXISTENT}]`,
              index: TABLE_NAME_NONEXISTENT,
              "resource.id": TABLE_NAME_NONEXISTENT,
              "resource.type": "index_or_alias",
              index_uuid: "_na_",
            },
          ],
          type: "index_not_found_exception",
          reason: `no such index [${TABLE_NAME_NONEXISTENT}]`,
          index: TABLE_NAME_NONEXISTENT,
          "resource.id": TABLE_NAME_NONEXISTENT,
          "resource.type": "index_or_alias",
          index_uuid: "_na_",
        },
        status: 404,
      })
      .onAny()
      .reply(404, "invalid url");

    await expect(TestModelNonexistent.drop()).rejects.toThrow(
      `no such index [${TABLE_NAME_NONEXISTENT}]`
    );
  });
});
