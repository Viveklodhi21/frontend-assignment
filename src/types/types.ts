export type SpendMetrics = {
  current: number;
  reference: number;
  absoluteChange: number;
  percentChange: number;
};

export type DataItem = {
  country: string;
  state: string;
  city: string;
  sector: string;
  category: string;
  startDate: string;
  endDate: string;
  mySpend: SpendMetrics;
  sameStoreSpend: SpendMetrics;
  newStoreSpend: SpendMetrics;
  lostStoreSpend: SpendMetrics;
};

export type MetricsTableProps = {
  data: DataItem[];
  groupBy: string[];
  selectedMetrics?: string[];
  tab: number;
  dateRange: [Date, Date];
};

export interface DataRow {
  [key: string]: SpendMetrics;
}

export interface StabilizedArray<T> {
  0: T;
  1: number;
}

export type MetricKey =
  | "mySpend"
  | "sameStoreSpend"
  | "newStoreSpend"
  | "lostStoreSpend";

export type GroupItem = {
  [groupField: string]: string 
} & {
  [metric in MetricKey]?: SpendMetrics;
};

export type GroupedData = {
  [key: string]: string | SpendMetrics;
};
