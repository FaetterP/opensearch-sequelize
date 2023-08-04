import { Model, Sequelize, Table } from "../../src";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { InitRequest } from "../../src/types/requests";

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

  test("error | number_of_shards not number", async () => {
    const numberOfShards = "string_value";
    const mock = new MockAdapter(axios);
    mock
      .onPut(`${BASE_URL}/${TABLE_NAME}`)
      .reply((config) => {
        const body = JSON.parse(config.data) as InitRequest;
        if (
          body.settings?.index?.number_of_shards === (numberOfShards as any)
        ) {
          return [
            400,
            {
              error: {
                root_cause: [
                  {
                    type: "illegal_argument_exception",
                    reason: `Failed to parse value [${numberOfShards}] for setting [index.number_of_shards]`,
                  },
                ],
                type: "illegal_argument_exception",
                reason: `Failed to parse value [${numberOfShards}] for setting [index.number_of_shards]`,
                caused_by: {
                  type: "number_format_exception",
                  reason: `For input string: "${numberOfShards}"`,
                },
              },
              status: 400,
            },
          ];
        }

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

    await expect(
      TestModel.init({
        settings: { index: { numberOfShards: numberOfShards as any } },
      })
    ).rejects.toThrow(
      `Failed to parse value [${numberOfShards}] for setting [index.number_of_shards]`
    );
  });

  test("error | number_of_shards is null", async () => {
    const numberOfShards = null;
    const mock = new MockAdapter(axios);
    mock
      .onPut(`${BASE_URL}/${TABLE_NAME}`)
      .reply((config) => {
        const body = JSON.parse(config.data) as InitRequest;
        if (
          body.settings?.index?.number_of_shards === (numberOfShards as any)
        ) {
          return [
            500,
            {
              error: {
                root_cause: [
                  {
                    type: "illegal_state_exception",
                    reason:
                      "you must set the number of shards before setting/reading primary terms",
                  },
                ],
                type: "illegal_state_exception",
                reason:
                  "you must set the number of shards before setting/reading primary terms",
              },
              status: 500,
            },
          ];
        }

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

    await expect(
      TestModel.init({
        settings: { index: { numberOfShards: numberOfShards as any } },
      })
    ).rejects.toThrow(
      "you must set the number of shards before setting/reading primary terms"
    );
  });

  test("error | number_of_shards is negative number", async () => {
    const numberOfShards = -1;
    const mock = new MockAdapter(axios);
    mock
      .onPut(`${BASE_URL}/${TABLE_NAME}`)
      .reply((config) => {
        const body = JSON.parse(config.data) as InitRequest;
        if (body.settings?.index?.number_of_shards === numberOfShards) {
          return [
            500,
            {
              error: {
                root_cause: [
                  {
                    type: "illegal_argument_exception",
                    reason: `Failed to parse value [${numberOfShards}] for setting [index.number_of_shards] must be >= 1`,
                  },
                ],
                type: "illegal_argument_exception",
                reason: `Failed to parse value [${numberOfShards}] for setting [index.number_of_shards] must be >= 1`,
              },
              status: 400,
            },
          ];
        }

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

    await expect(
      TestModel.init({
        settings: { index: { numberOfShards } },
      })
    ).rejects.toThrow(
      `Failed to parse value [${numberOfShards}] for setting [index.number_of_shards] must be >= 1`
    );
  });

  test("error | number_of_shards is zero", async () => {
    const numberOfShards = 0;
    const mock = new MockAdapter(axios);
    mock
      .onPut(`${BASE_URL}/${TABLE_NAME}`)
      .reply((config) => {
        const body = JSON.parse(config.data) as InitRequest;
        if (body.settings?.index?.number_of_shards === numberOfShards) {
          return [
            500,
            {
              error: {
                root_cause: [
                  {
                    type: "illegal_argument_exception",
                    reason: `Failed to parse value [${numberOfShards}] for setting [index.number_of_shards] must be >= 1`,
                  },
                ],
                type: "illegal_argument_exception",
                reason: `Failed to parse value [${numberOfShards}] for setting [index.number_of_shards] must be >= 1`,
              },
              status: 400,
            },
          ];
        }

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

    await expect(
      TestModel.init({
        settings: { index: { numberOfShards } },
      })
    ).rejects.toThrow(
      `Failed to parse value [${numberOfShards}] for setting [index.number_of_shards] must be >= 1`
    );
  });

  test("error | check_on_startup is incorrect", async () => {
    const checkOnStartup = "incorrect";
    const mock = new MockAdapter(axios);
    mock
      .onPut(`${BASE_URL}/${TABLE_NAME}`)
      .reply((config) => {
        const body = JSON.parse(config.data) as InitRequest;
        if (body.settings?.index?.shard?.check_on_startup === checkOnStartup as any) {
          return [
            400,
            {
              error: {
                root_cause: [
                  {
                    type: "illegal_argument_exception",
                    reason: `unknown value for [index.shard.check_on_startup] must be one of [true, false, checksum] but was: ${checkOnStartup}`,
                  },
                ],
                type: "illegal_argument_exception",
                reason: `unknown value for [index.shard.check_on_startup] must be one of [true, false, checksum] but was: ${checkOnStartup}`,
              },
              status: 400,
            },
          ];
        }

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

    await expect(
      TestModel.init({
        settings: { index: { shard: { checkOnStartup: checkOnStartup as any } } },
      })
    ).rejects.toThrow(
      `unknown value for [index.shard.check_on_startup] must be one of [true, false, checksum] but was: ${checkOnStartup}`
    );
  });
});
