import { Sequelize } from "../src/sequelize/Sequelize";
import { Movies } from "./models/Movies";

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = "0"

const sequelize = new Sequelize({
  host: "https://localhost:9200",
  username: "admin",
  password: "admin",
});

(async () => {
  const movie = await Movies.init();

  console.log(movie);
})();
