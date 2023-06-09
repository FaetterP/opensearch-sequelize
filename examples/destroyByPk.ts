import { Sequelize } from "../src/sequelize/Sequelize";
import { Movies } from "./models/Movies";

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

const sequelize = new Sequelize({
  host: "https://localhost:9200",
  username: "admin",
  password: "admin",
});

(async () => {
  const resultCreate = await Movies.create({ name: "", year: 2000 });
  console.log(`create document with id '${resultCreate.id}'`);

  const resultDelete = await Movies.destroyByPk(resultCreate.id);
  console.log("resultDelete", resultDelete);
})();
