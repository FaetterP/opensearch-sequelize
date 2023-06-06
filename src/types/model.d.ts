export type IndexOptions = {
  tableName?: string;
};

export type ModelStatic<M extends Model> = NonConstructor<typeof Model> & {
  new (): M;
};

type NonConstructorKeys<T> = {
  [P in keyof T]: T[P] extends new () => any ? never : P;
}[keyof T];
type NonConstructor<T> = Pick<T, NonConstructorKeys<T>>;

export type Hit = {
  _id: string;
  _index: string;
  _version: number;
  _score?: number;
  _source: {
    [key: string]: any;
  };
};
