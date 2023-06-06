export type FindByPkResponse<M> = {
  _index: string;
  _id: string;
  _version: number;
  _seq_no: number;
  _primary_term: number;
  found: boolean;
  _source: M;
};

export type FindByFkError = {
  _index: string;
  _id: string;
  found: false;
};
