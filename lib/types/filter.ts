export interface FilterParams {
  name: string;
  country: string;
  language: string;
  position: string;
  tag: string;
  status: string;
  letter?: string;
}

export interface RetiredFilterParams {
  name: string;
  year: string;
  country: string;
  reason: string;
  position: string;
  letter?: string;
}

export interface DashboardParams {
  view: string;
  mode: string;
  filter: string;
}
