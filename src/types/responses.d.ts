export type Hit = {
  _id: string;
  _index: string;
  _version: number;
  _score?: number;
  _source: {
    [key: string]: any;
  };
};

export type BaseOpensearchError = {
  error: {
    root_cause: Cause[];
    type: string;
    reason: string;
  };
  status: number;
};

type Cause = {
  type: string;
  reason: string;
  index: string;
  index_uuid: string;
};

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

export type InitResponse = {
  acknowledged: true;
  shards_acknowledged: true;
  index: string;
};

export type DropResponse = {
  acknowledged: true;
};
