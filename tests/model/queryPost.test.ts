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

describe(".queryPost | auth", () => {
  test("success | correct auth", async () => {
    const url = "some_url";
    const data = "data";
    const response = "success response";

    const mock = new MockAdapter(axios);
    mock
      .onPost(`${BASE_URL}/${TABLE_NAME}/${url}`)
      .reply((config) => {
        const auth = config.auth;

        if (auth?.username !== USERNAME || auth?.password !== PASSWORD)
          return [401, "Unauthorized"];

        return [200, response];
      })
      .onAny()
      .reply(404, "invalid url");

    const result = await TestModel.queryPost(url, data);
    expect(result).toEqual(response);
  });

  test("error | incorrect auth", async () => {
    const url = "some_url";
    const data = "data";
    const response = "success response";

    const mock = new MockAdapter(axios);
    mock
      .onPost(`${BASE_URL}/${TABLE_NAME}/${url}`)
      .reply((config) => {
        const auth = config.auth;

        if (
          auth?.username !== "correct username" ||
          auth?.password !== "correct password"
        )
          return [401, "Unauthorized"];

        return [200, response];
      })
      .onAny()
      .reply(404, "invalid url");

    await expect(TestModel.queryPost(url, data)).rejects.toThrow(
      "Request failed with status code 401"
    );
    await expect(TestModel.queryPost(url, data)).rejects.toThrow(AxiosError);
  });
});

describe(".queryPost | success", () => {
  test("success | get", async () => {
    const url = "some_url";
    const data = "data";
    const response = "success response";

    const mock = new MockAdapter(axios);
    mock
      .onPost(`${BASE_URL}/${TABLE_NAME}/${url}`)
      .reply((config) => {
        if (config.data === data) return [200, response];

        return [400, "incorrect response"];
      })
      .onAny()
      .reply(404, "invalid url");

    const result = await TestModel.queryPost(url, data);
    expect(result).toEqual(response);
  });

  test("error | get", async () => {
    const url = "some_url";
    const data = "data";
    const error = "success response";
    const status = 400;

    const mock = new MockAdapter(axios);
    mock
      .onPost(`${BASE_URL}/${TABLE_NAME}/${url}`)
      .reply(status, error)
      .onAny()
      .reply(404, "invalid url");

    await expect(TestModel.queryPost(url, data)).rejects.toThrow(
      "Request failed with status code 400"
    );
    await expect(TestModel.queryPost(url, data)).rejects.toThrow(AxiosError);
  });
});
