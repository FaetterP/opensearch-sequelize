# opensearch-sequelize

[Sequelize](https://www.npmjs.com/package/sequelize)-like promise-based [Node.js](https://nodejs.org/en/about/) [ORM tool](https://en.wikipedia.org/wiki/Object-relational_mapping) for [OpenSearch](<https://en.wikipedia.org/wiki/OpenSearch_(software)>).

## Installation

The package is connected via npm.

```bash
npm i opensearch-sequelize
```

## Using

Create model:

```js
import { Table, Model } from "opensearch-sequelize";

@Table({ tableName: "movies" })
export class Movies extends Model {
  name!: string;
  year!: number;
  nextPart?: string;
}
```

Connect:

```js
const sequelize = new Sequelize({
  host: "https://localhost:9200",
  username: "admin",
  password: "admin",
});
```

Using model:

```js
const movies = await Movies.findAll({
  limit: 2,
  offset: 0,
  where: {
    name: { type: "fuzzy", value: "Matrix" },
    year: 1999,
  },
});
```

## Examples

You can find examples of using methods [here](https://github.com/FaetterP/opensearch-sequelize/tree/main/examples).
