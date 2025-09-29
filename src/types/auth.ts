export interface ParamFetch {
  paramKey: string;
  paramValue: string | number | boolean | number[];
}

export interface SEARCH_TERMS_INTERFACE {
  fieldName: string;
  fieldValue: any;
  condition?: string;
}

export enum SEARCH_CONDITIONS {
  CONTAINS = "CONTAINS",
  EQUAL = "EQUAL",
  GREATER_THAN = "GREATER_THAN",
  GREATER_THAN_OR_EQUAL = "GREATER_THAN_OR_EQUAL",
  LESS_THAN = "LESS_THAN",
  LESS_THAN_OR_EQUAL = "LESS_THAN_OR_EQUAL",
  IN_ARRAY = "IN_ARRAY",
  NOT_EQUAL_TO = "NOT_EQUAL_TO",
  IN_RANGE = "IN_RANGE",
  IN_ORACLE_RAW_ARRAY = "IN_ORACLE_RAW_ARRAY",
}
