import { Model, Sequelize, Table } from "../../src";

const BASE_URL = "baseurl";
const USERNAME = "username";
const PASSWORD = "password";

new Sequelize({
  host: BASE_URL,
  username: USERNAME,
  password: PASSWORD,
});

describe("not connected", () => {
  test(".create", () => {
    expect(
      () =>
        new Sequelize({
          host: BASE_URL,
          username: USERNAME,
          password: PASSWORD,
        })
    ).toThrow("Sequelize already exists");
  });
});
