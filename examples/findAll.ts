import { Sequelize } from "../src/sequelize/Sequelize";
import { Movies } from "./models/Movies";

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

const sequelize = new Sequelize({
  host: "https://localhost:9200",
  username: "admin",
  password: "admin",
});

(async () => {
  // const movies = await Movies.findAll({ limit: 2, offset: 0 });
  // console.log(movies);

  // const theMatrix = await Movies.findAll({ where: { name: "The Matrix" } });
  // console.log(theMatrix);

  // const movies1999 = await Movies.findAll({ where: { year: 1999 } });
  // console.log(movies1999);

  const fuzzySearch = await Movies.findAll({
    where: {
      name: { type: "fuzzy", value: "Matrix" },
      year: 1999,
    },
  });
  console.log(fuzzySearch);
})();
