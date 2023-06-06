import { Model } from "../../src/model/Model";
import { Table } from "../../src/utils/decorators";

@Table({ tableName: "movies" })
export class Movies extends Model {
  name!: string;
  year!: number;
}
