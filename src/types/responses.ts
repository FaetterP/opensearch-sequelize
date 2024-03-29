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

export type FindByPkError = {
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

export type FindAllResponse = {
  took: number;
  timed_out: false;
  _shards: {
    total: number;
    successful: number;
    skipped: number;
    failed: number;
  };
  hits: {
    total: {
      value: number;
      relation: "eq";
    };
    max_score: number | null;
    hits: Hit[];
  };
};

export type CreateResponse = {
  _index: string;
  _id: string;
  _version: number;
  result: "created";
  _shards: {
    total: number;
    successful: number;
    failed: number;
  };
  _seq_no: number;
  _primary_term: number;
};

export type DeleteByPkResponse = {
  _index: string;
  _id: string;
  _version: number;
  result: "deleted";
  _shards: {
    total: number;
    successful: number;
    failed: number;
  };
  _seq_no: number;
  _primary_term: number;
};

export type DestroyByPkError404 = {
  _index: string;
  _id: string;
  _version: number;
  result: "not_found";
  _shards: {
    total: number;
    successful: number;
    failed: number;
  };
  _seq_no: number;
  _primary_term: number;
};

export type UpdateResponse = {
  _index: string;
  _id: string;
  _version: number;
  result: "updated";
  _shards: {
    total: number;
    successful: number;
    failed: number;
  };
  _seq_no: number;
  _primary_term: number;
};

export type DeleteByQueryResponse = {
  took: number;
  timed_out: false;
  total: number;
  deleted: number;
  batches: number;
  version_conflicts: number;
  noops: number;
  retries: {
    bulk: number;
    search: number;
  };
  throttled_millis: number;
  requests_per_second: number;
  throttled_until_millis: number;
  failures: any[]; // TODO
};
