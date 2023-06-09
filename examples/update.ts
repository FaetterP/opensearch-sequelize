import { Sequelize } from "../src/sequelize/Sequelize";
import { Movies } from "./models/Movies";

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

const sequelize = new Sequelize({
  host: "https://localhost:9200",
  username: "admin",
  password: "admin",
});

(async () => {
  const reportCreate = await Movies.create({
    name: "The Matrix",
    year: 1999,
  });

  let movie = await Movies.findByPk(reportCreate.id);
  console.log("movie before update", movie); // { name, year }

  const reportUpdate = await Movies.update({
    _id: reportCreate.id,
    nextPart: "The Matrix Reloaded",
  });

  movie = await Movies.findByPk(reportUpdate.id);
  console.log("movie after update", movie); // { name, year, nextPart }
})();
