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
  // Empty on the views that compute no statistic.
  metric: string;
  filter: string;
  mode: string;
}
