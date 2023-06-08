import { Sequelize } from "../src/sequelize/Sequelize";
import { Movies } from "./models/Movies";

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

const sequelize = new Sequelize({
  host: "https://localhost:9200",
  username: "admin",
  password: "admin",
});

(async () => {
  const report = await Movies.create({
    _id: "fixed_id",
    name: "Scott Pilgrim vs. the World",
    year: 2010,
  });
  const movie = await Movies.findByPk(report.id);
  console.log("movie1", movie);

  // _id is generated randomly
  const report2 = await Movies.create({
    name: "Total Recall",
    year: 1990,
  });
  const movie2 = await Movies.findByPk(report2.id);
  console.log("movie2", movie2);
})();
