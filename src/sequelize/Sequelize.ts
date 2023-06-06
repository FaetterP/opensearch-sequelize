
import { Model } from "../model/Model";
import { SequelizeOptions } from "../types/sequelize";

export class Sequelize {
  public options: SequelizeOptions;

  constructor(options: SequelizeOptions) {
    this.options = options;

    Model.sequelize = this;
  }
}
