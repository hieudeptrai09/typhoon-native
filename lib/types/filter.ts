export interface FilterParams {
  name: string;
  country: string;
  language: string;
  position: string;
  tag: string;
  status: string;
}

export interface RetiredFilterParams {
  name: string;
  year: string;
  country: string;
  reason: string;
  position: string;
}

export interface DashboardParams {
  view: string;
  /** Which statistic the stats view computes; empty on the views that compute none. */
  metric: string;
  filter: string;
  mode: string;
}
