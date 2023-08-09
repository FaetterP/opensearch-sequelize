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

describe(".truncate | auth", () => {
  test("success | correct auth", async () => {
    const count = 10;

    const mock = new MockAdapter(axios);
    mock
      .onPost(`${BASE_URL}/${TABLE_NAME}/_delete_by_query`)
      .reply((config) => {
        const auth = config.auth;

        if (auth?.username !== USERNAME || auth?.password !== PASSWORD)
          return [401, "Unauthorized"];

        return [
          200,
          {
            took: 94,
            timed_out: false,
            total: 0,
            deleted: count,
            batches: 0,
            version_conflicts: 0,
            noops: 0,
            retries: {
              bulk: 0,
              search: 0,
            },
            throttled_millis: 0,
            requests_per_second: -1,
            throttled_until_millis: 0,
            failures: [],
          },
        ];
      })
      .onAny()
      .reply(404, "invalid url");

    await expect(TestModel.truncate()).resolves.toEqual({ count });
  });

  test("error | incorrect auth", async () => {
    const mock = new MockAdapter(axios);
    mock
      .onPost(`${BASE_URL}/${TABLE_NAME}/_delete_by_query`)
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
            took: 94,
            timed_out: false,
            total: 0,
            deleted: 10,
            batches: 0,
            version_conflicts: 0,
            noops: 0,
            retries: {
              bulk: 0,
              search: 0,
            },
            throttled_millis: 0,
            requests_per_second: -1,
            throttled_until_millis: 0,
            failures: [],
          },
        ];
      })
      .onAny()
      .reply(404, "invalid url");

    await expect(TestModel.truncate()).rejects.toThrow("Unauthorized");
  });
});

describe(".truncate | success", () => {
  test("success response", async () => {
    const count = 10;

    const mock = new MockAdapter(axios);
    mock
      .onPost(`${BASE_URL}/${TABLE_NAME}/_delete_by_query`)
      .reply(200, {
        took: 94,
        timed_out: false,
        total: 0,
        deleted: count,
        batches: 0,
        version_conflicts: 0,
        noops: 0,
        retries: {
          bulk: 0,
          search: 0,
        },
        throttled_millis: 0,
        requests_per_second: -1,
        throttled_until_millis: 0,
        failures: [],
      })
      .onAny()
      .reply(404, "invalid url");

    await expect(TestModel.truncate()).resolves.toEqual({ count });
  });

  test("success response (nonexistent index)", async () => {
    const mock = new MockAdapter(axios);
    mock
      .onPost(`${BASE_URL}/${TABLE_NAME_NONEXISTENT}/_delete_by_query`)
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

    await expect(TestModelNonexistent.truncate()).rejects.toThrow(
      `no such index [${TABLE_NAME_NONEXISTENT}]`
    );
  });
});
